import { useState, useRef, useEffect } from 'react'
import { Copy, ChevronLeft, ChevronRight, RefreshCw, Edit3, Save } from 'lucide-react'
import api from '../lib/api'
import { VIRAL_CONTENT, CONTENT_TAGS } from '../lib/viralContent'
import { formatNumber } from '../lib/utils'

const TABS = [
  { id: 'slideshow', label: 'Slideshow', path: 'slideshow' },
  { id: 'wall-of-text', label: 'Wall of Text', path: 'wall-of-text' },
  { id: 'video-hook', label: 'Video Hook & Demo', path: 'video-hook' },
  { id: 'green-screen', label: 'Green Screen Meme', path: 'green-screen' },
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
}

// 3D stacked carousel — like Fastlane's real carousel
function VideoCarousel({ videos, activeIdx, onNavigate }) {
  const prev2 = videos[(activeIdx - 2 + videos.length) % videos.length]
  const prev1 = videos[(activeIdx - 1 + videos.length) % videos.length]
  const current = videos[activeIdx]
  const next1 = videos[(activeIdx + 1) % videos.length]
  const next2 = videos[(activeIdx + 2) % videos.length]

  const cards = [
    { video: prev2, offset: -2, scale: 0.68, z: 0, opacity: 0.3, rotate: -12 },
    { video: prev1, offset: -1, scale: 0.82, z: 1, opacity: 0.6, rotate: -6 },
    { video: current, offset: 0, scale: 1, z: 2, opacity: 1, rotate: 0 },
    { video: next1, offset: 1, scale: 0.82, z: 1, opacity: 0.6, rotate: 6 },
    { video: next2, offset: 2, scale: 0.68, z: 0, opacity: 0.3, rotate: 12 },
  ]

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {/* Left arrow */}
      <button
        onClick={() => onNavigate(-1)}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, width: 30, height: 30, borderRadius: '50%',
          background: 'white', border: '1px solid #E5E7EB',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronLeft size={16} color="#374151" />
      </button>

      {/* Cards — perspective container */}
      <div style={{ position: 'relative', width: 500, height: 400, perspective: '800px' }}>
        {cards.map(({ video, offset, scale, z, opacity, rotate }, i) => {
          if (!video) return null
          const isCenter = offset === 0
          const xPx = offset * 120

          return (
            <div
              key={`${video.id}-${offset}`}
              onClick={() => !isCenter && onNavigate(offset)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 195,
                aspectRatio: '9/16',
                transform: `translate(-50%, -50%) translateX(${xPx}px) scale(${scale}) rotateY(${rotate}deg)`,
                transformOrigin: 'center center',
                zIndex: z + (isCenter ? 10 : 0),
                opacity,
                borderRadius: isCenter ? 18 : 14,
                overflow: 'hidden',
                background: '#111',
                cursor: isCenter ? 'default' : 'pointer',
                transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: isCenter ? '0 16px 48px rgba(0,0,0,0.5)' : 'none',
              }}
            >
              {video.videoUrl && (
                <video
                  key={video.id}
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  autoPlay={isCenter}
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}

              {/* Caption overlay */}
              {isCenter && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '40px 12px 52px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                }}>
                  <p style={{
                    color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1.3,
                    margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {video.caption}
                  </p>
                  {video.subCaption && (
                    <p style={{
                      color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 400,
                      margin: '4px 0 0', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {video.subCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Side card label (non-center) */}
              {!isCenter && Math.abs(offset) === 1 && video.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '24px 8px 40px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                }}>
                  <p style={{
                    color: 'white', fontSize: 10, fontWeight: 700, lineHeight: 1.25,
                    margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {video.caption}
                  </p>
                </div>
              )}

              {/* Stats (center card only) */}
              {isCenter && (
                <div style={{
                  position: 'absolute', right: 8, bottom: 56,
                  display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>❤️</div>
                    <span style={{ color: 'white', fontSize: 9, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_likes)}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>👁</div>
                    <span style={{ color: 'white', fontSize: 9, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_views)}</span>
                  </div>
                </div>
              )}

              {/* Stats (adjacent cards) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', right: 6, bottom: 44, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12 }}>❤️</div>
                    <span style={{ color: 'white', fontSize: 8, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_likes)}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12 }}>👁</div>
                    <span style={{ color: 'white', fontSize: 8, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_views)}</span>
                  </div>
                </div>
              )}

              {/* Remix btn (center) */}
              {isCenter && (
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #EA580C, #F97316)',
                    border: 'none', borderRadius: 9999, padding: '5px 14px',
                    color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(234,88,12,0.5)'
                  }}>
                    🔄 Remix this
                  </button>
                </div>
              )}

              {/* Remix btn (adjacent) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>
                  <button style={{
                    background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 9999,
                    padding: '3px 10px', color: 'white', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                    🔄 Remix this
                  </button>
                </div>
              )}

              {/* Dot nav (center) */}
              {isCenter && (
                <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: i === 2 ? 10 : 3, height: 2.5, borderRadius: 2,
                      background: i === 2 ? 'white' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.3s'
                    }} />
                  ))}
                </div>
              )}

              {/* Dot nav (adjacent) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: i === 1 ? 7 : 2.5, height: 2, borderRadius: 2, background: i === 1 ? 'white' : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => onNavigate(1)}
        style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, width: 30, height: 30, borderRadius: '50%',
          background: 'white', border: '1px solid #E5E7EB',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronRight size={16} color="#374151" />
      </button>
    </div>
  )
}

// Trending panel (right side)
function TrendingPanel({ tab }) {
  const [activeIdx, setActiveIdx] = useState(2)
  const [activeView, setActiveView] = useState('trending')
  const [activeTag, setActiveTag] = useState(null)

  const filtered = VIRAL_CONTENT.filter(v => {
    if (activeTag) return v.tags?.includes(activeTag)
    return true
  })

  const navigate = (dir) => {
    setActiveIdx(i => (i + dir + filtered.length) % filtered.length)
  }

  const currentVideo = filtered[activeIdx % filtered.length] || filtered[0]
  const currentTags = currentVideo?.tags || []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => setActiveView('trending')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9999,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeView === 'trending' ? '#FFF7ED' : 'transparent',
            color: activeView === 'trending' ? '#EA580C' : '#9CA3AF',
            transition: 'all 0.15s'
          }}
        >
          <span style={{ fontSize: 14 }}>🔥</span> Trending Content
        </button>
        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 4px' }} />
        <button
          onClick={() => setActiveView('preview')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9999,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeView === 'preview' ? '#F9FAFB' : 'transparent',
            color: activeView === 'preview' ? '#374151' : '#9CA3AF',
            transition: 'all 0.15s'
          }}
        >
          <span style={{ fontSize: 13 }}>✓</span> Preview
        </button>
      </div>

      {/* Tag pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        {currentTags.slice(0, 4).map(tag => {
          const colors = TAG_COLORS[tag] || { bg: '#F3F4F6', text: '#374151' }
          return (
            <span key={tag} style={{
              padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
              background: colors.bg, color: colors.text
            }}>{tag}</span>
          )
        })}
      </div>

      {/* 3D Carousel — takes remaining space */}
      {filtered.length > 0 && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <VideoCarousel
            videos={filtered}
            activeIdx={activeIdx % filtered.length}
            onNavigate={navigate}
          />
        </div>
      )}
    </div>
  )
}

// Left form
function ContentForm({ tab, onGenerate, loading, trendingThumb }) {
  const [form, setForm] = useState({ isBusiness: true, prompt: '', mode: 'remix' })

  const typeMap = {
    slideshow: 'slideshow',
    'wall-of-text': 'walloftext',
    'video-hook': 'videohook',
    'green-screen': 'greenscreen'
  }

  const placeholders = {
    slideshow: 'What should this slideshow be about?',
    'wall-of-text': 'What should the wall of text caption be about?',
    'video-hook': 'What should this video hook be about?',
    'green-screen': 'What should this green screen meme be about?'
  }

  const trendingLabels = {
    slideshow: 'Trending slideshow',
    'wall-of-text': 'Trending wall of text',
    'video-hook': 'Trending video hook',
    'green-screen': 'Trending meme',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mode toggle */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Mode</div>
        <div style={{ display: 'flex', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ l: '⊕ Create New', v: 'create' }, { l: '🔄 Remix', v: 'remix' }].map(o => (
            <button
              key={o.v}
              onClick={() => setForm(f => ({ ...f, mode: o.v }))}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500,
                background: form.mode === o.v ? (o.v === 'remix' ? '#EA580C' : 'white') : 'transparent',
                color: form.mode === o.v ? (o.v === 'remix' ? 'white' : '#111827') : '#6B7280',
                boxShadow: form.mode === o.v && o.v === 'create' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Mention business */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Mention your business?</div>
        <div style={{ display: 'flex', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ l: 'Yes', v: true }, { l: 'No', v: false }].map(o => (
            <button
              key={String(o.v)}
              onClick={() => setForm(f => ({ ...f, isBusiness: o.v }))}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: form.isBusiness === o.v ? '#EA580C' : 'transparent',
                color: form.isBusiness === o.v ? 'white' : '#6B7280',
                transition: 'all 0.15s'
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Trending reference with thumbnail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB'
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
          {trendingLabels[tab] || 'Trending content'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {trendingThumb && (
            <img
              src={trendingThumb}
              alt=""
              style={{ width: 28, height: 36, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <button style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB',
            background: 'white', fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer'
          }}>Change</button>
        </div>
      </div>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Prompt <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
        </div>
        <textarea
          value={form.prompt}
          onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
          placeholder={placeholders[tab] || 'What should this content be about?'}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: '1px solid #E5E7EB', fontSize: 13, color: '#374151',
            resize: 'none', height: 80, outline: 'none',
            fontFamily: 'inherit', background: 'white', lineHeight: 1.5,
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={() => onGenerate({
          topic: form.prompt || 'viral content for my business',
          platform: 'tiktok',
          tone: 'engaging',
          type: typeMap[tab] || 'slideshow',
          mode: form.mode,
          isBusiness: form.isBusiness
        })}
        disabled={loading}
        style={{
          width: '100%', padding: '13px', borderRadius: 10, border: 'none',
          background: loading ? '#F97316' : '#EA580C',
          color: 'white', fontWeight: 700, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.15s', boxShadow: loading ? 'none' : '0 2px 8px rgba(234,88,12,0.3)'
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 16, height: 16,
              border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            Generating...
          </>
        ) : '🔄 Generate'}
      </button>
    </div>
  )
}

// Slideshow preview (after generation)
function SlideshowPreview({ data, onClear, onSave }) {
  const [idx, setIdx] = useState(0)
  const COLORS = ['#EA580C','#1a1a1a','#6366f1','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ef4444']
  const slide = data.slides?.[idx]
  if (!slide) return null
  const bg = COLORS[idx % COLORS.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 320, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Slideshow Preview</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Save size={12} /> Save
          </button>
          <button onClick={onClear} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Clear</button>
        </div>
      </div>

      {/* Slide */}
      <div style={{
        width: 240, aspectRatio: '9/16', borderRadius: 18, overflow: 'hidden',
        background: slide.bgImage ? `url(${slide.bgImage}) center/cover` : bg,
        position: 'relative', boxShadow: '0 16px 48px rgba(0,0,0,0.3)'
      }}>
        {slide.bgImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{slide.emoji}</div>
          <div style={{
            color: 'white', fontWeight: 800, fontSize: 17, lineHeight: 1.3, marginBottom: 10,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>{slide.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 1.6 }}>{slide.body}</div>
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {data.slides.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 14 : 4, height: 3, borderRadius: 2,
              background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.3s'
            }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <button onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 13, color: '#6B7280', minWidth: 60, textAlign: 'center' }}>{idx + 1} / {data.slides.length}</span>
        <button onClick={() => setIdx(i => Math.min(data.slides.length-1, i+1))} disabled={idx === data.slides.length-1}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: idx === data.slides.length-1 ? 'default' : 'pointer', opacity: idx === data.slides.length-1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Caption */}
      {slide.cta && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', maxWidth: 280, width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#C2410C', fontWeight: 600 }}>💡 Add a CTA caption & hashtags before posting</span>
        </div>
      )}
    </div>
  )
}

// Text result preview (Wall of Text / Video Hook / Green Screen)
function TextPreview({ result, onClear }) {
  const [copied, setCopied] = useState(false)
  const copy = t => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const labels = { walloftext: 'Generated Post', videohook: 'Video Script', greenscreen: 'Meme Content' }
  const content = result.data?.content || ''

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{labels[result.type] || 'Generated Content'}</span>
        <button onClick={onClear} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Clear</button>
      </div>

      {/* Preview pane */}
      {result.type === 'greenscreen' && result.data?.bgVideo?.thumbnail && (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12, aspectRatio: '9/16', maxWidth: 200 }}>
          <img src={result.data.bgVideo.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, textAlign: 'center' }}>
            {content.match(/TOP_TEXT: (.+)/)?.[1] && (
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: 'auto' }}>
                {content.match(/TOP_TEXT: (.+)/)[1]}
              </div>
            )}
            {content.match(/BOTTOM_TEXT: (.+)/)?.[1] && (
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginTop: 'auto' }}>
                {content.match(/BOTTOM_TEXT: (.+)/)[1]}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
        fontSize: 13, lineHeight: 1.7, color: '#111827', whiteSpace: 'pre-wrap',
        flex: 1, overflowY: 'auto', border: '1px solid #E5E7EB',
        fontFamily: result.type === 'videohook' ? 'monospace' : 'inherit'
      }}>
        {content}
      </div>

      <button
        onClick={() => copy(content)}
        style={{
          marginTop: 10, width: '100%', padding: '9px', border: '1px solid #E5E7EB',
          borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
        }}
      >
        <Copy size={13} /> {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default function Content() {
  const [tab, setTab] = useState('slideshow')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Get thumbnail for "Trending X" field — use first viral video of current tab type
  const typeMap = { slideshow: 'slideshow', 'wall-of-text': 'walloftext', 'video-hook': 'videohook', 'green-screen': 'greenscreen' }
  const tabVids = VIRAL_CONTENT.filter(v => {
    const t = typeMap[tab]
    if (t === 'slideshow') return v.contentType === 'slideshow' || !v.contentType
    return true
  })
  const trendingThumb = tabVids[0]?.thumbnail

  const handleGenerate = async ({ topic, platform, tone, type }) => {
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post(`/generate/${type}`, { topic, platform, tone })
      setResult({ type, data })
    } catch {
      alert('Generation failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    try {
      await api.post('/library/save', {
        type: result.type,
        platform: 'tiktok',
        title: result.data.topic || 'Generated content',
        content_json: result.data,
        thumbnail_url: result.data.slides?.[0]?.bgImage || ''
      })
      alert('Saved to Library!')
    } catch {
      alert('Save failed.')
    }
  }

  const isTextResult = result && ['walloftext','videohook','greenscreen'].includes(result.type)
  const isSlideshowResult = result && result.type === 'slideshow' && result.data?.slides

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>

      {/* Top tabs — centered pill style like real Fastlane */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '12px 24px', background: 'white',
        borderBottom: '1px solid rgba(229,231,235,0.8)', flexShrink: 0, gap: 6
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null) }}
            style={{
              padding: '7px 18px', border: '1px solid',
              borderColor: tab === t.id ? '#D1D5DB' : 'transparent',
              borderRadius: 9999, background: tab === t.id ? 'white' : 'transparent',
              cursor: 'pointer', fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#111827' : '#6B7280',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body: left form | right panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — form */}
        <div style={{
          width: 300, background: 'white', borderRight: '1px solid rgba(229,231,235,0.8)',
          padding: '20px', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0
        }}>
          <ContentForm tab={tab} onGenerate={handleGenerate} loading={loading} trendingThumb={trendingThumb} />
        </div>

        {/* Right panel — trending carousel or result preview */}
        <div style={{ flex: 1, padding: '16px 20px 16px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isSlideshowResult ? (
            <SlideshowPreview data={result.data} onClear={() => setResult(null)} onSave={handleSave} />
          ) : isTextResult ? (
            <TextPreview result={result} onClear={() => setResult(null)} />
          ) : (
            <TrendingPanel tab={tab} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
