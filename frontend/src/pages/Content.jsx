import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Copy, ChevronLeft, ChevronRight, RefreshCw, Heart, Eye, Upload, Sparkles, Download, Film, Pencil } from 'lucide-react'
import api from '../lib/api'
import { VIRAL_CONTENT, CONTENT_TAGS } from '../lib/viralContent'
import { formatNumber } from '../lib/utils'
import { useStore } from '../store'

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('__content_kf')) {
  const s = document.createElement('style')
  s.id = '__content_kf'
  s.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
  document.head.appendChild(s)
}

const TABS = [
  { id: 'slideshow', label: 'Slideshow', endpoint: '/content/slideshow' },
  { id: 'wall-of-text', label: 'Wall of Text', endpoint: '/content/wall-of-text' },
  { id: 'video-hook-and-demo', label: 'Video Hook & Demo', endpoint: '/content/video-hook-and-demo' },
  { id: 'green-screen-meme', label: 'Green Screen Meme', endpoint: '/content/green-screen-meme' },
  { id: 'custom', label: 'Custom', endpoint: null },
]

const TAG_COLORS = {
  'B2B App': { bg: '#DBEAFE', text: '#1D4ED8' },
  'B2B SaaS/Platform': { bg: '#FEF3C7', text: '#92400E' },
  'B2C App': { bg: '#DCFCE7', text: '#15803D' },
  'Fitness': { bg: '#FCE7F3', text: '#9D174D' },
  'Finance': { bg: '#EDE9FE', text: '#5B21B6' },
  'Business': { bg: '#E0F2FE', text: '#0369A1' },
  'Lifestyle': { bg: '#FEF9C3', text: '#854D0E' },
  'Self Improvement': { bg: '#F0FDF4', text: '#166534' },
  'Productivity': { bg: '#F5F3FF', text: '#6D28D9' },
  'Health': { bg: '#FFF1F2', text: '#BE123C' },
  'Relationships': { bg: '#FDF4FF', text: '#86198F' },
  'Course/Digital Product': { bg: '#FFF7ED', text: '#C2410C' },
  'E-Commerce': { bg: '#FEE2E2', text: '#B91C1C' },
  'Beauty': { bg: '#FFF7ED', text: '#C2410C' },
  'Personal Brand': { bg: '#FEF3C7', text: '#B45309' },
  'Spirituality': { bg: '#FAE8FF', text: '#7E22CE' },
  'Supplement': { bg: '#F0FFF4', text: '#14532D' },
  'Reaction': { bg: '#E5EDFF', text: '#3730A3' },
}

const SLIDE_COLORS = ['#EA580C','#1a1a1a','#6366f1','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ef4444']

const phoneStyle = {
  width: 220, aspectRatio: '9/16', borderRadius: 20, overflow: 'hidden',
  position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
  display: 'flex', flexDirection: 'column',
}

const phoneCentered = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center',
}

/* -- PhonePreview: renders content inside a phone-shaped frame -- */
function PhonePreview({ type, data, slideIdx, setSlideIdx }) {
  if (type === 'slideshow' && data?.slides) {
    const slides = data.slides
    const slide = slides[slideIdx] || slides[0]
    const bg = SLIDE_COLORS[slideIdx % SLIDE_COLORS.length]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...phoneStyle, background: slide.bgImage ? `url(${slide.bgImage}) center/cover` : bg }}>
          {slide.bgImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />}
          <div style={phoneCentered}>
            {slide.emoji && <div style={{ fontSize: 40, marginBottom: 10 }}>{slide.emoji}</div>}
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.3, marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{slide.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 11, lineHeight: 1.5 }}>{slide.body}</div>
          </div>
        </div>
        {slides.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <button onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))} disabled={slideIdx === 0}
              style={navBtn(slideIdx === 0)}><ChevronLeft size={13} /></button>
            <div style={{ display: 'flex', gap: 5 }}>
              {slides.map((_, i) => (
                <div key={i} onClick={() => setSlideIdx(i)} style={{
                  width: 7, height: 7, borderRadius: '50%', cursor: 'pointer',
                  background: i === slideIdx ? '#EA580C' : '#D1D5DB', transition: 'background 0.2s',
                }} />
              ))}
            </div>
            <button onClick={() => setSlideIdx(Math.min(slides.length - 1, slideIdx + 1))} disabled={slideIdx === slides.length - 1}
              style={navBtn(slideIdx === slides.length - 1)}><ChevronRight size={13} /></button>
          </div>
        )}
      </div>
    )
  }

  const content = data?.content || data?.adaptedText || ''
  if (!content) return null

  if (type === 'wall-of-text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...phoneStyle, background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)' }}>
          <div style={{ ...phoneCentered, justifyContent: 'flex-start', paddingTop: 28, paddingBottom: 28, overflow: 'hidden' }}>
            <div style={{
              color: 'white', fontWeight: 800, fontSize: 14, lineHeight: 1.45,
              textShadow: '0 2px 6px rgba(0,0,0,0.5)', textAlign: 'left', width: '100%',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 16, WebkitBoxOrient: 'vertical',
            }}>{content}</div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'video-hook-and-demo') {
    const lines = content.split('\n').filter(Boolean)
    const hook = lines[0] || ''
    const body = lines.slice(1).join('\n')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...phoneStyle, background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)' }}>
          <div style={{ ...phoneCentered, justifyContent: 'flex-start', paddingTop: 32, gap: 14 }}>
            <div style={{
              color: '#FB923C', fontWeight: 900, fontSize: 15, lineHeight: 1.3,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)', textAlign: 'center', textTransform: 'uppercase',
              borderBottom: '2px solid rgba(251,146,60,0.4)', paddingBottom: 10, width: '100%',
            }}>{hook}</div>
            <div style={{
              color: 'rgba(255,255,255,0.9)', fontSize: 11, lineHeight: 1.6, textAlign: 'left',
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', width: '100%',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 12, WebkitBoxOrient: 'vertical',
            }}>{body}</div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'green-screen-meme') {
    const parts = content.split('\n').filter(Boolean)
    const topText = parts[0] || ''
    const bottomText = parts.slice(1).join(' ') || ''
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...phoneStyle, background: 'linear-gradient(145deg, #00b09b, #96c93d)' }}>
          <div style={{ ...phoneCentered, justifyContent: 'space-between', padding: 24 }}>
            <div style={memeTextStyle}>{topText}</div>
            <div style={{ fontSize: 48 }}>&#x1F602;</div>
            <div style={memeTextStyle}>{bottomText}</div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ ...phoneStyle, background: 'linear-gradient(145deg, #1a1a2e, #16213e)' }}>
        <div style={phoneCentered}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.5 }}>{content}</div>
        </div>
      </div>
    </div>
  )
}

const memeTextStyle = {
  color: 'white', fontWeight: 900, fontSize: 16, lineHeight: 1.2,
  textTransform: 'uppercase', textAlign: 'center',
  textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 2px 8px rgba(0,0,0,0.5)',
}

function navBtn(disabled) {
  return {
    width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5E7EB',
    background: 'white', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

/* -- TrendingCard -- */
function TrendingCard({ video, onRemix, remixingId }) {
  const isRemixing = remixingId === video.id
  const thumb = video.thumbnail || video.slides?.[0]?.imageUrl || ''
  const caption = video.caption || video.textOverlay || video.hookText || video.topText || ''

  return (
    <div style={{
      width: 210, minWidth: 210, borderRadius: 14, overflow: 'hidden',
      background: 'white', border: '1px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '9/12', background: '#111', overflow: 'hidden' }}>
        {video.videoUrl ? (
          <video src={video.videoUrl} poster={thumb} muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onMouseEnter={e => e.target.play()}
            onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }}
          />
        ) : thumb ? (
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12 }}>No preview</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.4, color: '#374151', fontWeight: 500,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{caption}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9CA3AF' }}>
          {video.num_likes != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={11} /> {formatNumber(video.num_likes)}</span>
          )}
          {video.num_views != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} /> {formatNumber(video.num_views)}</span>
          )}
        </div>
        <button onClick={() => onRemix(video)} disabled={isRemixing}
          style={{
            marginTop: 'auto', padding: '7px 0', borderRadius: 8, border: 'none',
            background: isRemixing ? '#FDBA74' : '#FB923C', color: 'white',
            fontWeight: 600, fontSize: 12, cursor: isRemixing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'background 0.15s',
          }}>
          {isRemixing ? (
            <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Remixing...</>
          ) : (
            <><RefreshCw size={12} /> Remix this</>
          )}
        </button>
      </div>
    </div>
  )
}

/* -- Main Content page -- */
export default function Content() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { brand, remixResult, setRemixResult, clearRemixResult } = useStore()
  const [tab, setTab] = useState('slideshow')
  const [mode, setMode] = useState('create')
  const [isBusiness, setIsBusiness] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [remixingId, setRemixingId] = useState(null)
  const [result, setResult] = useState(null)
  const [remixSource, setRemixSource] = useState(null)
  const [activeTag, setActiveTag] = useState(null)
  const [toast, setToast] = useState(null)
  const [slideIdx, setSlideIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [mp4Url, setMp4Url] = useState(null)
  const [savingItem, setSavingItem] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && TABS.find(t => t.id === urlTab)) setTab(urlTab)
    if (searchParams.get('mode') === 'remix') setMode('remix')
    if (remixResult) {
      const rType = remixResult.type || 'wall-of-text'
      const tabType = rType === 'video-hook' ? 'video-hook-and-demo' : rType === 'green-screen' ? 'green-screen-meme' : rType
      if (rType === 'slideshow' && remixResult.slides) {
        setResult({ type: 'slideshow', data: { slides: remixResult.slides, topic: 'Remixed content' } })
      } else {
        setResult({ type: tabType, data: { content: remixResult.content || remixResult.adaptedText || '' } })
      }
      if (['slideshow','wall-of-text','video-hook-and-demo','green-screen-meme'].includes(tabType)) setTab(tabType)
      setMode('remix')
      setSlideIdx(0)
      clearRemixResult()
    }
  }, [searchParams])

  const filteredContent = tab === 'custom' ? [] : VIRAL_CONTENT.filter(v => v.contentType === tab)
  const tagFilteredContent = activeTag ? filteredContent.filter(v => v.tags?.includes(activeTag)) : filteredContent
  const availableTags = [...new Set(filteredContent.flatMap(v => v.tags || []))].slice(0, 12)

  const handleGenerate = async () => {
    const tabDef = TABS.find(t => t.id === tab)
    if (!tabDef?.endpoint) return
    setLoading(true); setResult(null); setRemixSource(null); setSlideIdx(0)
    try {
      const payload = { topic: prompt || 'viral content for my business', platform: 'tiktok', tone: 'engaging' }
      if (isBusiness && brand?.brandName) { payload.brandName = brand.brandName; payload.mentionBusiness = true }
      const { data } = await api.post(tabDef.endpoint, payload)
      setResult({ type: tab, data })
    } catch (err) {
      showToast('Generation failed. Check API keys.')
    } finally { setLoading(false) }
  }

  const handleRemix = async (video) => {
    setRemixingId(video.id); setMode('remix')
    const originalText = video.caption || video.textOverlay || video.hookText || video.topText || ''
    try {
      const { data } = await api.post('/content/remix', { originalText, contentType: video.contentType })
      const adaptedText = data.adaptedText || data.content || ''
      if (video.contentType === 'slideshow' && data.slides) {
        setResult({ type: 'slideshow', data: { slides: data.slides, topic: 'Remixed content' } })
      } else {
        setResult({ type: video.contentType, data: { content: adaptedText } })
      }
      setRemixSource(originalText.slice(0, 80))
      setSlideIdx(0)
      showToast('Remixed to your brand!')
    } catch { showToast('Remix failed - check brand settings') }
    finally { setRemixingId(null) }
  }

  const getContentText = () => {
    if (!result) return ''
    if (result.type === 'slideshow' && result.data?.slides) {
      return result.data.slides.map(s => `${s.emoji || ''} ${s.title}\n${s.body}`).join('\n\n')
    }
    return result.data?.content || result.data?.adaptedText || ''
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getContentText())
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = getContentText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${result?.type || 'content'}-output.txt`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const handleExportMP4 = async () => {
    if (!result) return
    setRendering(true)
    setMp4Url(null)
    try {
      // Build render data from current result
      const contentType = result.type === 'video-hook' ? 'video-hook-and-demo'
        : result.type === 'green-screen' ? 'green-screen-meme'
        : result.type || tab
      const renderData = { brandName: brand?.brandName || '' }

      if (result.type === 'slideshow' && result.data?.slides) {
        renderData.slides = result.data.slides.map(s => ({
          title: s.title || s.heading || '',
          body: s.body || s.text || s.subtitle || '',
          bgColor: s.bgColor || null,
        }))
      } else if (result.type === 'video-hook' || result.type === 'video-hook-and-demo') {
        const raw = result.data?.content || getContentText()
        const hookMatch = raw.match(/hook[:\s]+"?(.+?)("|\n|$)/i)
        renderData.hook = hookMatch ? hookMatch[1] : raw.slice(0, 60)
        renderData.body = raw.replace(hookMatch?.[0] || '', '').trim()
      } else if (result.type === 'green-screen' || result.type === 'green-screen-meme') {
        const raw = result.data?.content || getContentText()
        const lines = raw.split('\n').filter(l => l.trim())
        renderData.topText = lines[0] || 'Top text'
        renderData.bottomText = lines[lines.length - 1] || 'Bottom text'
      } else {
        renderData.text = getContentText()
      }

      const resp = await api.post('/render', { contentType, data: renderData })
      if (resp.data?.url) {
        setMp4Url(resp.data.url)
        // Auto-download
        const link = document.createElement('a')
        link.href = resp.data.url
        link.download = resp.data.fileName || 'export.mp4'
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        showToast('MP4 exported!')
      }
    } catch (e) {
      console.error('Export MP4 error:', e)
      showToast('MP4 export failed')
    } finally {
      setRendering(false)
    }
  }

  const handleSaveAndEdit = async () => {
    if (!result) return
    setSavingItem(true)
    try {
      const contentType = result.type === 'video-hook' ? 'video-hook-and-demo'
        : result.type === 'green-screen' ? 'green-screen-meme'
        : result.type || tab

      const payload = { type: contentType, topic: prompt || 'content' }

      // Pass structured data directly based on content type
      if (result.type === 'slideshow' && result.data?.slides) {
        payload.structuredContent = {
          slides: result.data.slides.map(s => ({
            title: s.title || '', body: s.body || '',
          })),
        }
      }

      const { data } = await api.post('/content-items/generate', payload)
      if (data?.id) {
        navigate(`/edit/${data.id}`)
      }
    } catch (e) {
      console.error('Save & Edit error:', e)
      showToast('Failed to create content item')
    } finally {
      setSavingItem(false)
    }
  }

  const isCustom = tab === 'custom'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>
      {/* Tab navigation */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '12px 24px', background: 'white',
        borderBottom: '1px solid rgba(229,231,235,0.8)', flexShrink: 0, gap: 6,
      }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); setResult(null); setRemixSource(null); setActiveTag(null); setSlideIdx(0) }}
            style={{
              padding: '7px 18px', border: '1px solid',
              borderColor: tab === t.id ? '#D1D5DB' : 'transparent',
              borderRadius: 9999, background: tab === t.id ? 'white' : 'transparent',
              cursor: 'pointer', fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#111827' : '#6B7280',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            {t.id === 'custom' && <Upload size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={{
          width: 360, background: 'white', borderRight: '1px solid rgba(229,231,235,0.8)',
          padding: 20, overflowY: 'auto', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {isCustom ? (
            <CustomUpload showToast={showToast} />
          ) : (
            <>
              {/* Mode toggle */}
              <PillToggle label="Mode" options={[{ label: 'Create New', value: 'create' }, { label: 'Remix', value: 'remix' }]}
                value={mode} onChange={setMode} />

              {/* Mention business */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
                  Mention your business?
                  {isBusiness && brand?.brandName && <span style={{ fontWeight: 400, fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>({brand.brandName})</span>}
                </div>
                <div style={{ display: 'flex', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
                  {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(o => (
                    <button key={String(o.value)} onClick={() => setIsBusiness(o.value)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600,
                        background: isBusiness === o.value ? '#EA580C' : 'transparent',
                        color: isBusiness === o.value ? 'white' : '#6B7280',
                        transition: 'all 0.15s',
                      }}>{o.label}</button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
                  Prompt <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 13 }}>(Optional)</span>
                </div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder={`What should this ${tab.replace(/-/g, ' ')} be about?`}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1px solid #E5E7EB', fontSize: 13, color: '#374151',
                    resize: 'none', height: 80, outline: 'none',
                    fontFamily: 'inherit', background: 'white', lineHeight: 1.5, boxSizing: 'border-box',
                  }} />
              </div>

              {/* Generate button */}
              <button onClick={handleGenerate} disabled={loading}
                style={{
                  width: '100%', padding: 14, borderRadius: 12, border: 'none',
                  background: loading ? '#FDBA74' : '#FB923C', color: 'white',
                  fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}>
                {loading ? (
                  <><div className="fl-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate</>
                )}
              </button>

              {/* Result visual preview */}
              {result && (
                <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                      {result.type === 'slideshow' ? 'Slideshow' : result.type === 'wall-of-text' ? 'Wall of Text' : result.type === 'video-hook-and-demo' ? 'Video Script' : result.type === 'green-screen-meme' ? 'Meme' : 'Content'} Preview
                    </span>
                    <button onClick={() => { setResult(null); setRemixSource(null); setSlideIdx(0) }}
                      style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Clear</button>
                  </div>

                  {remixSource && (
                    <div style={{
                      fontSize: 11, color: '#9CA3AF', marginBottom: 10, padding: '6px 10px',
                      background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6',
                    }}>
                      <RefreshCw size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      Remixed from: "{remixSource}{remixSource.length >= 80 ? '...' : ''}"
                    </div>
                  )}

                  <PhonePreview type={result.type} data={result.data} slideIdx={slideIdx} setSlideIdx={setSlideIdx} />

                  {/* Copy / Download / Export MP4 */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button onClick={handleCopy} style={actionBtn}>
                      <Copy size={12} /> {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button onClick={handleDownload} style={actionBtn}>
                      <Download size={12} /> Download
                    </button>
                    <button onClick={handleExportMP4} disabled={rendering} style={{
                      ...actionBtn,
                      background: rendering ? '#374151' : 'linear-gradient(135deg, #6C3CE1, #E84393)',
                      color: 'white',
                      border: 'none',
                      opacity: rendering ? 0.8 : 1,
                      cursor: rendering ? 'wait' : 'pointer',
                      minWidth: 120,
                    }}>
                      {rendering ? (
                        <>
                          <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Rendering...
                        </>
                      ) : (
                        <><Film size={12} /> Export MP4</>
                      )}
                    </button>
                    <button onClick={handleSaveAndEdit} disabled={savingItem} style={{
                      ...actionBtn,
                      background: savingItem ? '#374151' : 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      border: 'none',
                      opacity: savingItem ? 0.8 : 1,
                      cursor: savingItem ? 'wait' : 'pointer',
                      minWidth: 120,
                    }}>
                      {savingItem ? (
                        <>
                          <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Saving...
                        </>
                      ) : (
                        <><Pencil size={12} /> Save &amp; Edit</>
                      )}
                    </button>
                  </div>
                  {mp4Url && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Film size={11} /> MP4 ready —{' '}
                      <a href={mp4Url} download style={{ color: '#6C3CE1', fontWeight: 600, textDecoration: 'underline' }}>Download again</a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right panel - trending content */}
        <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isCustom ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={32} color="#D1D5DB" />
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                Upload your own content on the left, or switch tabs to browse trending content and remix it.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  Trending Content
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF', marginLeft: 8 }}>{tagFilteredContent.length} items</span>
                </div>
              </div>

              {availableTags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', flexShrink: 0 }}>
                  <button onClick={() => setActiveTag(null)}
                    style={{
                      padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                      background: !activeTag ? '#111827' : '#F3F4F6',
                      color: !activeTag ? 'white' : '#6B7280',
                      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    }}>All</button>
                  {availableTags.map(tag => {
                    const colors = TAG_COLORS[tag] || { bg: '#F3F4F6', text: '#374151' }
                    const isActive = activeTag === tag
                    return (
                      <button key={tag} onClick={() => setActiveTag(isActive ? null : tag)}
                        style={{
                          padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                          background: isActive ? colors.text : colors.bg,
                          color: isActive ? 'white' : colors.text,
                          border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        }}>{tag}</button>
                    )
                  })}
                </div>
              )}

              <div style={{
                flex: 1, overflowY: 'auto', overflowX: 'hidden',
                display: 'flex', flexWrap: 'wrap', gap: 16, alignContent: 'flex-start', paddingBottom: 20,
              }}>
                {tagFilteredContent.length > 0 ? (
                  tagFilteredContent.slice(0, 50).map(video => (
                    <TrendingCard key={video.id} video={video} onRemix={handleRemix} remixingId={remixingId} />
                  ))
                ) : (
                  <div style={{ width: '100%', textAlign: 'center', paddingTop: 60, color: '#9CA3AF', fontSize: 14 }}>
                    No trending content for this filter.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#111827', color: 'white', padding: '10px 24px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.25s ease',
        }}>{toast}</div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  )
}

const actionBtn = {
  flex: 1, padding: '8px', border: '1px solid #E5E7EB', borderRadius: 8,
  background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
}

function PillToggle({ label, options, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: value === o.value ? 600 : 400,
              background: value === o.value ? 'white' : 'transparent',
              color: value === o.value ? '#111827' : '#6B7280',
              boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

function CustomUpload({ showToast }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', paddingTop: 40 }}>
      <Upload size={40} color="#D1D5DB" />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', textAlign: 'center' }}>Upload Your Own Content</div>
      <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>Upload your own video or build a custom slideshow to remix with your brand voice.</p>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <label style={{
          flex: 1, padding: '16px 12px', borderRadius: 12, border: '2px dashed #D1D5DB',
          cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7280',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
          transition: 'border-color 0.15s',
        }}>
          <Upload size={20} />Upload Video
          <input type="file" style={{ display: 'none' }} accept="video/*" onChange={() => showToast('Upload feature coming soon!')} />
        </label>
        <button onClick={() => showToast('Slideshow builder coming soon!')}
          style={{
            flex: 1, padding: '16px 12px', borderRadius: 12, border: '2px dashed #D1D5DB',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7280', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
          <Sparkles size={20} />Build Slideshow
        </button>
      </div>
    </div>
  )
}
