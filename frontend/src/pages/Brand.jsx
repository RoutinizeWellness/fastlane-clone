import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useStore } from '../store'

export default function Brand() {
  const { user } = useStore()
  const [config, setConfig] = useState({
    brand_name: 'cvedbug',
    industry: 'B2B SaaS',
    website: 'cvdebug.com',
    language: 'es',
    description: '',
    core_identity: 'cvedbug is a web-based platform that specializes in optimizing resumes for compatibility with Applicant Tracking Systems (ATS) used by major employers.',
    product_offering: 'cvedbug offers a resume analysis service leveraging proprietary Robot View technology, providing ATS compatibility scoring, keyword gap analysis, and formatting feedback to improve job seekers\' chances of passing ATS screenings.',
    unique_benefits: 'cvedbug\'s unique benefits include 99% parsing accuracy with instant, realistic ATS simulations and specialized industry optimizations, offering unmatched precision and tailored enhancements compared to competitors.',
    problem_solution: 'cvedbug efficiently addresses the issue of ATS rejection by providing job seekers with clear insights on parsing errors, missing keywords, and formatting mistakes, significantly increasing their visibility in automated recruitment processes.',
    mission: 'CVDebug\'s mission is to empower job seekers by demystifying the ATS screening process and enhancing resume compatibility, ultimately improving employment access and opportunities across diverse industries.',
    why_care: 'People should care about CVDebug because it tackles the critical barrier many face when job searching: ATS rejection.',
    differentiation: 'CVDebug differentiates itself with its unique Robot View technology, offering unprecedented insight into how resumes are interpreted by ATS systems.',
    brand_resonance: 'What resonates uniquely about CVDebug is its ability to provide transparency and control to job seekers in the automated resume screening process.'
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('content-hub')

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/brand', { brand_name: config.brand_name, industry: config.industry, description: config.core_identity, tone: 'professional' })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '24px 28px' }} className="animate-fade-up">
      {/* Brand header */}
      <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>
            {config.brand_name[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{config.brand_name}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{config.website} · {config.language}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('content-hub')} style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: tab === 'content-hub' ? '#111827' : 'white', color: tab === 'content-hub' ? 'white' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Content Hub</button>
          <button onClick={() => setTab('discord')} style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: tab === 'discord' ? '#111827' : 'white', color: tab === 'discord' ? 'white' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Discord</button>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Identity & Product */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Identity & Product</span>
            <button onClick={save} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{saving ? 'Saving...' : saved ? '✓ Saved' : 'Edit'}</button>
          </div>
          {[
            { key: 'core_identity', label: 'CORE IDENTITY' },
            { key: 'product_offering', label: 'PRODUCT OFFERING' },
            { key: 'unique_benefits', label: 'UNIQUE BENEFITS' },
            { key: 'problem_solution', label: 'PROBLEM SOLUTION' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{config[f.key]}</p>
            </div>
          ))}
        </div>

        {/* Purpose & Positioning */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Purpose & Positioning</span>
            <button style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
          </div>
          {[
            { key: 'mission', label: 'MISSION' },
            { key: 'why_care', label: 'WHY CARE' },
            { key: 'differentiation', label: 'DIFFERENTIATION' },
            { key: 'brand_resonance', label: 'BRAND RESONANCE' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{config[f.key]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
