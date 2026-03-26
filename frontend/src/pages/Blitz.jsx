import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, X, Check } from 'lucide-react'
import { VIRAL_CONTENT, CONTENT_TAGS, fmtNum, getByType } from '../lib/viralContent'

// Shuffle for variety
const SHUFFLED = [...VIRAL_CONTENT].sort(() => Math.random() - 0.5)

// Theme/niche options for the remix modal
const THEMES = [
  { id: 'b2b-saas', label: 'B2B SaaS', emoji: '🏢', bg: '#EEF2FF', border: '#818CF8' },
  { id: 'b2c-app', label: 'B2C App', emoji: '📱', bg: '#F0FDF4', border: '#4ADE80' },
  { id: 'ecommerce', label: 'E-Commerce', emoji: '🛒', bg: '#FFF7ED', border: '#FB923C' },
  { id: 'fitness', label: 'Fitness', emoji: '💪', bg: '#FEF2F2', border: '#F87171' },
  { id: 'finance', label: 'Finance', emoji: '💰', bg: '#ECFDF5', border: '#34D399' },
  { id: 'self-improvement', label: 'Self Improvement', emoji: '🧠', bg: '#FAF5FF', border: '#C084FC' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', bg: '#FDF2F8', border: '#F472B6' },
  { id: 'health', label: 'Health', emoji: '🩺', bg: '#F0FDFA', border: '#2DD4BF' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡', bg: '#FFFBEB', border: '#FBBF24' },
  { id: 'course-digital', label: 'Course/Digital Product', emoji: '🎓', bg: '#EFF6FF', border: '#60A5FA' },
  { id: 'personal-brand', label: 'Personal Brand', emoji: '🌟', bg: '#FEF9C3', border: '#FACC15' },
  { id: 'spirituality', label: 'Spirituality', emoji: '🕊️', bg: '#F5F3FF', border: '#A78BFA' },
]

export default function Blitz() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [modalVideo, setModalVideo] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const timerRef = useRef(null)

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
    setSelectedTheme(null)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setModalVideo(null), 200)
  }

  const handleContinue = () => {
    if (!selectedTheme || !modalVideo) return
    navigate(`/content?videoId=${modalVideo.id}&theme=${selectedTheme}&mode=remix`)
  }

  const TYPES = [
    { id: 'slideshow', label: 'Slideshow' },
    { id: 'wall-of-text', label: 'Wall of Text' },
    { id: 'video-hook', label: 'Video Hook' },
    { id: 'green-screen', label: 'Green Screen' },
  ]

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>

      {/* Top tag + type bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 24px', background: 'white', borderBottom: '1px solid rgba(229,231,235,0.6)', flexWrap: 'wrap' }}>
        {/* Type filter pill */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 9999, padding: 2, gap: 2 }}>
          <button onClick={() => setActiveType(null)} style={{ padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: !activeType ? 700 : 400, background: !activeType ? 'white' : 'transparent', color: !activeType ? '#111827' : '#6B7280' }}>All</button>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setActiveType(activeType === t.id ? null : t.id)} style={{ padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: activeType === t.id ? 700 : 400, background: activeType === t.id ? 'white' : 'transparent', color: activeType === t.id ? '#111827' : '#6B7280' }}>{t.label}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: '#E5E7EB' }} />

        {/* Tag filters */}
        {CONTENT_TAGS.slice(0, 6).map(t => (
          <button key={t.label} onClick={() => setActiveTag(activeTag === t.label ? null : t.label)} style={{
            padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
            background: activeTag === t.label ? t.color : 'white',
            color: activeTag === t.label ? t.textColor : '#6B7280',
            border: `1px solid ${activeTag === t.label ? t.color : '#E5E7EB'}`,
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}>{t.label}</button>
        ))}

        <div style={{ width: 1, height: 16, background: '#E5E7EB' }} />

        <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, border: '1px solid #E5E7EB', background: 'white', fontSize: 11, color: '#6B7280', cursor: 'pointer' }}>
          ⓘ Why This Content?
        </button>
      </div>

      {/* Main carousel + prefs panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Carousel area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: 64 }}>

          {/* Left nav arrow */}
          <button onClick={() => advance(-1)} style={{ position: 'absolute', left: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>&#8249;</button>

          {/* 3-card stack */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative' }}>

            {/* LEFT card */}
            <BlitzCard video={cur.remixedFrom ? {
              videoUrl: cur.remixedFrom.videoUrl,
              thumbnail: cur.remixedFrom.thumbnail,
              caption: cur.remixedFrom.caption,
              num_likes: cur.remixedFrom.num_likes,
              num_views: cur.remixedFrom.num_views,
              isRemixSource: true,
              username: cur.remixedFrom.username,
            } : prev} size="sm" label={cur.remixedFrom ? "Remixed From" : null} onClick={() => advance(-1)} onRemix={openRemixModal} />

            {/* CENTER card (MAIN) */}
            <BlitzCard video={cur} size="lg" active onRemix={openRemixModal} />

            {/* RIGHT card */}
            <BlitzCard video={next} size="sm" onClick={() => advance(1)} onRemix={openRemixModal} />
          </div>

          {/* Right nav arrow */}
          <button onClick={() => advance(1)} style={{ position: 'absolute', right: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>&#8250;</button>

          {/* Bottom action buttons */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => advance(1)} style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <X size={20} color="#374151" />
            </button>
            <Link to="/content" style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              ✏️ Edit
            </Link>
            <button onClick={() => openRemixModal(cur)} style={{ width: 48, height: 48, borderRadius: '50%', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
              <Check size={22} color="white" />
            </button>
            <button onClick={() => setPaused(p => !p)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 9999, fontSize: 12, color: '#6B7280', cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {paused ? '▶ Resume' : '🔇 Mute'}
            </button>
          </div>

          {/* Settings gear */}
          <button onClick={() => setShowPrefs(p => !p)} style={{ position: 'absolute', right: showPrefs ? 256 : 16, top: 12, width: 34, height: 34, background: 'white', border: '1px solid #E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Settings size={15} color="#6B7280" />
          </button>
        </div>

        {/* Prefs side panel */}
        {showPrefs && (
          <div style={{ width: 240, background: 'white', borderLeft: '1px solid rgba(229,231,235,0.8)', padding: 20, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Preferences</span>
              <button onClick={() => setShowPrefs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={15} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Remix vs Original</div>
              <input type="range" min={0} max={100} defaultValue={50} style={{ width: '100%', accentColor: '#EA580C' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}><span>Remix</span><span>Original</span></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Content Type</div>
              {TYPES.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#EA580C', width: 14, height: 14 }} />
                  {t.label}
                </label>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Business Niches</div>
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

      {/* Theme Selector Modal */}
      {modalVideo && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: modalVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'white', borderRadius: 20, width: 520, maxHeight: '85vh',
              overflow: 'auto', padding: '28px 28px 24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              transform: modalVisible ? 'scale(1)' : 'scale(0.95)',
              opacity: modalVisible ? 1 : 0,
              transition: 'all 0.25s ease',
            }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 32, height: 32, borderRadius: '50%',
                background: '#F3F4F6', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} color="#6B7280" />
            </button>

            {/* Selected video preview */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 72, height: 128, borderRadius: 12, overflow: 'hidden',
                flexShrink: 0, background: '#111',
              }}>
                <img
                  src={modalVideo.thumbnail}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                  Remix this video
                </div>
                <p style={{
                  fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {modalVideo.caption}
                </p>
              </div>
            </div>

            {/* Theme label */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
              Choose your theme / niche
            </div>

            {/* Theme grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {THEMES.map(t => {
                const isSelected = selectedTheme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '14px 8px', borderRadius: 14,
                      background: isSelected ? t.bg : '#FAFAFA',
                      border: isSelected ? `2px solid ${t.border}` : '2px solid transparent',
                      boxShadow: isSelected ? `0 0 0 3px ${t.border}33` : 'none',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: isSelected ? '#111827' : '#6B7280',
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!selectedTheme}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                border: 'none', cursor: selectedTheme ? 'pointer' : 'not-allowed',
                background: selectedTheme ? '#111827' : '#E5E7EB',
                color: selectedTheme ? 'white' : '#9CA3AF',
                fontSize: 14, fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              Continue with this theme →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// BlitzCard component
function BlitzCard({ video, size = 'sm', active = false, label = null, onClick, onRemix }) {
  if (!video) return null
  const isLg = size === 'lg'
  const W = isLg ? 230 : 155

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
        opacity: isLg ? 1 : 0.72,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isLg ? '0 20px 60px rgba(0,0,0,0.55)' : '0 4px 16px rgba(0,0,0,0.28)',
        zIndex: isLg ? 2 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      <video
        key={video.videoUrl}
        src={video.videoUrl}
        poster={video.thumbnail}
        autoPlay muted loop playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Remix From label */}
      {label && (
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '3px 8px' }}>
          <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{label}</span>
        </div>
      )}

      {/* Caption overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
        <div style={{ padding: isLg ? '40px 12px 52px' : '24px 8px 36px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75) 60%)' }}>
          <p style={{
            color: 'white', fontWeight: isLg ? 800 : 700,
            fontSize: isLg ? 13 : 10, lineHeight: 1.4, margin: 0,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            display: '-webkit-box', WebkitLineClamp: isLg ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {video.caption}
          </p>
          {video.subCaption && isLg && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, lineHeight: 1.35, margin: '5px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.subCaption}
            </p>
          )}
        </div>
      </div>

      {/* Side metrics (only large) */}
      {isLg && (
        <div style={{ position: 'absolute', right: 8, bottom: 60, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>&#10084;&#65039;</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_likes)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>&#128065;</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_views)}</span>
          </div>
        </div>
      )}

      {/* Remix button — calls onRemix callback instead of navigating */}
      <div style={{ position: 'absolute', bottom: isLg ? 10 : 6, left: '50%', transform: 'translateX(-50%)' }}>
        <button onClick={e => { e.stopPropagation(); onRemix && onRemix(video); }} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: isLg ? 'rgba(17,17,17,0.92)' : 'rgba(17,17,17,0.85)',
          borderRadius: 9999, padding: isLg ? '7px 14px' : '4px 10px',
          color: 'white', fontSize: isLg ? 12 : 10, fontWeight: 700,
          border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
        }}>
          &#128260; Remix this
        </button>
      </div>

      {/* Dot indicators (large only) */}
      {isLg && (
        <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ width: i === 3 ? 14 : 4, height: 3, borderRadius: 2, background: i === 3 ? 'white' : 'rgba(255,255,255,0.35)', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  )
}
