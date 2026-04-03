import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, X, Check, Bookmark, Sparkles, Loader, ChevronLeft, ChevronRight, Film, Pencil } from 'lucide-react'
import { VIRAL_CONTENT, CONTENT_TAGS, fmtNum, getByType } from '../lib/viralContent'
import { saveToLibrary, downloadContent, bookmarkContent } from '../lib/contentActions'
import { useStore } from '../store'
import { adaptCaption, generatePrompt } from '../lib/brandContext'
import api from '../lib/api'

// @keyframes injected once
const STYLE_ID = '__blitz_keyframes'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  `
  document.head.appendChild(s)
}

const SHUFFLED = [...VIRAL_CONTENT].sort(() => Math.random() - 0.5)

const THEMES = [
  { id: 'b2b-saas', label: 'B2B SaaS', emoji: '\u{1F3E2}', bg: '#EEF2FF', border: '#818CF8' },
  { id: 'b2c-app', label: 'B2C App', emoji: '\u{1F4F1}', bg: '#F0FDF4', border: '#4ADE80' },
  { id: 'ecommerce', label: 'E-Commerce', emoji: '\u{1F6D2}', bg: '#FFF7ED', border: '#FB923C' },
  { id: 'fitness', label: 'Fitness', emoji: '\u{1F4AA}', bg: '#FEF2F2', border: '#F87171' },
  { id: 'finance', label: 'Finance', emoji: '\u{1F4B0}', bg: '#ECFDF5', border: '#34D399' },
  { id: 'self-improvement', label: 'Self Improvement', emoji: '\u{1F9E0}', bg: '#FAF5FF', border: '#C084FC' },
  { id: 'beauty', label: 'Beauty', emoji: '\u{1F484}', bg: '#FDF2F8', border: '#F472B6' },
  { id: 'health', label: 'Health', emoji: '\u{1FA7A}', bg: '#F0FDFA', border: '#2DD4BF' },
  { id: 'productivity', label: 'Productivity', emoji: '\u26A1', bg: '#FFFBEB', border: '#FBBF24' },
  { id: 'course-digital', label: 'Course/Digital Product', emoji: '\u{1F393}', bg: '#EFF6FF', border: '#60A5FA' },
  { id: 'personal-brand', label: 'Personal Brand', emoji: '\u{1F31F}', bg: '#FEF9C3', border: '#FACC15' },
  { id: 'spirituality', label: 'Spirituality', emoji: '\u{1F54A}\uFE0F', bg: '#F5F3FF', border: '#A78BFA' },
]

const TYPE_EMOJI = {
  slideshow: '\u{1F7E1}',
  'wall-of-text': '\u{1F535}',
  'green-screen-meme': '\u{1F7E2}',
  'video-hook-and-demo': '\u{1F7E1}',
}

export default function Blitz() {
  const navigate = useNavigate()
  const { brand, setRemixResult } = useStore()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [modalVideo, setModalVideo] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [toast, setToast] = useState(null)
  const [adaptedCaption, setAdaptedCaption] = useState(null)
  const [adapting, setAdapting] = useState(false)
  const [remixLoading, setRemixLoading] = useState(false)
  const [showWhyContent, setShowWhyContent] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editVideo, setEditVideo] = useState(null)
  const [contentTypeDistro, setContentTypeDistro] = useState({ slideshow: 25, 'wall-of-text': 25, 'green-screen-meme': 25, 'video-hook-and-demo': 25 })
  const [remixRatio, setRemixRatio] = useState(50)
  const [mentionBusiness, setMentionBusiness] = useState(true)
  const [blitzExporting, setBlitzExporting] = useState(false)
  const [creatingItem, setCreatingItem] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [intensity, setIntensity] = useState('medium')
  const [approvePopover, setApprovePopover] = useState(null)
  const timerRef = useRef(null)

  const hasBrand = brand && brand.brandName

  const generateWhyBullets = (video) => {
    if (!video) return []
    const bullets = []
    const typeReasons = {
      slideshow: 'Slideshow format drives high save rates and extended watch time through swipeable storytelling',
      'wall-of-text': 'Wall-of-text posts create intimacy and stop mid-scroll with raw, relatable copy',
      'video-hook-and-demo': 'Hook-and-demo format captures attention in <3s and converts curiosity into action',
      'green-screen-meme': 'Meme-style green screen content boosts shareability and humanizes your brand',
    }
    if (typeReasons[video.contentType]) bullets.push(typeReasons[video.contentType])
    if (video.tags && video.tags.length > 0) {
      const tagStr = video.tags.slice(0, 2).join(' and ')
      if (hasBrand) {
        bullets.push(`Trending in ${tagStr} — aligns with ${brand.industry || brand.brandName}'s target audience`)
      } else {
        bullets.push(`Trending in ${tagStr} — high engagement potential in this niche`)
      }
    }
    if (video.num_likes > 50000) {
      bullets.push(`${fmtNum(video.num_likes)} likes signals proven viral potential — remix to capture the same momentum`)
    } else if (video.num_views > 100000) {
      bullets.push(`${fmtNum(video.num_views)} views proves this concept resonates — adapt it to stand out`)
    }
    if (hasBrand && brand.targetAudience) {
      bullets.push(`Tone and format match what performs best for ${brand.targetAudience}`)
    }
    return bullets.slice(0, 3)
  }

  const adjustDistro = (typeId, delta) => {
    setContentTypeDistro(prev => {
      const newVal = Math.max(0, Math.min(100, prev[typeId] + delta))
      const diff = newVal - prev[typeId]
      if (diff === 0) return prev
      const otherKeys = Object.keys(prev).filter(k => k !== typeId)
      const otherTotal = otherKeys.reduce((sum, k) => sum + prev[k], 0)
      if (otherTotal === 0 && diff > 0) return prev
      const updated = { ...prev, [typeId]: newVal }
      let remaining = -diff
      otherKeys.forEach((k, i) => {
        if (i === otherKeys.length - 1) {
          updated[k] = Math.max(0, prev[k] + remaining)
        } else {
          const share = otherTotal > 0 ? Math.round(remaining * (prev[k] / otherTotal)) : Math.round(remaining / otherKeys.length)
          updated[k] = Math.max(0, prev[k] + share)
          remaining -= share
        }
      })
      return updated
    })
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const handleSave = async (video) => {
    const res = await saveToLibrary(video)
    bookmarkContent(video)
    showToast(res.message)
    setApprovePopover(video.id || Date.now())
  }

  const handleDownload = async (video, slideIdx) => {
    showToast('Downloading...')
    await downloadContent(video, slideIdx)
  }

  const handleExportMP4Blitz = async (video) => {
    setBlitzExporting(true)
    showToast('Rendering MP4...')
    try {
      const ct = video.contentType || 'wall-of-text'
      const contentType = ct === 'video-hook' ? 'video-hook-and-demo'
        : ct === 'green-screen' ? 'green-screen-meme' : ct
      const renderData = { brandName: brand?.brandName || '' }

      if (ct === 'slideshow' && video.slides) {
        renderData.slides = video.slides.map(s => ({
          title: s.title || s.heading || '',
          body: s.body || s.text || '',
        }))
      } else if (ct.includes('video-hook')) {
        renderData.hook = video.hookText || (video.caption || '').slice(0, 60)
        renderData.body = video.caption || ''
      } else if (ct.includes('green-screen')) {
        const raw = video.caption || video.textOverlay || ''
        const lines = raw.split('\n').filter(l => l.trim())
        renderData.topText = lines[0] || 'Top'
        renderData.bottomText = lines[lines.length - 1] || 'Bottom'
      } else {
        renderData.text = adaptedCaption || video.caption || video.textOverlay || 'Content'
      }

      const resp = await api.post('/render', { contentType, data: renderData })
      if (resp.data?.url) {
        const link = document.createElement('a')
        link.href = resp.data.url
        link.download = resp.data.fileName || 'export.mp4'
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        showToast('MP4 exported!')
      }
    } catch {
      showToast('Export failed')
    } finally {
      setBlitzExporting(false)
    }
  }

  const handleOpenInStudio = async (video) => {
    setCreatingItem(true)
    try {
      const ct = video.contentType || 'wall-of-text'
      const contentType = ct === 'video-hook' ? 'video-hook-and-demo'
        : ct === 'green-screen' ? 'green-screen-meme' : ct
      const payload = {
        type: contentType,
        topic: video.caption?.slice(0, 100) || 'trending content',
        trendCaption: video.caption || video.textOverlay || video.hookText || '',
        trendVideoUrl: video.videoUrl || null,
      }
      const { data } = await api.post('/content-items/generate', payload)
      if (data?.id) {
        navigate(`/edit/${data.id}`)
      }
    } catch (e) {
      console.error('Open in Studio error:', e)
      showToast('Failed to create content item')
    } finally {
      setCreatingItem(false)
    }
  }

  const allCards = activeTag
    ? VIRAL_CONTENT.filter(c => c.tags?.includes(activeTag))
    : activeType
    ? getByType(activeType)
    : SHUFFLED

  const cards = allCards.length ? allCards : VIRAL_CONTENT
  const cur = cards[idx % cards.length]
  const prev = cards[(idx - 1 + cards.length) % cards.length]
  const next = cards[(idx + 1) % cards.length]

  useEffect(() => {
    clearInterval(timerRef.current)
    if (!paused) timerRef.current = setInterval(() => setIdx(i => (i + 1) % cards.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [paused, cards.length])

  const advance = (dir) => {
    clearInterval(timerRef.current)
    setIdx(i => (i + dir + cards.length) % cards.length)
    if (!paused) timerRef.current = setInterval(() => setIdx(i => (i + 1) % cards.length), 5000)
  }

  const openRemixModal = (video) => {
    setModalVideo(video)
    setAdaptedCaption(null)
    if (hasBrand && brand.industry) {
      const industryLower = brand.industry.toLowerCase()
      const match = THEMES.find(t => industryLower.includes(t.id.replace('-', ' ')) || t.label.toLowerCase().includes(industryLower))
      setSelectedTheme(match ? match.id : null)
    } else {
      setSelectedTheme(null)
    }
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => { setModalVideo(null); setAdaptedCaption(null) }, 200)
  }

  const openEditModal = (video) => {
    setEditVideo(video)
    setShowEditModal(true)
  }

  const handleAdaptToBrand = async () => {
    if (!modalVideo || !hasBrand) return
    setAdapting(true)
    try {
      const originalText = modalVideo.caption || modalVideo.textOverlay || modalVideo.hookText || ''
      const { data } = await api.post('/content/remix', {
        originalCaption: originalText,
        contentType: modalVideo.contentType || 'wall-of-text',
        theme: selectedTheme || brand.industry || '',
        intensity,
        userPrompt: userPrompt || undefined,
      })
      if (data.adaptedText) setAdaptedCaption(data.adaptedText)
      else if (data.content) setAdaptedCaption(data.content)
    } catch (err) {
      console.error('Adapt failed:', err)
      const adapted = adaptCaption(modalVideo.caption || '', brand)
      setAdaptedCaption(adapted)
    } finally {
      setAdapting(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedTheme || !modalVideo) return
    setRemixLoading(true)
    try {
      const originalCaption = modalVideo.caption || modalVideo.textOverlay || modalVideo.hookText || modalVideo.topText || ''
      const { data } = await api.post('/content/remix', {
        originalCaption,
        contentType: modalVideo.contentType || 'wall-of-text',
        theme: selectedTheme,
        catalogItemId: modalVideo.id,
        intensity,
        userPrompt: userPrompt || undefined,
      })
      setRemixResult({ ...data, originalVideo: modalVideo, theme: selectedTheme })
      const params = new URLSearchParams({ videoId: modalVideo.id, theme: selectedTheme, mode: 'remix', remixed: 'true' })
      if (hasBrand) {
        params.set('brand', brand.brandName)
        if (brand.productName) params.set('product', brand.productName)
      }
      navigate(`/content?${params.toString()}`)
    } catch (err) {
      console.error('Remix failed:', err)
      const params = new URLSearchParams({ videoId: modalVideo.id, theme: selectedTheme, mode: 'remix' })
      if (hasBrand) {
        params.set('brand', brand.brandName)
        if (brand.productName) params.set('product', brand.productName)
      }
      if (adaptedCaption) params.set('caption', adaptedCaption)
      navigate(`/content?${params.toString()}`)
    } finally {
      setRemixLoading(false)
    }
  }

  const TYPES = [
    { id: 'slideshow', label: 'Slideshow' },
    { id: 'wall-of-text', label: 'Wall of Text' },
    { id: 'video-hook-and-demo', label: 'Video Hook' },
    { id: 'green-screen-meme', label: 'Green Screen' },
  ]

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 24px', background: 'white', borderBottom: '1px solid rgba(229,231,235,0.6)', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 9999, padding: 2, gap: 2 }}>
          <button onClick={() => setActiveType(null)} style={{ padding: '4px 12px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: !activeType ? 600 : 400, background: !activeType ? 'white' : 'transparent', color: !activeType ? '#111827' : '#6B7280', boxShadow: !activeType ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>All</button>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setActiveType(activeType === t.id ? null : t.id)} style={{ padding: '4px 12px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeType === t.id ? 600 : 400, background: activeType === t.id ? 'white' : 'transparent', color: activeType === t.id ? '#111827' : '#6B7280', boxShadow: activeType === t.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>{t.label}</button>
          ))}
        </div>
        {cur && (
          <span style={{ padding: '4px 14px', borderRadius: 9999, background: '#F3F4F6', fontSize: 12, fontWeight: 600, color: '#374151' }}>
            {cur.contentType === 'slideshow' ? 'Slideshow' : cur.contentType === 'wall-of-text' ? 'Wall of Text' : cur.contentType === 'video-hook-and-demo' ? 'Video Hook & Demo' : cur.contentType === 'green-screen-meme' ? 'Green Screen Meme' : 'Content'}
          </span>
        )}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowWhyContent(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 9999, border: '1px solid #E5E7EB', background: showWhyContent ? '#F3F4F6' : 'white', fontSize: 12, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
            \u24D8 Why This Content?
          </button>
          {showWhyContent && cur && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', padding: '16px 18px', zIndex: 50 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Why this content?</span>
                <button onClick={() => setShowWhyContent(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={14} /></button>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                {generateWhyBullets(cur).map((bullet, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.55, marginBottom: 6 }}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main carousel + prefs panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Carousel area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: 80 }}>
          {/* Left nav arrow */}
          <button onClick={() => advance(-1)} style={{ position: 'absolute', left: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>{'\u2039'}</button>

          {/* 3-card stack */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative' }}>
            {/* LEFT card */}
            <BlitzCard video={prev} size="sm" label={hasBrand ? 'View Original' : null} positionLabel="Original" showOriginalStats={hasBrand} onClick={() => advance(-1)} onRemix={openRemixModal} />
            {/* CENTER card */}
            <BlitzCard video={cur} size="lg" active onRemix={openRemixModal} onSave={handleSave} brand={hasBrand ? brand : null} positionLabel={hasBrand ? `Remix for ${brand.brandName}` : 'Your Version'} />
            {/* RIGHT card */}
            <BlitzCard video={next} size="sm" onClick={() => advance(1)} onRemix={openRemixModal} positionLabel="Next" />
          </div>

          {/* Right nav arrow */}
          <button onClick={() => advance(1)} style={{ position: 'absolute', right: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>{'\u203A'}</button>

          {/* Bottom action bar */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Reject */}
            <button onClick={() => advance(1)} title="Reject" style={{ width: 52, height: 52, borderRadius: '50%', background: 'white', border: '2px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(239,68,68,0.15)', transition: 'all 0.15s' }}>
              <X size={22} color="#EF4444" />
            </button>
            {/* Edit */}
            <button onClick={() => openEditModal(cur)} title="Edit" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
              \u270F\uFE0F Edit
            </button>
            {/* Approve */}
            <button onClick={() => handleSave(cur)} title="Approve" style={{ width: 52, height: 52, borderRadius: '50%', background: '#10B981', border: '2px solid #34D399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', transition: 'all 0.15s' }}>
              <Check size={24} color="white" />
            </button>
            {/* Mute toggle */}
            <button onClick={() => setPaused(p => !p)} title={paused ? 'Resume' : 'Mute'} style={{ padding: '11px 18px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 9999, fontSize: 13, color: '#6B7280', cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {paused ? '\u25B6 Resume' : '\u{1F507} Mute'}
            </button>
            {/* Export MP4 */}
            <button onClick={() => handleExportMP4Blitz(cur)} disabled={blitzExporting} title="Export MP4" style={{ padding: '11px 18px', background: blitzExporting ? '#374151' : 'linear-gradient(135deg, #6C3CE1, #E84393)', border: 'none', borderRadius: 9999, fontSize: 13, color: 'white', cursor: blitzExporting ? 'wait' : 'pointer', fontWeight: 600, boxShadow: '0 2px 10px rgba(108,60,225,0.3)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {blitzExporting ? (
                <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Rendering...</>
              ) : (
                <><Film size={14} /> MP4</>
              )}
            </button>
            {/* Open in Studio */}
            <button onClick={() => handleOpenInStudio(cur)} disabled={creatingItem} title="Open in Studio" style={{ padding: '11px 18px', background: creatingItem ? '#374151' : 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 9999, fontSize: 13, color: 'white', cursor: creatingItem ? 'wait' : 'pointer', fontWeight: 600, boxShadow: '0 2px 10px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {creatingItem ? (
                <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating...</>
              ) : (
                <><Pencil size={14} /> Studio</>
              )}
            </button>
          </div>

          {/* Settings gear */}
          <button onClick={() => setShowPrefs(p => !p)} style={{ position: 'absolute', right: showPrefs ? 256 : 16, top: 12, width: 34, height: 34, background: 'white', border: '1px solid #E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'right 0.3s ease' }}>
            <Settings size={15} color="#6B7280" />
          </button>
        </div>

        {/* Preferences panel */}
        {showPrefs && (
          <div style={{ width: 240, background: 'white', borderLeft: '1px solid rgba(229,231,235,0.8)', padding: 20, overflowY: 'auto', flexShrink: 0, animation: 'slideInRight 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Preferences</span>
              <button onClick={() => setShowPrefs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={15} /></button>
            </div>

            {/* CONTENT TYPES */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 10, textTransform: 'uppercase' }}>Content Types</div>
              {[
                { id: 'slideshow', label: 'Slideshow', dot: '\u{1F7E1}' },
                { id: 'wall-of-text', label: 'Wall of Text', dot: '\u{1F535}' },
                { id: 'green-screen-meme', label: 'Green Screen', dot: '\u{1F7E2}' },
                { id: 'video-hook-and-demo', label: 'Video Hook', dot: '\u{1F7E1}' },
              ].map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{t.dot} {t.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => adjustDistro(t.id, -5)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B7280', fontWeight: 700, lineHeight: 1, padding: 0 }}>-</button>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', width: 30, textAlign: 'center' }}>{contentTypeDistro[t.id]}%</span>
                    <button onClick={() => adjustDistro(t.id, 5)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B7280', fontWeight: 700, lineHeight: 1, padding: 0 }}>+</button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 2 }}>Total: {Object.values(contentTypeDistro).reduce((a, b) => a + b, 0)}%</div>
            </div>

            {/* REMIX RATIO */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>Remix Ratio</div>
              <input type="range" min={0} max={100} value={remixRatio} onChange={e => setRemixRatio(Number(e.target.value))} style={{ width: '100%', accentColor: '#EA580C' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}><span>Remix</span><span>{remixRatio}%</span><span>Original</span></div>
            </div>

            {/* MENTION BUSINESS TOGGLE */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>Mention Business</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{mentionBusiness ? 'On' : 'Off'}</span>
                <button onClick={() => setMentionBusiness(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: mentionBusiness ? '#EA580C' : '#D1D5DB', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: mentionBusiness ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>{mentionBusiness ? 'Brand name will appear in remixed content' : 'Remixes won\'t mention your brand directly'}</div>
            </div>

            {/* BUSINESS NICHES */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>Business Niches</div>
              {CONTENT_TAGS.slice(0, 8).map(t => (
                <label key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#EA580C', width: 13, height: 13 }} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: 'white', padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.25s ease' }}>
          {toast}
        </div>
      )}

      {/* Approve → Schedule Popover */}
      {approvePopover && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', padding: '16px 20px', zIndex: 201, animation: 'fadeIn 0.2s ease', textAlign: 'center', minWidth: 260 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Approved!</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>Schedule this post?</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => { setApprovePopover(null); navigate('/calendar') }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#111827', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Schedule Now</button>
            <button onClick={() => setApprovePopover(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Later</button>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {modalVideo && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: modalVisible ? 1 : 0, transition: 'opacity 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: 'white', borderRadius: 20, width: 520, maxHeight: '85vh', overflow: 'auto', padding: '28px 28px 24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', transform: modalVisible ? 'scale(1)' : 'scale(0.95)', opacity: modalVisible ? 1 : 0, transition: 'all 0.25s ease' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#6B7280" /></button>

            {/* Preview */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 72, height: 128, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                <img src={modalVideo.thumbnail || modalVideo.slides?.[0]?.imageUrl || modalVideo.videoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Remix this video</div>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{adaptedCaption || modalVideo.caption}</p>
                {hasBrand && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{brand.brandName[0].toUpperCase()}</div>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Remixing for {brand.brandName}{brand.productName && brand.productName !== brand.brandName ? ` - ${brand.productName}` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Adapt button */}
            {hasBrand && (
              <button onClick={handleAdaptToBrand} disabled={adapting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid #E5E7EB', background: adaptedCaption ? '#F0FDF4' : '#FAFAFA', color: adaptedCaption ? '#16A34A' : '#374151', fontSize: 13, fontWeight: 600, cursor: adapting ? 'wait' : 'pointer', marginBottom: 20, transition: 'all 0.15s ease' }}>
                <Sparkles size={14} />
                {adapting ? 'Adapting...' : adaptedCaption ? 'Caption adapted to ' + brand.brandName : 'Adapt to my brand'}
              </button>
            )}

            {/* Adapted caption preview */}
            {hasBrand && adaptedCaption && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', letterSpacing: '0.05em', marginBottom: 4 }}>SUGGESTED CAPTION FOR {brand.brandName.toUpperCase()}</div>
                <p style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5, margin: 0 }}>{adaptedCaption}</p>
              </div>
            )}

            {/* Theme grid */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Choose your theme / niche</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {THEMES.map(t => {
                const isSelected = selectedTheme === t.id
                return (
                  <button key={t.id} onClick={() => setSelectedTheme(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 8px', borderRadius: 14, background: isSelected ? t.bg : '#FAFAFA', border: isSelected ? `2px solid ${t.border}` : '2px solid transparent', boxShadow: isSelected ? `0 0 0 3px ${t.border}33` : 'none', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#111827' : '#6B7280', textAlign: 'center', lineHeight: 1.3 }}>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Intensity selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Remix Intensity</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'light', label: 'Light', desc: 'Swap refs only' },
                  { value: 'medium', label: 'Medium', desc: 'Full rewrite' },
                  { value: 'heavy', label: 'Heavy', desc: 'Creative rebuild' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setIntensity(opt.value)} style={{ flex: 1, padding: '8px 6px', borderRadius: 10, border: intensity === opt.value ? '2px solid #6366F1' : '1px solid #E5E7EB', background: intensity === opt.value ? '#EEF2FF' : '#FAFAFA', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: intensity === opt.value ? '#4338CA' : '#374151' }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom prompt input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Custom Instructions (optional)</div>
              <textarea value={userPrompt} onChange={e => setUserPrompt(e.target.value)} placeholder="Add instructions... e.g., 'more founder-led', 'focus on demo bookings', 'meme tone'" style={{ width: '100%', minHeight: 60, padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12, lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }} />
            </div>

            {/* Continue */}
            <button onClick={handleContinue} disabled={!selectedTheme || remixLoading} style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: selectedTheme && !remixLoading ? 'pointer' : 'not-allowed', background: remixLoading ? '#6366F1' : selectedTheme ? '#111827' : '#E5E7EB', color: selectedTheme || remixLoading ? 'white' : '#9CA3AF', fontSize: 14, fontWeight: 700, transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {remixLoading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Remixing content...
                </>
              ) : 'Continue with this theme \u2192'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditModal && editVideo && (
        <EditContentModal video={editVideo} brand={hasBrand ? brand : null} onClose={() => { setShowEditModal(false); setEditVideo(null) }} showToast={showToast} />
      )}
    </div>
  )
}

function BlitzCard({ video, size = 'sm', active = false, label = null, positionLabel = null, showOriginalStats = false, onClick, onRemix, onSave, onDownload, brand = null }) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [hoverExpand, setHoverExpand] = useState(false)
  if (!video) return null
  const isLg = size === 'lg'
  const W = isLg ? 260 : 170
  const isSlideshow = video.contentType === 'slideshow' && video.slides && video.slides.length > 0
  const curSlide = isSlideshow ? (video.slides[slideIdx] || video.slides[0]) : null
  const hasBrandCtx = brand && brand.brandName
  const brandAdaptedCaption = hasBrandCtx ? adaptCaption(video.caption || '', brand) : null

  // Get the overlay text for the center card (brand-adapted when possible)
  const getOverlayText = () => {
    if (hasBrandCtx && brandAdaptedCaption) return brandAdaptedCaption
    return video.textOverlay || video.caption || ''
  }

  // Background image/video thumbnail
  const bgSrc = video.thumbnail || video.slides?.[0]?.imageUrl || ''

  // Content type chip config
  const typeChipMap = {
    slideshow: { label: 'Slideshow', bg: 'rgba(234,179,8,0.85)', color: '#422006' },
    'wall-of-text': { label: 'Wall of Text', bg: 'rgba(59,130,246,0.85)', color: 'white' },
    'video-hook-and-demo': { label: 'Hook + Demo', bg: 'rgba(249,115,22,0.85)', color: 'white' },
    'green-screen-meme': { label: 'Meme', bg: 'rgba(34,197,94,0.85)', color: 'white' },
  }
  const typeChip = typeChipMap[video.contentType] || null

  // Engagement rate
  const likes = video.num_likes || 0
  const comments = video.num_comments || 0
  const shares = video.num_shares || 0
  const views = video.num_views || 0
  const erVal = views > 0 ? ((likes + comments + shares) / views * 100) : 0
  const erText = erVal.toFixed(1) + '%'
  const erColor = erVal > 5 ? '#16A34A' : erVal >= 2 ? '#CA8A04' : '#6B7280'
  const erBg = erVal > 5 ? 'rgba(22,163,74,0.15)' : erVal >= 2 ? 'rgba(202,138,4,0.15)' : 'rgba(107,114,128,0.15)'

  // Micro-structure summary for center card
  const getMicroStructure = () => {
    if (video.contentType === 'slideshow') {
      const slideCount = video.slides?.length || 5
      return `${slideCount} slides \u00B7 Hook \u2192 Problem \u2192 Solution \u2192 Proof \u2192 CTA`
    }
    if (video.contentType === 'wall-of-text') {
      const words = (video.caption || video.textOverlay || '').split(/\s+/).filter(Boolean).length || 245
      return `${words} words \u00B7 Pain \u2192 Insight \u2192 Contrarian \u2192 Payoff`
    }
    if (video.contentType === 'video-hook-and-demo') {
      return 'Hook (3s) + Setup (7s) + Demo (25s) + CTA (10s)'
    }
    if (video.contentType === 'green-screen-meme') {
      return 'Meme \u00B7 Setup + Punchline'
    }
    return null
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: W,
        aspectRatio: '9/16',
        borderRadius: isLg ? 20 : 14,
        background: '#111',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        opacity: isLg ? 1 : 0.65,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isLg ? '0 20px 60px rgba(0,0,0,0.55)' : '0 4px 16px rgba(0,0,0,0.28)',
        zIndex: isLg ? 2 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Background media layer */}
      {isSlideshow ? (
        <img
          src={isLg ? curSlide.imageUrl : (video.slides[0]?.imageUrl || video.thumbnail)}
          alt={curSlide?.text || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : video.videoUrl && video.videoUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
        <video
          key={video.videoUrl}
          src={video.videoUrl}
          poster={video.thumbnail}
          autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img
          src={video.thumbnail || video.videoUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* === CONTENT TYPE CHIP (all cards) === */}
      {typeChip && (
        <div style={{ position: 'absolute', top: isLg ? 10 : 6, right: isLg ? 10 : 6, background: typeChip.bg, backdropFilter: 'blur(6px)', borderRadius: 6, padding: isLg ? '3px 8px' : '2px 6px', zIndex: 4 }}>
          <span style={{ color: typeChip.color, fontSize: isLg ? 10 : 9, fontWeight: 800, letterSpacing: 0.3 }}>{typeChip.label}</span>
        </div>
      )}

      {/* === POSITION LABEL (top-left: Original / Remix for {brand} / Your Version / Next) === */}
      {positionLabel && (
        <div style={{ position: 'absolute', top: isLg ? 8 : 6, left: isLg ? 8 : 6, background: isLg ? 'rgba(234,88,12,0.9)' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '3px 8px', zIndex: 6 }}>
          <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{positionLabel}</span>
        </div>
      )}

      {/* === COMPOSED VISUAL OVERLAYS BY CONTENT TYPE === */}

      {/* SLIDESHOW: slide text overlay + dots */}
      {video.contentType === 'slideshow' && isSlideshow && (
        <>
          {/* Slide text centered */}
          {curSlide?.text && (
            <div
              onMouseEnter={() => isLg && setHoverExpand(true)}
              onMouseLeave={() => isLg && setHoverExpand(false)}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: isLg ? 'auto' : 'none', padding: isLg ? '40px 16px' : '20px 8px' }}>
              <p style={{
                color: 'white', fontWeight: 800,
                fontSize: isLg ? 18 : 11, lineHeight: 1.35, margin: 0,
                textAlign: 'center',
                textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0px 30px rgba(0,0,0,0.4)',
                display: '-webkit-box', WebkitLineClamp: isLg ? (hoverExpand ? 12 : 6) : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                maxWidth: '90%',
                transition: 'all 0.3s ease',
              }}>
                {hasBrandCtx && isLg ? adaptCaption(curSlide.text, brand) : curSlide.text}
              </p>
            </div>
          )}
          {/* Slide nav buttons (large) */}
          {isLg && video.slides.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setSlideIdx(i => Math.max(0, i - 1)) }} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, zIndex: 5 }}>{'\u2039'}</button>
              <button onClick={e => { e.stopPropagation(); setSlideIdx(i => Math.min(video.slides.length - 1, i + 1)) }} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, zIndex: 5 }}>{'\u203A'}</button>
            </>
          )}
          {/* Slide dots */}
          {video.slides.length > 1 && (
            <div style={{ position: 'absolute', bottom: isLg ? 40 : 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 5 }}>
              {video.slides.map((_, si) => (
                <button key={si} onClick={e => { e.stopPropagation(); setSlideIdx(si) }} style={{ width: si === slideIdx ? 14 : 5, height: 5, borderRadius: 3, border: 'none', padding: 0, background: si === slideIdx ? 'white' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </>
      )}

      {/* WALL-OF-TEXT: large text overlay filling most of the card */}
      {video.contentType === 'wall-of-text' && (
        <div
          onMouseEnter={() => isLg && setHoverExpand(true)}
          onMouseLeave={() => isLg && setHoverExpand(false)}
          style={{
          position: 'absolute', inset: 0, pointerEvents: isLg ? 'auto' : 'none',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: isLg ? '28px 18px 52px' : '16px 8px 32px',
        }}>
          <p style={{
            color: 'white', fontWeight: 700,
            fontSize: isLg ? 14 : 9, lineHeight: 1.6, margin: 0,
            textAlign: 'left',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            display: '-webkit-box', WebkitLineClamp: isLg ? (hoverExpand ? 20 : 12) : 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            {isLg ? getOverlayText() : (video.textOverlay || video.caption || '')}
          </p>
          {isLg && !hoverExpand && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4, fontWeight: 600 }}>... hover to expand</span>
          )}
        </div>
      )}

      {/* GREEN-SCREEN-MEME: meme-style top + bottom text */}
      {video.contentType === 'green-screen-meme' && (video.topText || video.bottomText) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {video.topText && (
            <div style={{ padding: isLg ? '36px 12px 0' : '24px 6px 0', textAlign: 'center' }}>
              <p style={{
                color: 'white', fontWeight: 900,
                fontSize: isLg ? 16 : 10, lineHeight: 1.3, margin: 0,
                textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.7)',
                WebkitTextStroke: isLg ? '1px #000' : 'none',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                textTransform: 'uppercase',
              }}>
                {isLg && hasBrandCtx ? adaptCaption(video.topText, brand) : video.topText}
              </p>
            </div>
          )}
          {video.bottomText && (
            <div style={{ padding: isLg ? '0 12px 52px' : '0 6px 36px', textAlign: 'center' }}>
              <p style={{
                color: 'white', fontWeight: 900,
                fontSize: isLg ? 16 : 10, lineHeight: 1.3, margin: 0,
                textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.7)',
                WebkitTextStroke: isLg ? '1px #000' : 'none',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                textTransform: 'uppercase',
              }}>
                {isLg && hasBrandCtx ? adaptCaption(video.bottomText, brand) : video.bottomText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIDEO-HOOK-AND-DEMO: hook text overlay at top */}
      {video.contentType === 'video-hook-and-demo' && video.hookText && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', pointerEvents: 'none' }}>
          <div style={{ padding: isLg ? '40px 14px 48px' : '28px 8px 32px', background: 'linear-gradient(rgba(0,0,0,0.8) 50%, transparent)' }}>
            <p style={{
              color: 'white', fontWeight: 800,
              fontSize: isLg ? 15 : 10, lineHeight: 1.4, margin: 0,
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              display: '-webkit-box', WebkitLineClamp: isLg ? 5 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {isLg && hasBrandCtx ? adaptCaption(video.hookText, brand) : video.hookText}
            </p>
          </div>
        </div>
      )}

      {/* DEFAULT: fallback for unknown content types */}
      {!video.contentType && video.caption && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
          <div style={{ padding: isLg ? '40px 12px 52px' : '24px 8px 36px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75) 60%)' }}>
            <p style={{ color: 'white', fontWeight: isLg ? 800 : 700, fontSize: isLg ? 13 : 10, lineHeight: 1.4, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.9)', display: '-webkit-box', WebkitLineClamp: isLg ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.caption}
            </p>
          </div>
        </div>
      )}

      {/* Original stats on left card when showOriginalStats */}
      {showOriginalStats && !isLg && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', gap: 8, zIndex: 4 }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10 }}>{'\u2764\uFE0F'}</span>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{fmtNum(video.num_likes)}</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10 }}>{'\u{1F441}'}</span>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{fmtNum(video.num_views)}</span>
          </div>
        </div>
      )}

      {/* Side metrics (large card only) */}
      {isLg && (
        <div style={{ position: 'absolute', right: 8, bottom: 60, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', zIndex: 5 }}>
          {onSave && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={e => { e.stopPropagation(); onSave(video) }} style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'} title="Save to Library">
                <Bookmark size={15} color="white" />
              </button>
              <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>Save</span>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>{'\u2764\uFE0F'}</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_likes)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>{'\u{1F441}'}</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_views)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: erBg, borderRadius: 6, padding: '3px 6px' }}>
              <span style={{ color: erColor, fontSize: 9, fontWeight: 800 }}>ER {erText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Remix button */}
      <div style={{ position: 'absolute', bottom: isLg ? 10 : 6, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        <button onClick={e => { e.stopPropagation(); onRemix && onRemix(video) }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: isLg ? 'rgba(17,17,17,0.92)' : 'rgba(17,17,17,0.85)', borderRadius: 9999, padding: isLg ? '7px 14px' : '4px 10px', color: 'white', fontSize: isLg ? 12 : 10, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {'\u{1F504}'} Remix this
        </button>
      </div>

      {/* Caption + micro-structure below center card */}
      {video.caption && isLg && (
        <div style={{ position: 'absolute', bottom: -32, left: -10, right: -10, textAlign: 'center', pointerEvents: 'none' }}>
          <p style={{ color: '#6B7280', fontSize: 9, fontWeight: 500, lineHeight: 1.2, margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hasBrandCtx ? brandAdaptedCaption : video.caption}</p>
          {getMicroStructure() && (
            <p style={{ color: '#9CA3AF', fontSize: 8, fontWeight: 600, lineHeight: 1.4, margin: '3px 0 0', letterSpacing: '0.02em' }}>{getMicroStructure()}</p>
          )}
        </div>
      )}
    </div>
  )
}

function EditContentModal({ video, brand, onClose, showToast }) {
  const [activeTab, setActiveTab] = useState('assets')
  const [mentionBiz, setMentionBiz] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [regenerating, setRegenerat] = useState(false)
  const [textWeight, setTextWeight] = useState(700)
  const [textSize, setTextSize] = useState(18)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [bgOption, setBgOption] = useState('None')
  const [exporting, setExporting] = useState(false)
  const [mp4Url, setMp4Url] = useState(null)

  const hasBrand = brand && brand.brandName

  const handleExportMP4 = async () => {
    setExporting(true)
    setMp4Url(null)
    try {
      const ct = video.contentType || 'wall-of-text'
      const contentType = ct === 'video-hook' ? 'video-hook-and-demo'
        : ct === 'green-screen' ? 'green-screen-meme' : ct
      const renderData = { brandName: brand?.brandName || '' }

      if (ct === 'slideshow' && video.slides) {
        renderData.slides = video.slides.map(s => ({
          title: s.title || s.heading || '',
          body: s.body || s.text || '',
        }))
      } else if (ct.includes('video-hook')) {
        renderData.hook = video.hookText || video.caption?.slice(0, 60) || 'Hook'
        renderData.body = video.caption || ''
      } else if (ct.includes('green-screen')) {
        const raw = video.caption || video.textOverlay || ''
        const lines = raw.split('\n').filter(l => l.trim())
        renderData.topText = lines[0] || 'Top'
        renderData.bottomText = lines[lines.length - 1] || 'Bottom'
      } else {
        renderData.text = video.caption || video.textOverlay || 'Content'
      }

      const resp = await api.post('/render', { contentType, data: renderData })
      if (resp.data?.url) {
        setMp4Url(resp.data.url)
        const link = document.createElement('a')
        link.href = resp.data.url
        link.download = resp.data.fileName || 'export.mp4'
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        showToast('MP4 exported!')
      }
    } catch {
      showToast('MP4 export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerat(true)
    try {
      await api.post('/content/remix', {
        originalCaption: video.caption || video.textOverlay || video.hookText || '',
        contentType: video.contentType || 'wall-of-text',
        prompt,
        mentionBusiness: mentionBiz,
      })
      showToast('Text regenerated!')
    } catch {
      showToast('Regeneration failed - try again')
    } finally {
      setRegenerat(false)
    }
  }

  const tabBtnStyle = (isActive) => ({
    flex: 1, padding: '10px 0', border: 'none', borderBottom: isActive ? '2px solid #111827' : '2px solid transparent',
    background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
    color: isActive ? '#111827' : '#9CA3AF', transition: 'all 0.15s',
  })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, width: 480, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Edit Content</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color="#6B7280" /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', margin: '12px 22px 0' }}>
          <button onClick={() => setActiveTab('assets')} style={tabBtnStyle(activeTab === 'assets')}>Assets & Prompt</button>
          <button onClick={() => setActiveTab('style')} style={tabBtnStyle(activeTab === 'style')}>Style</button>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          {activeTab === 'assets' ? (
            <>
              {/* Current media preview */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 80, height: 142, borderRadius: 10, overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  <img src={video.thumbnail || video.slides?.[0]?.imageUrl || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Media</div>
                  <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.caption || 'No caption'}</p>
                  <button style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#FAFAFA', fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Swap Media</button>
                </div>
              </div>

              {/* Mention business toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '10px 14px', background: '#F9FAFB', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Mention Your Business?</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{hasBrand ? brand.brandName : 'Set up brand first'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setMentionBiz(true)} style={{ padding: '4px 12px', borderRadius: 6, border: mentionBiz ? '2px solid #10B981' : '1px solid #E5E7EB', background: mentionBiz ? '#F0FDF4' : 'white', fontSize: 11, fontWeight: 600, color: mentionBiz ? '#059669' : '#6B7280', cursor: 'pointer' }}>Yes</button>
                  <button onClick={() => setMentionBiz(false)} style={{ padding: '4px 12px', borderRadius: 6, border: !mentionBiz ? '2px solid #EF4444' : '1px solid #E5E7EB', background: !mentionBiz ? '#FEF2F2' : 'white', fontSize: 11, fontWeight: 600, color: !mentionBiz ? '#DC2626' : '#6B7280', cursor: 'pointer' }}>No</button>
                </div>
              </div>

              {/* Prompt textarea */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Prompt (optional)</div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Add instructions for regeneration... e.g., 'Make it funnier' or 'Focus on the product benefit'" style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12, lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Regenerate button */}
              <button onClick={handleRegenerate} disabled={regenerating} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: '#111827', color: 'white', fontSize: 13, fontWeight: 700, cursor: regenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s', opacity: regenerating ? 0.7 : 1 }}>
                {regenerating && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {regenerating ? 'Regenerating...' : 'Regenerate Text'}
              </button>

              {/* Export MP4 button */}
              <button onClick={handleExportMP4} disabled={exporting} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: exporting ? '#374151' : 'linear-gradient(135deg, #6C3CE1, #E84393)', color: 'white', fontSize: 13, fontWeight: 700, cursor: exporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s', opacity: exporting ? 0.8 : 1, marginTop: 8 }}>
                {exporting ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Rendering MP4...</>
                ) : (
                  <><Film size={14} /> Export MP4</>
                )}
              </button>
              {mp4Url && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#059669', textAlign: 'center' }}>
                  <Film size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  MP4 ready — <a href={mp4Url} download style={{ color: '#6C3CE1', fontWeight: 600, textDecoration: 'underline' }}>Download</a>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Text Weight slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Text Weight</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{textWeight}</span>
                </div>
                <input type="range" min={300} max={900} step={100} value={textWeight} onChange={e => setTextWeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#111827' }} />
              </div>

              {/* Text Size slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Text Size</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{textSize}px</span>
                </div>
                <input type="range" min={10} max={48} value={textSize} onChange={e => setTextSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#111827' }} />
              </div>

              {/* Text Color */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Text Color</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 4, padding: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{textColor}</span>
                  </div>
                </div>
              </div>

              {/* Stroke Width */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Stroke Width</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{strokeWidth}px</span>
                </div>
                <input type="range" min={0} max={5} step={0.5} value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} style={{ width: '100%', accentColor: '#111827' }} />
              </div>

              {/* Stroke Color */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Stroke Color</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 4, padding: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{strokeColor}</span>
                  </div>
                </div>
              </div>

              {/* Background option */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Background</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['White', 'None', 'Snapchat'].map(opt => (
                    <button key={opt} onClick={() => setBgOption(opt)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: bgOption === opt ? '2px solid #111827' : '1px solid #E5E7EB', background: bgOption === opt ? '#F3F4F6' : 'white', fontSize: 12, fontWeight: bgOption === opt ? 700 : 500, color: bgOption === opt ? '#111827' : '#6B7280', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview swatch */}
              <div style={{ background: bgOption === 'White' ? 'white' : bgOption === 'Snapchat' ? '#FFFC00' : '#111', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: textWeight, fontSize: textSize, color: textColor, WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : 'none' }}>
                  Preview
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
