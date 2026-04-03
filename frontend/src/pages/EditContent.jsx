import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Film, Check, ChevronRight, Palette, Type, RefreshCw } from 'lucide-react'
import api from '../lib/api'

// Inject keyframes
if (typeof document !== 'undefined' && !document.getElementById('__edit_kf')) {
  const s = document.createElement('style')
  s.id = '__edit_kf'
  s.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
  document.head.appendChild(s)
}

const STATE_COLORS = {
  generated: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Generated' },
  edited: { bg: '#FEF3C7', text: '#92400E', label: 'Edited' },
  approved: { bg: '#DCFCE7', text: '#15803D', label: 'Approved' },
  scheduled: { bg: '#EDE9FE', text: '#5B21B6', label: 'Scheduled' },
  published: { bg: '#F0FDF4', text: '#166534', label: 'Published' },
}

const SLIDE_COLORS = ['#6C3CE1','#E84393','#00B894','#0984E3','#FD7E14','#E17055','#00CEC9','#A29BFE']

export default function EditContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [composition, setComposition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [renderUrl, setRenderUrl] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/content-items/${id}`)
      setItem(data)
      setComposition(data.composition || JSON.parse(data.composition_json || '{}'))
      setRenderUrl(data.render_url)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load content item')
    } finally {
      setLoading(false)
    }
  }

  const updateText = useCallback((role, value) => {
    setComposition(prev => {
      const next = { ...prev }
      // Update textBlocks
      if (next.textBlocks) {
        next.textBlocks = next.textBlocks.map(b =>
          b.role === role ? { ...b, text: value } : b
        )
      }
      // Update pass-through fields
      if (role === 'hook') next.hook = value
      if (role === 'body') { next.body = value; next.text = value }
      if (role === 'top_text') next.topText = value
      if (role === 'bottom_text') next.bottomText = value
      if (role === 'brand_watermark') next.brandName = value
      // Update slides
      if (next.slides) {
        const idx = parseInt(role.replace('slide_title_', '').replace('slide_body_', ''))
        if (role.startsWith('slide_title_') && next.slides[idx]) {
          next.slides = [...next.slides]
          next.slides[idx] = { ...next.slides[idx], title: value }
        }
        if (role.startsWith('slide_body_') && next.slides[idx]) {
          next.slides = [...next.slides]
          next.slides[idx] = { ...next.slides[idx], body: value }
        }
      }
      return next
    })
    setDirty(true)
  }, [])

  const updateStyle = useCallback((key, value) => {
    setComposition(prev => {
      const next = { ...prev }
      if (key === 'accentColor') next.accentColor = value
      if (key === 'backgroundColor') next.backgroundColor = value
      if (key === 'textColor' && next.textBlocks) {
        next.textBlocks = next.textBlocks.map(b =>
          !['brand_watermark', 'hook_badge', 'meme_badge'].includes(b.role)
            ? { ...b, color: value }
            : b
        )
      }
      return next
    })
    setDirty(true)
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const textUpdates = {}
      const styleUpdates = {}

      // Build text updates from composition
      if (composition.textBlocks) {
        composition.textBlocks.forEach(b => {
          textUpdates[b.role] = b.text
        })
      }
      if (composition.slides) {
        composition.slides.forEach((s, i) => {
          textUpdates[`slide_title_${i}`] = s.title
          textUpdates[`slide_body_${i}`] = s.body
        })
      }

      styleUpdates.color_accent = composition.accentColor
      styleUpdates.color_background = composition.backgroundColor

      await api.post(`/content-items/${id}/edit`, { textUpdates, styleUpdates })
      setDirty(false)
      setItem(prev => ({ ...prev, state: 'edited' }))
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleRender = async () => {
    try {
      setRendering(true)
      // Save first if dirty
      if (dirty) await handleSave()
      const { data } = await api.post(`/content-items/${id}/render`, {})
      setRenderUrl(data.url)
    } catch (e) {
      setError(e.response?.data?.error || 'Render failed')
    } finally {
      setRendering(false)
    }
  }

  const handleApprove = async () => {
    try {
      await api.patch(`/content-items/${id}/state`, { state: 'approved' })
      setItem(prev => ({ ...prev, state: 'approved' }))
    } catch (e) {
      setError(e.response?.data?.error || 'State transition failed')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94A3B8' }}>
        Loading...
      </div>
    )
  }

  if (error && !item) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#EF4444', marginBottom: 16 }}>{error}</div>
        <button onClick={() => navigate(-1)} style={btnStyle}>Go Back</button>
      </div>
    )
  }

  const state = STATE_COLORS[item?.state] || STATE_COLORS.generated
  const type = composition?.compositionId || item?.type || 'Unknown'

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left panel — Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', borderRight: '1px solid #1E293B' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ ...iconBtn, marginRight: 4 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>{item?.title || 'Edit Content'}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12, backgroundColor: state.bg, color: state.text, fontWeight: 600 }}>
                {state.label}
              </span>
              <span style={{ fontSize: 12, color: '#64748B' }}>{type}</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '8px 14px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
            <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer' }}>x</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1E293B', paddingBottom: 1 }}>
          {[{ id: 'text', label: 'Text', icon: Type }, { id: 'style', label: 'Style', icon: Palette }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #8B5CF6' : '2px solid transparent',
                color: activeTab === tab.id ? '#8B5CF6' : '#64748B',
                background: 'transparent',
              }}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Text editing tab */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Text blocks from composition */}
            {composition?.textBlocks?.filter(b => b.role !== 'brand_watermark').map(block => (
              <FieldEditor
                key={block.role}
                label={block.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                value={block.text}
                onChange={v => updateText(block.role, v)}
                multiline={block.role === 'body'}
              />
            ))}

            {/* Slide editing */}
            {composition?.slides?.map((slide, i) => (
              <div key={i} style={{ padding: 16, backgroundColor: '#0F172A', borderRadius: 12, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6', marginBottom: 10 }}>Slide {i + 1}</div>
                <FieldEditor label="Title" value={slide.title} onChange={v => updateText(`slide_title_${i}`, v)} />
                <div style={{ height: 10 }} />
                <FieldEditor label="Body" value={slide.body || ''} onChange={v => updateText(`slide_body_${i}`, v)} multiline />
              </div>
            ))}

            {/* Brand watermark */}
            {composition?.brandName !== undefined && (
              <FieldEditor
                label="Brand Watermark"
                value={composition.brandName || ''}
                onChange={v => updateText('brand_watermark', v)}
              />
            )}
          </div>
        )}

        {/* Style editing tab */}
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ColorField label="Accent Color" value={composition?.accentColor || '#6C3CE1'} onChange={v => updateStyle('accentColor', v)} />
            <ColorField label="Background Color" value={composition?.backgroundColor || '#1a1a2e'} onChange={v => updateStyle('backgroundColor', v)} />
            <ColorField label="Text Color" value={composition?.textBlocks?.[0]?.color || '#FFFFFF'} onChange={v => updateStyle('textColor', v)} />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingBottom: 40 }}>
          <button onClick={handleSave} disabled={saving || !dirty} style={{ ...actionBtn, opacity: dirty ? 1 : 0.5 }}>
            {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleRender} disabled={rendering} style={{ ...actionBtn, background: 'linear-gradient(135deg, #8B5CF6, #6C3CE1)' }}>
            {rendering ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Film size={14} />}
            {rendering ? 'Rendering...' : 'Render MP4'}
          </button>
          {item?.state !== 'approved' && item?.state !== 'published' && (
            <button onClick={handleApprove} style={{ ...actionBtn, background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <Check size={14} /> Approve
            </button>
          )}
        </div>
      </div>

      {/* Right panel — Preview */}
      <div style={{ width: 380, backgroundColor: '#0B1120', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>Preview</div>
        <PhonePreview composition={composition} />
        {renderUrl && (
          <a href={renderUrl} download style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8B5CF6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <Film size={14} /> Download MP4
          </a>
        )}
      </div>
    </div>
  )
}

/* -- Sub-components -- */

function FieldEditor({ label, value, onChange, multiline }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={inputStyle}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#CBD5E1', fontFamily: 'monospace' }}>{value}</div>
      </div>
    </div>
  )
}

function PhonePreview({ composition }) {
  if (!composition) return null
  const type = composition.compositionId
  const bg = composition.backgroundColor || '#1a1a2e'
  const accent = composition.accentColor || '#6C3CE1'

  const phoneFrame = {
    width: 240, aspectRatio: '9/16', borderRadius: 24, overflow: 'hidden',
    position: 'relative', boxShadow: '0 16px 60px rgba(0,0,0,0.4)',
    border: '2px solid #1E293B',
  }
  const center = {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center',
  }

  if (type === 'Slideshow' && composition.slides?.length) {
    const slide = composition.slides[0]
    return (
      <div style={{ ...phoneFrame, background: accent }}>
        <div style={center}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.3, marginBottom: 8 }}>{slide.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, lineHeight: 1.5 }}>{slide.body}</div>
        </div>
        {composition.slides.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {composition.slides.map((_, i) => (
              <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === 0 ? 'white' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === 'VideoHook') {
    return (
      <div style={{ ...phoneFrame, background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>
        <div style={center}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 18, lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {composition.hook || 'Hook text'}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#FF6B6B', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>HOOK</div>
      </div>
    )
  }

  if (type === 'GreenScreenMeme') {
    return (
      <div style={{ ...phoneFrame, background: composition.backgroundColor || '#00B894' }}>
        <div style={{ ...center, justifyContent: 'space-between', padding: '40px 16px' }}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', WebkitTextStroke: '1px black', textAlign: 'center' }}>
            {(composition.topText || '').toUpperCase()}
          </div>
          <div style={{ fontSize: 40, opacity: 0.3 }}>😂</div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', WebkitTextStroke: '1px black', textAlign: 'center' }}>
            {(composition.bottomText || '').toUpperCase()}
          </div>
        </div>
      </div>
    )
  }

  // WallOfText default
  return (
    <div style={{ ...phoneFrame, background: `linear-gradient(165deg, ${bg}, ${bg}CC)` }}>
      <div style={center}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 12, lineHeight: 1.5, maxHeight: '80%', overflow: 'hidden' }}>
          {composition.text || composition.body || 'Content text'}
        </div>
      </div>
    </div>
  )
}

/* -- Styles -- */
const inputStyle = {
  width: '100%', padding: '10px 12px', backgroundColor: '#0F172A', border: '1px solid #1E293B',
  borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  resize: 'vertical', boxSizing: 'border-box',
}

const btnStyle = {
  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  backgroundColor: '#1E293B', color: '#CBD5E1', fontSize: 13, fontWeight: 600,
}

const iconBtn = {
  width: 36, height: 36, borderRadius: 8, border: '1px solid #1E293B',
  backgroundColor: 'transparent', color: '#94A3B8', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const actionBtn = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
  borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  color: 'white', background: '#1E293B',
}
