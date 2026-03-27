import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import api from '../lib/api'
import { useStore } from '../store'
import { VIRAL_CONTENT, fmtNum } from '../lib/viralContent'

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
      <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  const { user } = useStore()
  const [trending, setTrending] = useState([])
  const [trendIdx, setTrendIdx] = useState(2)
  const [loading, setLoading] = useState(true)

  // Quickstart steps
  const steps = [
    { label: 'Swipe content in Blitz', done: true },
    { label: 'Connect your account', done: true },
    { label: 'Create your first content', done: false, action: true },
    { label: 'Schedule a post', done: false, action: true },
    { label: 'Upload a demo video', done: false, action: true },
    { label: 'Make your first post', done: false },
  ]
  const doneCount = steps.filter(s => s.done).length

  // Fetch trending from API, fallback to VIRAL_CONTENT
  useEffect(() => {
    api.get('/media/trending').then(r => {
      const vids = r.data.videos || []
      if (vids.length > 0) {
        setTrending(vids)
      } else {
        setTrending(VIRAL_CONTENT.slice(0, 5))
      }
    }).catch(() => {
      setTrending(VIRAL_CONTENT.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  // Auto-advance trending carousel
  useEffect(() => {
    if (trending.length === 0) return
    const t = setInterval(() => setTrendIdx(i => (i + 1) % trending.length), 4000)
    return () => clearInterval(t)
  }, [trending.length])

  // "What you can create" cards
  const createCards = [
    { emoji: '🖼️', label: 'Slideshow', tab: 'slideshow' },
    { emoji: '📝', label: 'Wall of Text', tab: 'wall-of-text' },
    { emoji: '🎬', label: 'Hook & Demo', tab: 'video-hook-and-demo' },
    { emoji: '🤪', label: 'Green Screen Meme', tab: 'green-screen-meme' },
  ]

  // Quick Actions
  const quickActions = [
    { label: 'Start Blitz', to: '/blitz', emoji: '⚡' },
    { label: 'Create Content', to: '/content', emoji: '✨' },
    { label: 'View Trending', to: '/trending', emoji: '📈' },
  ]

  return (
    <div style={{ maxWidth: 900, padding: '32px 32px' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        {/* Fastlane F logo */}
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none" style={{ marginBottom: 12 }}>
          <path d="M2 2h36v6H10v5h20v6H10v10H2V2z" fill="#111827"/>
        </svg>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
          Let's get your product seen.
        </h1>
      </div>

      {/* Quickstart card */}
      <div style={{
        background: 'white',
        border: '1px solid rgba(229,231,235,0.8)',
        borderRadius: 16, padding: '20px 24px',
        maxWidth: 480, margin: '0 auto 40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Quickstart</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{doneCount}/{steps.length}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(doneCount/steps.length)*100}%`, background: '#EA580C', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < steps.length-1 ? '1px solid rgba(229,231,235,0.5)' : 'none' }}>
            {step.done
              ? <CheckCircle2 size={18} color="#9CA3AF" />
              : <Circle size={18} color="#D1D5DB" />
            }
            <span style={{
              fontSize: 14, flex: 1,
              color: step.done ? '#9CA3AF' : '#111827',
              textDecoration: step.done ? 'line-through' : 'none'
            }}>{step.label}</span>
            {step.action && !step.done && <ArrowRight size={14} color="#9CA3AF" />}
          </div>
        ))}
        <Link to="/content" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 16, width: '100%',
          background: '#EA580C', color: 'white', textDecoration: 'none',
          textAlign: 'center', fontWeight: 700, fontSize: 14,
          padding: '12px', borderRadius: 10
        }}>
          Continue setup <ArrowRight size={16} />
        </Link>
      </div>

      {/* Trending Content */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>Trending Content</h2>
        </div>
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
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>🎨</span>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>What you can create</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {createCards.map((card) => (
            <Link key={card.tab} to={`/content?tab=${card.tab}`} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'white', border: '1px solid rgba(229,231,235,0.8)',
              borderRadius: 14, padding: '20px 12px',
              textDecoration: 'none', color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <span style={{ fontSize: 28 }}>{card.emoji}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{card.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111827', color: 'white',
              borderRadius: 10, padding: '12px 20px',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              transition: 'background 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#EA580C'}
              onMouseLeave={e => e.currentTarget.style.background = '#111827'}
            >
              <span>{action.emoji}</span>
              {action.label}
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>❓</span>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>Frequently Asked Questions</h2>
        </div>
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

      {/* Footer links */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
        <a href="https://discord.gg/aaAQ9VzQ6j" target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          background: 'white', border: '1px solid #E5E7EB',
          textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: 14,
          cursor: 'pointer'
        }}>
          💬 Join our Discord
        </a>
        <Link to="/guide" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          background: 'white', border: '1px solid #E5E7EB',
          textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: 14,
          cursor: 'pointer'
        }}>
          📖 View Guide
        </Link>
      </div>
    </div>
  )
}
