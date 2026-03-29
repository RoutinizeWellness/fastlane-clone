import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, BarChart3, Eye, TrendingUp, CalendarDays, Zap, Sparkles, Image, Type, Film, Monitor, Users, BookOpen, Play } from 'lucide-react'
import api from '../lib/api'
import { useStore } from '../store'
import { VIRAL_CONTENT, fmtNum } from '../lib/viralContent'

const CHECKLIST_KEY = 'fl_home_checklist'
const getStoredChecklist = () => {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}') } catch { return {} }
}

const MARKETING_VIDEOS = [
  { title: 'Content Creation', url: 'https://framerusercontent.com/assets/6NUGLmWzt2KJ95WV1mQcKH43Uw.mp4' },
  { title: 'Remix in Action', url: 'https://framerusercontent.com/assets/AYCZkZeNDKxrsb61wQFr3EuC4.mp4' },
  { title: 'Schedule & Publish', url: 'https://framerusercontent.com/assets/YgYoTWarq2a1OdCzneCxbfH6pw.mp4' },
]

const TUTORIAL_VIDEOS = [
  { title: 'Intro & Homepage Guide', url: 'https://media.aftermark.ai/tutorials/compressed-intro-homepage-guide.mov' },
  { title: 'Blitz Guide', url: 'https://media.aftermark.ai/tutorials/compressed-blitz-guide.mov' },
  { title: 'Blitz Demo', url: 'https://media.aftermark.ai/tutorials/blitz-demo.mp4' },
  { title: 'Manual Creation Demo', url: 'https://media.aftermark.ai/tutorials/manual-creation-demo.mp4' },
  { title: 'Green Screen', url: 'https://media.aftermark.ai/tutorials/2-green-screen.mp4' },
  { title: 'Wall of Text', url: 'https://media.aftermark.ai/tutorials/3-wall-of-text.mp4' },
  { title: 'Hook & Demo', url: 'https://media.aftermark.ai/tutorials/4-hook-demo.mp4' },
  { title: 'Slideshows', url: 'https://media.aftermark.ai/tutorials/5-slideshows.mp4' },
  { title: 'Calendar & Library', url: 'https://media.aftermark.ai/tutorials/6-calendar-library.mp4' },
]

function TutorialVideoCard({ video }) {
  const videoRef = useRef(null)
  return (
    <div
      style={{
        flexShrink: 0, width: 220, borderRadius: 14, overflow: 'hidden',
        background: '#000', border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer'
      }}
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }}
    >
      <video
        ref={videoRef}
        src={video.url}
        muted
        loop
        playsInline
        preload="metadata"
        style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ padding: '10px 12px', background: 'white' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{video.title}</span>
      </div>
    </div>
  )
}

// Trending card carousel (same style as Content/Blitz)
function TrendingCard({ video, active }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#000',
      aspectRatio: '9/16',
      width: active ? 180 : 120,
      flexShrink: 0,
      transition: 'all 0.4s ease',
      opacity: active ? 1 : 0.6,
      boxShadow: active ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
      cursor: 'pointer'
    }}>
      <img src={video.thumbnail || video.slides?.[0]?.imageUrl || video.videoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Overlay bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 8px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
        {active && (
          <>
            <div style={{ color: 'white', fontSize: 11, fontWeight: 600, marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.caption || 'Trending content'}
            </div>
            <div style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
              <span>❤️ {fmtNum(video.num_likes || 5500)}</span>
              <span>👁 {fmtNum(video.num_views || 261000)}</span>
            </div>
          </>
        )}
      </div>
      {active && (
        <button style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(234,88,12,0.9)', border: 'none',
          borderRadius: 9999, padding: '4px 10px',
          color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          🔄 Remix this
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const { user, brand } = useStore()
  const [trending, setTrending] = useState([])
  const [trendIdx, setTrendIdx] = useState(2)
  const [loading, setLoading] = useState(true)

  const brandName = brand?.brandName || ''
  const industry = brand?.industry || ''

  // Use curated trending from VIRAL_CONTENT — only items with real image thumbnails
  useEffect(() => {
    const isImgUrl = (u) => u && (u.endsWith('.webp') || u.endsWith('.jpg') || u.endsWith('.png') || u.includes('%2Fslideshow%2F') || u.includes('/thumbnails/') || u.includes('/images/'))
    const hasThumb = (c) => isImgUrl(c.thumbnail) || (c.slides && c.slides[0] && isImgUrl(c.slides[0].imageUrl))
    // Prefer slideshows (always have image thumbnails) + items with worker thumbnails
    const good = VIRAL_CONTENT.filter(hasThumb)
    const shuffled = [...good].sort(() => Math.random() - 0.5)
    setTrending(shuffled.slice(0, 8))
    setLoading(false)
  }, [])

  // Auto-advance trending carousel
  useEffect(() => {
    if (trending.length === 0) return
    const t = setInterval(() => setTrendIdx(i => (i + 1) % trending.length), 4000)
    return () => clearInterval(t)
  }, [trending.length])

  // "What you can create" cards
  const createCards = [
    { icon: Image, label: 'Slideshow', tab: 'slideshow', desc: 'Image carousels that tell a story and drive swipes', color: '#3B82F6' },
    { icon: Type, label: 'Wall of Text', tab: 'wall-of-text', desc: 'Bold text overlays that stop the scroll instantly', color: '#8B5CF6' },
    { icon: Film, label: 'Hook & Demo', tab: 'video-hook-and-demo', desc: 'Viral hook paired with your product demo clip', color: '#EC4899' },
    { icon: Monitor, label: 'Green Screen', tab: 'green-screen-meme', desc: 'Trending meme backgrounds with your product overlay', color: '#10B981' },
  ]

  // Getting Started checklist with localStorage persistence
  const [checklist, setChecklist] = useState(() => getStoredChecklist())
  const checklistItems = [
    { key: 'brand_profile', label: 'Set up brand profile' },
    { key: 'first_content', label: 'Create first content' },
    { key: 'schedule_post', label: 'Schedule a post' },
    { key: 'connect_social', label: 'Connect social accounts' },
  ]
  const toggleCheck = useCallback((key) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next))
      return next
    })
  }, [])
  const checklistDone = checklistItems.filter(c => checklist[c.key]).length

  // Quick stats (placeholder values - in production these come from API)
  const stats = [
    { label: 'Total Posts', value: '24', icon: BarChart3, trend: '+3 this week', up: true },
    { label: 'Views this Month', value: '12.4K', icon: Eye, trend: '+18%', up: true },
    { label: 'Engagement Rate', value: '4.2%', icon: TrendingUp, trend: '+0.8%', up: true },
    { label: 'Scheduled', value: '7', icon: CalendarDays, trend: 'Next: Tomorrow', up: null },
  ]

  return (
    <div style={{ maxWidth: 900, padding: '32px 32px' }} className="animate-fade-up">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        borderRadius: 18, padding: '32px 36px', marginBottom: 28,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -20, width: 180, height: 180,
          background: 'rgba(234,88,12,0.12)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 60, width: 100, height: 100,
          background: 'rgba(234,88,12,0.08)', borderRadius: '50%',
        }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          {brandName ? `Welcome back, ${brandName}` : "Welcome to Fastlane"}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 400 }}>
          {brandName ? 'Your content engine is ready. Let\u2019s create something viral.' : 'Create scroll-stopping content in minutes, not hours.'}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{
              background: 'white', borderRadius: 14, padding: '18px 18px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={17} color="#EA580C" />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
              {stat.trend && (
                <div style={{
                  fontSize: 11, marginTop: 6, fontWeight: 600,
                  color: stat.up === true ? '#16A34A' : stat.up === false ? '#DC2626' : '#6B7280',
                  display: 'flex', alignItems: 'center', gap: 3
                }}>
                  {stat.up === true && <TrendingUp size={11} />}
                  {stat.trend}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
        <Link to="/blitz" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#EA580C', color: 'white',
          borderRadius: 10, padding: '12px 24px',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          transition: 'background 0.2s', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(234,88,12,0.25)'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#C2410C'}
          onMouseLeave={e => e.currentTarget.style.background = '#EA580C'}
        >
          <Zap size={16} /> Start Blitz <ArrowRight size={14} />
        </Link>
        <Link to="/content" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111827', color: 'white',
          borderRadius: 10, padding: '12px 24px',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          transition: 'background 0.2s', cursor: 'pointer'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#374151'}
          onMouseLeave={e => e.currentTarget.style.background = '#111827'}
        >
          <Sparkles size={16} /> Create Content
        </Link>
        <Link to="/calendar" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'white', color: '#111827',
          borderRadius: 10, padding: '12px 24px', border: '1px solid #E5E7EB',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          transition: 'all 0.2s', cursor: 'pointer'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.color = '#EA580C' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#111827' }}
        >
          <CalendarDays size={16} /> View Calendar
        </Link>
      </div>

      {/* Trending Content */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: '0 0 14px' }}>{industry ? `Trending in ${industry}` : 'Trending Content'}</h2>
        {loading ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #EA580C', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          </div>
        ) : (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', overflow: 'visible' }}>
              {/* Left arrow */}
              <button onClick={() => setTrendIdx(i => Math.max(0, i-1))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ‹
              </button>
              {/* Cards */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                {trending.slice(Math.max(0, trendIdx-1), trendIdx+3).map((v, i) => {
                  const isActive = i === (trendIdx > 0 ? 1 : 0)
                  return <TrendingCard key={v.id || i} video={v} active={isActive} />
                })}
              </div>
              {/* Right arrow */}
              <button onClick={() => setTrendIdx(i => Math.min(trending.length-1, i+1))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* What you can create */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: '0 0 14px' }}>What you can create</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {createCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.tab} to={`/content?tab=${card.tab}`} style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                background: 'white', border: '1px solid #E5E7EB',
                borderRadius: 14, padding: '20px 18px',
                textDecoration: 'none', color: '#111827',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${card.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={19} color={card.color} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{card.label}</span>
                <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{card.desc}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#EA580C', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Create <ArrowRight size={12} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* See it in action */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: '0 0 6px' }}>See it in action</h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>Watch how Fastlane turns ideas into scroll-stopping content.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {MARKETING_VIDEOS.map((vid) => (
            <div key={vid.url} style={{
              borderRadius: 14, overflow: 'hidden', background: '#000',
              border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <video
                src={vid.url}
                controls
                muted
                loop
                playsInline
                preload="metadata"
                style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '10px 12px', background: 'white' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{vid.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial Videos */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: '0 0 14px' }}>Tutorial Videos</h2>
        <div style={{
          display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8,
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
        }}>
          {TUTORIAL_VIDEOS.map((vid) => (
            <div key={vid.url} style={{ scrollSnapAlign: 'start' }}>
              <TutorialVideoCard video={vid} />
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Checklist + Community — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
        {/* Getting Started */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #E5E7EB',
          padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Getting Started</h3>
            <span style={{ fontSize: 12, fontWeight: 600, color: checklistDone === checklistItems.length ? '#16A34A' : '#6B7280' }}>
              {checklistDone}/{checklistItems.length}
            </span>
          </div>
          <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(checklistDone/checklistItems.length)*100}%`, background: checklistDone === checklistItems.length ? '#16A34A' : '#EA580C', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          {checklistItems.map((item, i) => (
            <div
              key={item.key}
              onClick={() => toggleCheck(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                borderBottom: i < checklistItems.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer', userSelect: 'none'
              }}
            >
              {checklist[item.key]
                ? <CheckCircle2 size={18} color="#16A34A" />
                : <Circle size={18} color="#D1D5DB" />
              }
              <span style={{
                fontSize: 13, flex: 1, fontWeight: 500,
                color: checklist[item.key] ? '#9CA3AF' : '#111827',
                textDecoration: checklist[item.key] ? 'line-through' : 'none',
                transition: 'all 0.2s'
              }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Community */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #E5E7EB',
          padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: '0 0 6px' }}>Community</h3>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px', lineHeight: 1.6 }}>
            Join other founders and creators sharing wins, strategies, and feedback.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <a href="https://discord.gg/aaAQ9VzQ6j" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10,
              background: '#5865F2', color: 'white',
              textDecoration: 'none', fontWeight: 700, fontSize: 13,
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#4752C4'}
              onMouseLeave={e => e.currentTarget.style.background = '#5865F2'}
            >
              <Users size={15} /> Join our Discord
            </a>
            <Link to="/guide" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10,
              background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB',
              textDecoration: 'none', fontWeight: 700, fontSize: 13,
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.color = '#EA580C' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
            >
              <BookOpen size={15} /> View Guide
            </Link>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: '0 0 14px' }}>Frequently Asked Questions</h2>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(229,231,235,0.8)', padding: '4px 20px' }}>
          {[
            { q: 'How do I warm up my account?', a: 'Behave like a normal user for 3-5 days. Set up your profile, scroll, like, and comment. After that, begin posting 1-2 times per day while continuing to engage.' },
            { q: 'Why these content formats?', a: 'Slideshows, wall of text, hook & demo, and green screen memes consistently perform very well across TikTok, Instagram and YouTube. They are fast to consume and feel native.' },
            { q: 'How does Remix work?', a: 'Remix matches the visual structure and hook psychology of trending content, then adapts it to your niche and product.' },
            { q: 'How many videos per day?', a: 'We recommend posting 1-3 times per day on each platform after warming up. Consistency matters more than intensity.' },
            { q: 'Do I need an existing audience?', a: 'No. Short-form content is distributed based on the content itself, not your follower count.' },
          ].map((faq, i) => (
            <details key={i} style={{ borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none' }}>
              <summary style={{
                padding: '14px 0', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: '#111827', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                {faq.q}
              </summary>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: '0 0 14px', paddingRight: 24 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

    </div>
  )
}
