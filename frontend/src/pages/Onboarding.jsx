import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Check } from 'lucide-react'

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X']
const NICHES = ['Fitness', 'Finance', 'Tech', 'Food', 'Travel', 'Business', 'Lifestyle', 'Gaming', 'Beauty', 'Education']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState({ platforms: [], niche: '', tone: '' })
  const navigate = useNavigate()

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const finish = async () => {
    try {
      await api.put('/brand', { industry: selected.niche, tone: selected.tone?.toLowerCase() || 'casual' })
    } catch {}
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center"><span className="text-white">⚡</span></div>
            <span className="font-black text-xl">Fastlane</span>
          </div>
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

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
            <button onClick={() => setStep(2)} disabled={selected.platforms.length === 0} className="btn-primary w-full py-3">Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">What's your niche?</h2>
            <p className="text-gray-500 text-center mb-6">We'll tailor content to your audience</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {NICHES.map(n => (
                <button key={n} onClick={() => setSelected({...selected, niche: n})}
                  className={`p-3 rounded-xl border-2 font-medium transition-all ${selected.niche === n ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(3)} disabled={!selected.niche} className="btn-primary w-full py-3">Continue →</button>
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
            <button onClick={finish} disabled={!selected.tone} className="btn-primary w-full py-3">🚀 Start Creating Content</button>
          </div>
        )}
      </div>
    </div>
  )
}
