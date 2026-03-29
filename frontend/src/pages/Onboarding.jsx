import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../store'
import { Check, Globe, Zap, Pencil, Sparkles, ArrowRight, Loader2, ChevronRight } from 'lucide-react'

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X']
const TOTAL_STEPS = 4

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [brandData, setBrandData] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const navigate = useNavigate()
  const { setOnboardingComplete } = useStore()

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const analyzeWebsite = async () => {
    if (!websiteUrl.trim()) return
    setAnalyzing(true)
    try {
      let url = websiteUrl.trim()
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url
      const { data } = await api.post('/brand/analyze-url', { url })
      setBrandData(data)
      // Small delay so user sees the animation finish
      setTimeout(() => {
        setAnalyzing(false)
        setStep(2)
      }, 600)
    } catch (e) {
      setAnalyzing(false)
      alert('Could not analyze that URL. Please check and try again.')
    }
  }

  const updateBrandField = (field, value) => {
    setBrandData(prev => ({ ...prev, [field]: value }))
    setEditingField(null)
  }

  const updateAudienceField = (field, value) => {
    setBrandData(prev => ({
      ...prev,
      target_audience: { ...prev.target_audience, [field]: value }
    }))
    setEditingField(null)
  }

  const finish = async () => {
    try {
      await api.put('/brand', {
        brand_name: brandData?.brand_name || '',
        industry: brandData?.industry || '',
        description: brandData?.description || '',
        tone: brandData?.tone?.toLowerCase() || 'casual',
        website: brandData?.website || websiteUrl,
        audience: brandData?.target_audience || {},
        pillars: brandData?.key_benefits || [],
        onboarding_complete: true,
      })
    } catch (e) {
      console.error('Failed to save brand config', e)
    }
    setOnboardingComplete(true)
    navigate('/home')
  }

  const ProgressBar = () => (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#EA580C] w-10' : 'bg-gray-200 w-8'}`} />
      ))}
    </div>
  )

  const Header = () => (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#EA580C] rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-black text-xl tracking-tight">Fastlane</span>
      </div>
      <ProgressBar />
    </div>
  )

  /* ── Step 1: Website URL Input ── */
  const StepWebsite = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
          <Globe size={32} className="text-[#EA580C]" />
        </div>
        <h2 className="text-3xl font-bold mb-2 tracking-tight">Enter your website</h2>
        <p className="text-gray-500 text-lg">We instantly learn your product, audience, and tone.</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Globe size={20} />
        </div>
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyzeWebsite()}
          placeholder="yourcompany.com"
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 outline-none transition-all bg-white"
          autoFocus
        />
      </div>

      <button
        onClick={analyzeWebsite}
        disabled={!websiteUrl.trim() || analyzing}
        className="w-full py-4 bg-[#EA580C] hover:bg-[#DC4F08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-lg flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analyzing your brand...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Analyze My Brand
          </>
        )}
      </button>

      {analyzing && (
        <div className="mt-8">
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 size={18} className="animate-spin text-[#EA580C]" />
              <span className="text-sm font-medium text-[#EA580C]">Scanning your website...</span>
            </div>
            <div className="space-y-3">
              {['Reading your homepage', 'Identifying your brand voice', 'Detecting target audience', 'Extracting key messaging'].map((label, i) => (
                <div key={label} className="flex items-center gap-3" style={{ animationDelay: `${i * 0.5}s` }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i < 2 ? 'bg-[#EA580C] text-white' : 'bg-orange-100 text-orange-300'}`}>
                    {i < 2 ? <Check size={12} /> : <span className="block w-2 h-2 bg-orange-300 rounded-full animate-pulse" />}
                  </div>
                  <span className={`text-sm ${i < 2 ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-gray-400 text-sm mt-4">You can always edit the results later</p>
    </div>
  )

  /* ── Step 2: Brand Analysis Results ── */
  const StepBrandResults = () => {
    if (!brandData) return null

    const fields = [
      { key: 'brand_name', label: 'Brand Name', value: brandData.brand_name },
      { key: 'industry', label: 'Industry', value: brandData.industry },
      { key: 'description', label: 'Description', value: brandData.description, multiline: true },
      { key: 'tone', label: 'Tone of Voice', value: brandData.tone },
    ]

    const audienceFields = [
      { key: 'demographic', label: 'Demographic', value: brandData.target_audience?.demographic },
      { key: 'interests', label: 'Interests', value: brandData.target_audience?.interests },
      { key: 'painPoints', label: 'Pain Points', value: brandData.target_audience?.painPoints },
    ]

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1 tracking-tight">We analyzed {brandData.domain}</h2>
          <p className="text-gray-500">Review and edit your brand profile</p>
        </div>

        {/* Brand info card */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#EA580C]" />
            <span className="text-xs font-semibold text-[#EA580C] uppercase tracking-wide">Brand Profile</span>
          </div>

          {fields.map(f => (
            <div key={f.key} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{f.label}</span>
                <button onClick={() => setEditingField(editingField === f.key ? null : f.key)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil size={12} className="text-gray-400" />
                </button>
              </div>
              {editingField === f.key ? (
                f.multiline ? (
                  <textarea
                    defaultValue={f.value}
                    onBlur={(e) => updateBrandField(f.key, e.target.value)}
                    className="w-full p-2 border border-[#EA580C] rounded-lg text-sm focus:outline-none resize-none"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <input
                    defaultValue={f.value}
                    onBlur={(e) => updateBrandField(f.key, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateBrandField(f.key, e.target.value)}
                    className="w-full p-2 border border-[#EA580C] rounded-lg text-sm focus:outline-none"
                    autoFocus
                  />
                )
              ) : (
                <p className="text-sm text-gray-700 cursor-pointer hover:text-gray-900" onClick={() => setEditingField(f.key)}>{f.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Target audience card */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#EA580C]" />
            <span className="text-xs font-semibold text-[#EA580C] uppercase tracking-wide">Target Audience</span>
          </div>
          {audienceFields.map(f => (
            <div key={f.key} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{f.label}</span>
                <button onClick={() => setEditingField(editingField === `aud_${f.key}` ? null : `aud_${f.key}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil size={12} className="text-gray-400" />
                </button>
              </div>
              {editingField === `aud_${f.key}` ? (
                <input
                  defaultValue={f.value}
                  onBlur={(e) => updateAudienceField(f.key, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateAudienceField(f.key, e.target.value)}
                  className="w-full p-2 border border-[#EA580C] rounded-lg text-sm focus:outline-none"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-gray-700 cursor-pointer hover:text-gray-900" onClick={() => setEditingField(`aud_${f.key}`)}>{f.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Key benefits */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#EA580C]" />
            <span className="text-xs font-semibold text-[#EA580C] uppercase tracking-wide">Key Benefits</span>
          </div>
          <div className="space-y-2">
            {brandData.key_benefits?.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={14} className="text-[#EA580C] flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(1)} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all">Back</button>
          <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#EA580C] hover:bg-[#DC4F08] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            Looks Good <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  /* ── Step 3: Select Platforms ── */
  const StepPlatforms = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2 tracking-tight">Where do you post?</h2>
      <p className="text-gray-500 text-center mb-6">Select all your platforms</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {PLATFORMS.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPlatforms(toggle(selectedPlatforms, p))}
            className={`p-4 rounded-xl border-2 font-semibold transition-all text-left ${
              selectedPlatforms.includes(p)
                ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center justify-between">
              {p}
              {selectedPlatforms.includes(p) && <Check size={16} />}
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all">Back</button>
        <button onClick={() => setStep(4)} disabled={selectedPlatforms.length === 0} className="flex-1 py-3 bg-[#EA580C] hover:bg-[#DC4F08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )

  /* ── Step 4: Confirm & Go ── */
  const StepConfirm = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
          <Zap size={32} className="text-[#EA580C]" />
        </div>
        <h2 className="text-2xl font-bold mb-1 tracking-tight">You're all set!</h2>
        <p className="text-gray-500">Here's a summary of your brand setup</p>
      </div>

      <div className="space-y-3 mb-8">
        {/* Website */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <Globe size={18} className="text-[#EA580C] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase">Website</p>
            <p className="text-sm font-medium text-gray-700 truncate">{brandData?.domain || websiteUrl}</p>
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <Sparkles size={18} className="text-[#EA580C] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase">Brand</p>
            <p className="text-sm font-medium text-gray-700">{brandData?.brand_name} &middot; {brandData?.industry}</p>
          </div>
        </div>

        {/* Tone */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <Pencil size={18} className="text-[#EA580C] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase">Tone</p>
            <p className="text-sm font-medium text-gray-700">{brandData?.tone}</p>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <ChevronRight size={18} className="text-[#EA580C] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase">Platforms</p>
            <p className="text-sm font-medium text-gray-700">{selectedPlatforms.join(', ')}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(3)} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all">Back</button>
        <button onClick={finish} className="flex-1 py-4 bg-[#EA580C] hover:bg-[#DC4F08] text-white font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2">
          <Zap size={20} />
          Start Creating Content
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Header />
        {step === 1 && <StepWebsite />}
        {step === 2 && <StepBrandResults />}
        {step === 3 && <StepPlatforms />}
        {step === 4 && <StepConfirm />}
      </div>
    </div>
  )
}
