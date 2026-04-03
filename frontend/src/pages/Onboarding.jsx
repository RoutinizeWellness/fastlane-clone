import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../store'
import { Check, Loader2, Globe, ArrowRight, SkipForward } from 'lucide-react'

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X']
const NICHES = ['Fitness', 'Finance', 'Tech', 'Food', 'Travel', 'Business', 'Lifestyle', 'Gaming', 'Beauty', 'Education', 'SaaS', 'E-Commerce', 'Agency', 'Health', 'Real Estate']

const NICHE_MAP = {
  'technology': 'Tech',
  'software': 'Tech',
  'saas': 'SaaS',
  'e-commerce': 'E-Commerce',
  'ecommerce': 'E-Commerce',
  'retail': 'E-Commerce',
  'marketing': 'Agency',
  'agency': 'Agency',
  'finance': 'Finance',
  'fintech': 'Finance',
  'health': 'Health',
  'healthcare': 'Health',
  'fitness': 'Fitness',
  'food': 'Food',
  'travel': 'Travel',
  'education': 'Education',
  'gaming': 'Gaming',
  'beauty': 'Beauty',
  'real estate': 'Real Estate',
  'lifestyle': 'Lifestyle',
  'business': 'Business',
}

function mapIndustryToNiche(industry) {
  if (!industry) return ''
  const lower = industry.toLowerCase()
  for (const [key, val] of Object.entries(NICHE_MAP)) {
    if (lower.includes(key)) return val
  }
  return ''
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState({ platforms: [], niche: '', tone: '' })
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const navigate = useNavigate()
  const { setOnboardingComplete, setBrand } = useStore()

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const analyzeUrl = async () => {
    if (!websiteUrl.trim()) return
    setAnalyzing(true)
    setAnalysisError('')
    setAnalysisResult(null)
    try {
      const { data } = await api.post('/brand/analyze-url', { url: websiteUrl.trim() })
      setAnalysisResult(data.analysis)
      const matchedNiche = mapIndustryToNiche(data.analysis?.industry)
      if (matchedNiche) {
        setSelected(prev => ({ ...prev, niche: matchedNiche }))
      }
    } catch (err) {
      setAnalysisError(err.response?.data?.error || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  const skipUrl = () => {
    setStep(1)
  }

  const confirmAnalysis = () => {
    setStep(1)
  }

  const finish = async () => {
    try {
      // Build full brand payload including analysis data
      const brandPayload = {
        industry: selected.niche,
        tone: selected.tone?.toLowerCase() || 'casual',
        website_url: websiteUrl.trim() || undefined,
      }
      // If we have analysis results, include them
      if (analysisResult) {
        brandPayload.brand_name = analysisResult.brand_name || ''
        brandPayload.description = analysisResult.tagline || analysisResult.product_type || ''
      }
      await api.put('/brand', brandPayload)

      // Update frontend store with brand data
      const storeBrand = {
        brandName: analysisResult?.brand_name || '',
        industry: selected.niche,
        tone: selected.tone?.toLowerCase() || 'casual',
        website: websiteUrl.trim() || '',
        description: analysisResult?.tagline || analysisResult?.product_type || '',
        targetAudience: analysisResult?.target_audience || '',
        productName: analysisResult?.product_type || '',
        tagline: analysisResult?.tagline || '',
      }
      setBrand(storeBrand)
    } catch {}
    setOnboardingComplete(true)
    navigate('/home')
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center"><span className="text-white font-bold">F</span></div>
            <span className="font-black text-xl">Fastlane</span>
          </div>
          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2,3].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">Enter your website or landing page URL</h2>
            <p className="text-gray-500 text-center mb-6">We will analyze your brand to personalize all generated content</p>

            <div className="mb-4">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-brand-primary transition-colors">
                <Globe size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeUrl()}
                  className="w-full outline-none text-sm bg-transparent"
                  disabled={analyzing}
                />
              </div>
            </div>

            {analysisError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {analysisError}
              </div>
            )}

            {analysisResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm font-semibold text-green-800 mb-1">We detected:</div>
                <div className="text-sm text-green-700">
                  <strong>{analysisResult.brand_name}</strong> - {analysisResult.product_type} targeting {analysisResult.target_audience}
                </div>
                {analysisResult.tagline && (
                  <div className="text-xs text-green-600 mt-1 italic">"{analysisResult.tagline}"</div>
                )}
                {analysisResult.key_terms && analysisResult.key_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {analysisResult.key_terms.map((t, i) => (
                      <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {!analysisResult ? (
                <>
                  <button
                    onClick={analyzeUrl}
                    disabled={!websiteUrl.trim() || analyzing}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <button
                    onClick={skipUrl}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:border-gray-300 transition-colors flex items-center gap-1"
                  >
                    <SkipForward size={14} />
                    Skip
                  </button>
                </>
              ) : (
                <button onClick={confirmAnalysis} className="btn-primary w-full py-3">
                  Looks good, continue
                </button>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">Where do you post?</h2>
            <p className="text-gray-500 text-center mb-6">Select all your platforms</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setSelected({...selected, platforms: toggle(selected.platforms, p)})}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all text-left ${selected.platforms.includes(p) ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  <span className="flex items-center justify-between">{p} {selected.platforms.includes(p) && <Check size={16} />}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={selected.platforms.length === 0} className="btn-primary w-full py-3">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">What is your niche?</h2>
            <p className="text-gray-500 text-center mb-6">We will tailor content to your audience</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {NICHES.map(n => (
                <button key={n} onClick={() => setSelected({...selected, niche: n})}
                  className={`p-3 rounded-xl border-2 font-medium transition-all text-sm ${selected.niche === n ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(3)} disabled={!selected.niche} className="btn-primary w-full py-3">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">Your content style?</h2>
            <p className="text-gray-500 text-center mb-6">How do you talk to your audience?</p>
            <div className="space-y-3 mb-8">
              {['Casual & Fun', 'Professional', 'Educational', 'Inspirational', 'Entertaining'].map(t => (
                <button key={t} onClick={() => setSelected({...selected, tone: t})}
                  className={`w-full p-4 rounded-xl border-2 font-medium transition-all text-left flex items-center justify-between ${selected.tone === t ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  {t} {selected.tone === t && <Check size={16} />}
                </button>
              ))}
            </div>
            <button onClick={finish} disabled={!selected.tone} className="btn-primary w-full py-3">Start Creating Content</button>
          </div>
        )}
      </div>
    </div>
  )
}
