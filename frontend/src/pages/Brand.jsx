import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, Globe, ExternalLink } from 'lucide-react'
import api from '../lib/api'
import { useStore } from '../store'

// All editable brand fields grouped into sections
const IDENTITY_FIELDS = [
  { key: 'brandName', label: 'BRAND NAME' },
  { key: 'productName', label: 'PRODUCT NAME' },
  { key: 'industry', label: 'INDUSTRY' },
  { key: 'description', label: 'DESCRIPTION', multiline: true },
  { key: 'benefits', label: 'UNIQUE BENEFITS', multiline: true },
]

const POSITIONING_FIELDS = [
  { key: 'targetAudience', label: 'TARGET AUDIENCE', multiline: true },
  { key: 'tone', label: 'BRAND TONE' },
  { key: 'tagline', label: 'TAGLINE' },
]

export default function Brand() {
  const { brand, setBrand, updateBrandField } = useStore()
  const [editing, setEditing] = useState(null) // which section is being edited: 'identity' | 'positioning' | null
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [tab, setTab] = useState('content-hub')

  // Sync draft when entering edit mode
  const startEdit = (section) => {
    setDraft({ ...brand })
    setEditing(section)
  }

  const cancelEdit = () => {
    setDraft({})
    setEditing(null)
  }

  const saveBrand = async () => {
    setSaving(true)
    try {
      // Persist to store + localStorage
      setBrand(draft)
      // Also attempt API save (best effort)
      try {
        await api.put('/brand', {
          brand_name: draft.brandName,
          industry: draft.industry,
          description: draft.description,
          tone: draft.tone,
          target_audience: draft.targetAudience,
          benefits: draft.benefits,
          product_name: draft.productName,
          tagline: draft.tagline,
          website: draft.website,
        })
      } catch (_) { /* API may not exist yet */ }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const reanalyzeWebsite = async () => {
    if (!brand?.website) return
    setReanalyzing(true)
    try {
      const res = await api.post('/brand/analyze', { website: brand.website })
      if (res.data) {
        setBrand({ ...brand, ...res.data })
      }
    } catch (_) {
      /* API may not exist yet */
    } finally {
      setReanalyzing(false)
    }
  }

  const displayName = brand?.brandName || 'Your Brand'
  const displayInitial = displayName[0]?.toUpperCase() || 'B'

  // Helper: render a field as text or input depending on edit state
  const renderField = (f, section) => {
    const isEditing = editing === section
    const value = isEditing ? (draft[f.key] || '') : (brand?.[f.key] || '')

    return (
      <div key={f.key} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
        {isEditing ? (
          f.multiline ? (
            <textarea
              value={value}
              onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
              style={{
                width: '100%', minHeight: 72, padding: '8px 10px', fontSize: 13, color: '#374151',
                lineHeight: 1.6, border: '1px solid #E5E7EB', borderRadius: 8, resize: 'vertical',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
              style={{
                width: '100%', padding: '8px 10px', fontSize: 13, color: '#374151',
                border: '1px solid #E5E7EB', borderRadius: 8, fontFamily: 'inherit', outline: 'none',
              }}
            />
          )
        ) : (
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
            {value || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>Not set</span>}
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 28px' }} className="animate-fade-up">
      {/* Brand header */}
      <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>
            {displayInitial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              {brand?.website ? (
                <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Globe size={11} />
                  {brand.website}
                  <ExternalLink size={10} />
                </a>
              ) : (
                <span>No website set</span>
              )}
              {brand?.industry && <span> · {brand.industry}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Re-analyze website button */}
          <button
            onClick={reanalyzeWebsite}
            disabled={reanalyzing || !brand?.website}
            style={{
              padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
              background: 'white', color: '#374151', fontSize: 13, fontWeight: 500,
              cursor: reanalyzing || !brand?.website ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: !brand?.website ? 0.5 : 1,
            }}
          >
            <RefreshCw size={13} className={reanalyzing ? 'animate-spin' : ''} />
            {reanalyzing ? 'Analyzing...' : 'Re-analyze website'}
          </button>
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
            {editing === 'identity' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={cancelEdit} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={saveBrand} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => startEdit('identity')} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {saved ? '✓ Saved' : 'Edit'}
              </button>
            )}
          </div>
          {/* Website field */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 4 }}>WEBSITE</div>
            {editing === 'identity' ? (
              <input
                type="text"
                value={draft.website || ''}
                onChange={e => setDraft(d => ({ ...d, website: e.target.value }))}
                placeholder="https://yourbrand.com"
                style={{
                  width: '100%', padding: '8px 10px', fontSize: 13, color: '#374151',
                  border: '1px solid #E5E7EB', borderRadius: 8, fontFamily: 'inherit', outline: 'none',
                }}
              />
            ) : (
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                {brand?.website || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>Not set</span>}
              </p>
            )}
          </div>
          {IDENTITY_FIELDS.map(f => renderField(f, 'identity'))}
        </div>

        {/* Purpose & Positioning */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Purpose & Positioning</span>
            {editing === 'positioning' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={cancelEdit} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={saveBrand} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => startEdit('positioning')} style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {saved ? '✓ Saved' : 'Edit'}
              </button>
            )}
          </div>
          {POSITIONING_FIELDS.map(f => renderField(f, 'positioning'))}
        </div>
      </div>
    </div>
  )
}
