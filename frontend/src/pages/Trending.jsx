import { useState, useRef } from 'react'
import { VIRAL_CONTENT, fmtNum } from '../lib/viralContent'

// --- MOCK DATA ---
const HASHTAGS = [
  { tag: '#fyp', views: 45200000000 },
  { tag: '#smallbusiness', views: 12800000000 },
  { tag: '#grwm', views: 8900000000 },
  { tag: '#trending', views: 7600000000 },
  { tag: '#viral', views: 6300000000 },
  { tag: '#motivation', views: 5100000000 },
  { tag: '#skincare', views: 4200000000 },
  { tag: '#fitness', views: 3800000000 },
  { tag: '#recipe', views: 2900000000 },
  { tag: '#booktok', views: 2400000000 },
  { tag: '#ootd', views: 1800000000 },
  { tag: '#storytime', views: 1500000000 },
]

const SOUNDS = [
  { name: 'original sound - Sofia', artist: 'Sofia Martinez', uses: 1420000 },
  { name: 'Espresso - Sabrina Carpenter', artist: 'Sabrina Carpenter', uses: 980000 },
  { name: 'APT. - ROSE & Bruno Mars', artist: 'ROSE', uses: 870000 },
  { name: 'Birds of a Feather - Billie Eilish', artist: 'Billie Eilish', uses: 760000 },
  { name: 'original sound - DJ Vibes', artist: 'DJ Vibes', uses: 650000 },
  { name: 'A Bar Song (Tipsy) - Shaboozey', artist: 'Shaboozey', uses: 540000 },
  { name: 'MILLION DOLLAR BABY - Tommy Richman', artist: 'Tommy Richman', uses: 430000 },
  { name: 'Not Like Us - Kendrick Lamar', artist: 'Kendrick Lamar', uses: 320000 },
]

const CREATORS = [
  { username: '@charlidamelio', name: 'Charli D\'Amelio', followers: 155000000, avatar: 'CD' },
  { username: '@khaby.lame', name: 'Khabane Lame', followers: 162000000, avatar: 'KL' },
  { username: '@bellapoarch', name: 'Bella Poarch', followers: 94000000, avatar: 'BP' },
  { username: '@addisonre', name: 'Addison Rae', followers: 89000000, avatar: 'AR' },
  { username: '@zachking', name: 'Zach King', followers: 82000000, avatar: 'ZK' },
  { username: '@willsmith', name: 'Will Smith', followers: 76000000, avatar: 'WS' },
  { username: '@jasonderulo', name: 'Jason Derulo', followers: 63000000, avatar: 'JD' },
  { username: '@mrbeast', name: 'MrBeast', followers: 45000000, avatar: 'MB' },
]

const TABS = ['Hashtags', 'Videos', 'Sounds', 'Creators']
const COUNTRIES = ['Global', 'US', 'UK', 'Brazil', 'India']
const TIME_RANGES = ['24h', '7 days', '30 days']

// Placeholder — will be filled in sections below
export default function Trending() {
  const [activeTab, setActiveTab] = useState('Hashtags')
  const [country, setCountry] = useState('Global')
  const [timeRange, setTimeRange] = useState('24h')

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1000 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
          Trending Now {'\uD83D\uDD25'}
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
          Discover what's trending across social platforms right now.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          style={{
            padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#374151', background: 'white', cursor: 'pointer', outline: 'none'
          }}
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {TIME_RANGES.map(r => (
            <button key={r} onClick={() => setTimeRange(r)} style={{
              padding: '6px 14px', border: '1px solid',
              borderColor: timeRange === r ? '#111827' : '#E5E7EB',
              background: timeRange === r ? '#111827' : 'white',
              color: timeRange === r ? 'white' : '#374151',
              borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? '#EA580C' : '#6B7280',
            background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #EA580C' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s'
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Hashtags' && <HashtagsTab />}
      {activeTab === 'Videos' && <VideosTab />}
      {activeTab === 'Sounds' && <SoundsTab />}
      {activeTab === 'Creators' && <CreatorsTab />}
    </div>
  )
}

function HashtagsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {HASHTAGS.map((h, i) => (
        <div key={h.tag} style={{
          background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12,
          padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#EA580C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,231,235,0.8)'}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#EA580C', fontWeight: 800, fontSize: 14, flexShrink: 0
          }}>#{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{h.tag}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtNum(h.views)} views</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function VideosTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {VIRAL_CONTENT.slice(0, 12).map(v => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  )
}

function VideoCard({ video }) {
  const videoRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  return (
    <div
      style={{
        borderRadius: 12, overflow: 'hidden', background: '#000',
        aspectRatio: '9/16', position: 'relative', cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={() => { setHovering(true); videoRef.current?.play().catch(() => {}) }}
      onMouseLeave={() => { setHovering(false); videoRef.current?.pause() }}
    >
      <img
        src={video.thumbnail}
        alt=""
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          position: 'absolute', top: 0, left: 0,
          opacity: hovering ? 0 : 1, transition: 'opacity 0.3s'
        }}
      />
      <video
        ref={videoRef}
        src={video.videoUrl}
        muted
        loop
        playsInline
        preload="none"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '32px 10px 10px'
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'white', lineHeight: 1.3, marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{video.caption}</div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
          <span>{'\u2764'} {fmtNum(video.num_likes)}</span>
          <span>{'\u25B6'} {fmtNum(video.num_views)}</span>
        </div>
      </div>
    </div>
  )
}

function SoundsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {SOUNDS.map((s, i) => (
        <div key={i} style={{
          background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12,
          padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#EA580C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,231,235,0.8)'}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: 18 }}>{'\uD83C\uDFB5'}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{s.artist}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#EA580C' }}>{fmtNum(s.uses)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>videos</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CreatorsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {CREATORS.map((c, i) => (
        <div key={i} style={{
          background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12,
          padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#EA580C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,231,235,0.8)'}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#EA580C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
          }}>{c.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.username}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fmtNum(c.followers)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>followers</div>
          </div>
        </div>
      ))}
    </div>
  )
}
