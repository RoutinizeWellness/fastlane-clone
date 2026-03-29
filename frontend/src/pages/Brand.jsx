import { useState, useEffect } from 'react'
import { Loader2, Globe, RefreshCw, Save, Check, Edit3, X } from 'lucide-react'
import api from '../lib/api'
import { useStore } from '../store'

export default function Brand() {
  const { user } = useStore()
  const [config, setConfig] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [urlInput, setUrlInput] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [configRes, analysisRes] = await Promise.all([
        api.get('/brand'),
        api.get('/brand/analysis')
      ])
      setConfig(configRes.data)
      setAnalysis(analysisRes.data)
      setUrlInput(configRes.data?.website_url || '')
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const reanalyze = async () => {
    const url = urlInput.trim()
    if (!url) return
    setAnalyzing(true)
    try {
      const { data } = await api.post('/brand/analyze-url', { url })
      setAnalysis(data.analysis)
      await loadData()
    } catch {} finally {
      setAnalyzing(false)
    }
  }

  const startEditing = () => {
    setEditing(true)
    setEditData({
      brand_name: config?.brand_name || analysis?.brand_name || '',
      industry: config?.industry || analysis?.industry || '',
      tone: config?.tone || analysis?.tone || '',
      description: config?.description || '',
      website_url: config?.website_url || '',
      target_audience: analysis?.target_audience || '',
      product_type: analysis?.product_type || '',
      tagline: analysis?.tagline || '',
      key_terms: Array.isArray(analysis?.key_terms) ? analysis.key_terms.join(', ') : (analysis?.key_terms || ''),
    })
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      await api.put('/brand', {
        brand_name: editData.brand_name,
        industry: editData.industry,
        description: editData.description || editData.tagline,
        tone: editData.tone,
        website_url: editData.website_url,
        colors: config?.colors || [],
        pillars: config?.pillars || [],
        audience: config?.audience || {}
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditing(false)
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    )
  }

  const brandName = config?.brand_name || analysis?.brand_name || 'Your Brand'
  const websiteUrl = config?.website_url || analysis?.website_url || ''
  const industry = config?.industry || analysis?.industry || ''
  const tone = config?.tone || analysis?.tone || ''
  const productType = analysis?.product_type || ''
  const targetAudience = analysis?.target_audience || ''
  const tagline = analysis?.tagline || config?.description || ''
  const keyTerms = analysis?.key_terms || []
  const brandColors = analysis?.brand_colors || config?.colors || []

  return (
    <div style={{ padding: '24px 28px' }} className="animate-fade-up">
      {/* Brand header */}
      <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: (Array.isArray(brandColors) && brandColors[0]) || '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
            {brandName[0]?.toUpperCase() || 'B'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{brandName}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {websiteUrl && <span>{websiteUrl}</span>}
              {industry && <span>{websiteUrl ? ' \u00B7 ' : ''}{industry}</span>}
              {productType && <span> \u00B7 {productType}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('overview')} style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: tab === 'overview' ? '#111827' : 'white', color: tab === 'overview' ? 'white' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Overview</button>
          <button onClick={() => setTab('analysis')} style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: tab === 'analysis' ? '#111827' : 'white', color: tab === 'analysis' ? 'white' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Analysis</button>
        </div>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Website URL card */}
          <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={16} /> Website URL
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://yourwebsite.com"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
              <button
                onClick={reanalyze}
                disabled={analyzing || !urlInput.trim()}
                style={{ padding: '8px 16px', background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: analyzing || !urlInput.trim() ? 0.5 : 1 }}
              >
                {analyzing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {analyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
            </div>
          </div>

          {/* Brand Attributes */}
          <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Brand Attributes</span>
              {!editing ? (
                <button onClick={startEditing} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Edit3 size={12} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={saveChanges} disabled={saving} style={{ fontSize: 12, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Save size={12} />}
                    {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'brand_name', label: 'BRAND NAME' },
                  { key: 'industry', label: 'INDUSTRY' },
                  { key: 'product_type', label: 'PRODUCT TYPE' },
                  { key: 'tone', label: 'TONE' },
                  { key: 'target_audience', label: 'TARGET AUDIENCE' },
                  { key: 'tagline', label: 'TAGLINE' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                    <input
                      value={editData[f.key] || ''}
                      onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>KEY TERMS (comma-separated)</div>
                  <input
                    value={editData.key_terms || ''}
                    onChange={e => setEditData({ ...editData, key_terms: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            ) : (
              <>
                {[
                  { label: 'BRAND NAME', value: brandName },
                  { label: 'INDUSTRY', value: industry },
                  { label: 'PRODUCT TYPE', value: productType },
                  { label: 'TONE', value: tone },
                  { label: 'TARGET AUDIENCE', value: targetAudience },
                  { label: 'TAGLINE', value: tagline },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                    <p style={{ fontSize: 13, color: f.value ? '#374151' : '#9CA3AF', lineHeight: 1.6, margin: 0 }}>{f.value || 'Not set'}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Key Terms & Colors */}
          <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 16 }}>Key Terms & Colors</span>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8 }}>KEY TERMS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.isArray(keyTerms) && keyTerms.length > 0 ? keyTerms.map((term, i) => (
                  <span key={i} style={{ fontSize: 12, background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>{term}</span>
                )) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>No key terms yet. Analyze a URL to extract them.</span>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8 }}>BRAND COLORS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Array.isArray(brandColors) && brandColors.length > 0 ? brandColors.map((color, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{color}</span>
                  </div>
                )) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>No colors detected yet.</span>
                )}
              </div>
            </div>

            {config?.pillars && Array.isArray(config.pillars) && config.pillars.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8 }}>CONTENT PILLARS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {config.pillars.map((p, i) => (
                    <span key={i} style={{ fontSize: 12, background: '#FFF7ED', color: '#EA580C', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'analysis' && (
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 16 }}>Latest Brand Analysis</span>
          {analysis ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'BRAND NAME', value: analysis.brand_name },
                { label: 'PRODUCT TYPE', value: analysis.product_type },
                { label: 'INDUSTRY', value: analysis.industry },
                { label: 'TONE', value: analysis.tone },
                { label: 'TARGET AUDIENCE', value: analysis.target_audience },
                { label: 'TAGLINE', value: analysis.tagline },
                { label: 'WEBSITE', value: analysis.website_url },
                { label: 'ANALYZED AT', value: analysis.analyzed_at },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                  <p style={{ fontSize: 13, color: f.value ? '#374151' : '#9CA3AF', lineHeight: 1.6, margin: 0 }}>{f.value || 'N/A'}</p>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8 }}>KEY TERMS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.isArray(analysis.key_terms) && analysis.key_terms.map((t, i) => (
                    <span key={i} style={{ fontSize: 12, background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8 }}>BRAND COLORS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Array.isArray(analysis.brand_colors) && analysis.brand_colors.map((color, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                      <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
              <Globe size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 14 }}>No analysis yet. Enter a website URL above and click "Re-analyze" to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
