import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Settings, X, Check } from 'lucide-react'
import { VIRAL_CONTENT, CONTENT_TAGS, fmtNum, getByType } from '../lib/viralContent'

// Shuffle for variety
const SHUFFLED = [...VIRAL_CONTENT].sort(() => Math.random() - 0.5)

export default function Blitz() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [activeType, setActiveType] = useState(null)
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

  const TYPES = [
    { id: 'slideshow', label: 'Slideshow' },
    { id: 'wall-of-text', label: 'Wall of Text' },
    { id: 'video-hook', label: 'Video Hook' },
    { id: 'green-screen', label: 'Green Screen' },
  ]

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>

      {/* Top tag + type bar — exactly like Fastlane */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 24px', background: 'white', borderBottom: '1px solid rgba(229,231,235,0.6)', flexWrap: 'wrap' }}>
        {/* Type filter pill */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 9999, padding: 2, gap: 2 }}>
          <button onClick={() => setActiveType(null)} style={{ padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: !activeType ? 700 : 400, background: !activeType ? 'white' : 'transparent', color: !activeType ? '#111827' : '#6B7280' }}>All</button>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setActiveType(activeType === t.id ? null : t.id)} style={{ padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: activeType === t.id ? 700 : 400, background: activeType === t.id ? 'white' : 'transparent', color: activeType === t.id ? '#111827' : '#6B7280' }}>{t.label}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: '#E5E7EB' }} />

        {/* Tag filters — exact real tags from Fastlane */}
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
          <button onClick={() => advance(-1)} style={{ position: 'absolute', left: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>‹</button>

          {/* 3-card stack — EXACT Fastlane layout */}
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
            } : prev} size="sm" label={cur.remixedFrom ? "Remixed From" : null} onClick={() => advance(-1)} />

            {/* CENTER card (MAIN) */}
            <BlitzCard video={cur} size="lg" active />

            {/* RIGHT card */}
            <BlitzCard video={next} size="sm" onClick={() => advance(1)} />
          </div>

          {/* Right nav arrow */}
          <button onClick={() => advance(1)} style={{ position: 'absolute', right: 24, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 20, color: '#374151', flexShrink: 0 }}>›</button>

          {/* Bottom action buttons — EXACT like Fastlane */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => advance(1)} style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <X size={20} color="#374151" />
            </button>
            <Link to="/content" style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              ✏️ Edit
            </Link>
            <button onClick={() => advance(1)} style={{ width: 48, height: 48, borderRadius: '50%', background: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
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
    </div>
  )
}

// ─── BlitzCard: renders a TikTok card (sm or lg) ────────────────
function BlitzCard({ video, size = 'sm', active = false, label = null, onClick }) {
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
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>❤️</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_likes)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 2 }}>👁</div>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{fmtNum(video.num_views)}</span>
          </div>
        </div>
      )}

      {/* Remix button */}
      <div style={{ position: 'absolute', bottom: isLg ? 10 : 6, left: '50%', transform: 'translateX(-50%)' }}>
        <Link to="/content" onClick={e => e.stopPropagation()} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: isLg ? 'rgba(17,17,17,0.92)' : 'rgba(17,17,17,0.85)',
          borderRadius: 9999, padding: isLg ? '7px 14px' : '4px 10px',
          color: 'white', fontSize: isLg ? 12 : 10, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap'
        }}>
          🔄 Remix this
        </Link>
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
