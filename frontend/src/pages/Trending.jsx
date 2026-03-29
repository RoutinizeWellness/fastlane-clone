import { useState, useRef } from 'react'
import { Globe, Search, TrendingUp, ArrowUpRight, Play, Pause, Hash, Video, Music, Users } from 'lucide-react'
import { VIRAL_CONTENT, fmtNum } from '../lib/viralContent'

// --- MOCK DATA: HASHTAGS (20+) ---
const HASHTAGS = [
  { tag: '#fyp', views: 45200000, category: 'General' },
  { tag: '#smallbusiness', views: 32800000, category: 'Business' },
  { tag: '#grwm', views: 28900000, category: 'Lifestyle' },
  { tag: '#trending', views: 21600000, category: 'General' },
  { tag: '#viral', views: 18300000, category: 'General' },
  { tag: '#motivation', views: 15100000, category: 'Self Improvement' },
  { tag: '#skincare', views: 12200000, category: 'Beauty' },
  { tag: '#fitness', views: 9800000, category: 'Fitness' },
  { tag: '#recipe', views: 8900000, category: 'Food' },
  { tag: '#booktok', views: 7400000, category: 'Education' },
  { tag: '#ootd', views: 6800000, category: 'Fashion' },
  { tag: '#storytime', views: 5500000, category: 'Entertainment' },
  { tag: '#techtok', views: 4200000, category: 'Tech' },
  { tag: '#budgeting', views: 3100000, category: 'Finance' },
  { tag: '#mealprep', views: 2800000, category: 'Food' },
  { tag: '#sidehustle', views: 2400000, category: 'Business' },
  { tag: '#greenscreen', views: 1900000, category: 'Creative' },
  { tag: '#morningroutine', views: 1500000, category: 'Lifestyle' },
  { tag: '#saas', views: 980000, category: 'Tech' },
  { tag: '#contentcreator', views: 720000, category: 'Creative' },
  { tag: '#parentinghacks', views: 540000, category: 'Family' },
  { tag: '#diy', views: 380000, category: 'Creative' },
  { tag: '#traveltok', views: 290000, category: 'Travel' },
  { tag: '#aitools', views: 185000, category: 'Tech' },
]

// --- MOCK DATA: SOUNDS (12+) ---
const SOUNDS = [
  { name: 'original sound - Sofia', artist: 'Sofia Martinez', uses: 1420000, duration: '0:15' },
  { name: 'Espresso - Sabrina Carpenter', artist: 'Sabrina Carpenter', uses: 980000, duration: '0:30' },
  { name: 'APT. - ROSE & Bruno Mars', artist: 'ROSE', uses: 870000, duration: '0:22' },
  { name: 'Birds of a Feather - Billie Eilish', artist: 'Billie Eilish', uses: 760000, duration: '0:18' },
  { name: 'original sound - DJ Vibes', artist: 'DJ Vibes', uses: 650000, duration: '0:20' },
  { name: 'A Bar Song (Tipsy) - Shaboozey', artist: 'Shaboozey', uses: 540000, duration: '0:25' },
  { name: 'MILLION DOLLAR BABY - Tommy Richman', artist: 'Tommy Richman', uses: 430000, duration: '0:17' },
  { name: 'Not Like Us - Kendrick Lamar', artist: 'Kendrick Lamar', uses: 320000, duration: '0:28' },
  { name: 'Beautiful Things - Benson Boone', artist: 'Benson Boone', uses: 284000, duration: '0:21' },
  { name: 'Nasty - Tinashe', artist: 'Tinashe', uses: 219000, duration: '0:16' },
  { name: 'Too Sweet - Hozier', artist: 'Hozier', uses: 178000, duration: '0:24' },
  { name: 'original sound - marketing guru', artist: 'Marketing Guru', uses: 142000, duration: '0:12' },
  { name: 'Lunch - Billie Eilish', artist: 'Billie Eilish', uses: 118000, duration: '0:19' },
  { name: 'I Had Some Help - Post Malone', artist: 'Post Malone', uses: 95000, duration: '0:27' },
]

// --- MOCK DATA: CREATORS (12+) ---
const AVATAR_COLORS = ['#EA580C', '#7C3AED', '#0891B2', '#059669', '#DC2626', '#D97706', '#4F46E5', '#BE185D', '#0D9488', '#6D28D9', '#B91C1C', '#2563EB', '#CA8A04', '#9333EA']
const CREATORS = [
  { username: '@alexstartups', name: 'Alex Chen', followers: 2400000, initials: 'AC', niche: 'Tech', color: 0 },
  { username: '@fitwithjess', name: 'Jessica Rivera', followers: 1870000, initials: 'JR', niche: 'Fitness', color: 1 },
  { username: '@chloecooks', name: 'Chloe Nguyen', followers: 1540000, initials: 'CN', niche: 'Food', color: 2 },
  { username: '@stylishmark', name: 'Marcus Williams', followers: 1290000, initials: 'MW', niche: 'Fashion', color: 3 },
  { username: '@bizhacks', name: 'Sarah Johnson', followers: 980000, initials: 'SJ', niche: 'Business', color: 4 },
  { username: '@devdaily', name: 'Raj Patel', followers: 860000, initials: 'RP', niche: 'Tech', color: 5 },
  { username: '@wellnesswithamy', name: 'Amy Foster', followers: 740000, initials: 'AF', niche: 'Health', color: 6 },
  { username: '@travelwithtom', name: 'Tom Baker', followers: 620000, initials: 'TB', niche: 'Travel', color: 7 },
  { username: '@moneymatters', name: 'Diana Ross', followers: 510000, initials: 'DR', niche: 'Finance', color: 8 },
  { username: '@craftqueen', name: 'Lily Park', followers: 430000, initials: 'LP', niche: 'Creative', color: 9 },
  { username: '@ceolife', name: 'James Wright', followers: 340000, initials: 'JW', niche: 'Business', color: 10 },
  { username: '@beautybynina', name: 'Nina Kowalski', followers: 280000, initials: 'NK', niche: 'Beauty', color: 11 },
  { username: '@parentwin', name: 'Dave Thompson', followers: 195000, initials: 'DT', niche: 'Family', color: 12 },
  { username: '@aikidd', name: 'Zoe Mitchell', followers: 164000, initials: 'ZM', niche: 'Tech', color: 13 },
]

const TABS = [
  { key: 'Hashtags', icon: Hash, count: 24 },
  { key: 'Videos', icon: Video, count: 16 },
  { key: 'Sounds', icon: Music, count: 14 },
  { key: 'Creators', icon: Users, count: 14 },
]
const COUNTRIES = ['Global', 'US', 'UK', 'Brazil', 'India', 'Germany', 'France', 'Japan', 'Australia']
const TIME_RANGES = ['24h', '7d', '30d']

// placeholder - main component and tabs below
export default function Trending() {
  const [activeTab, setActiveTab] = useState('Hashtags')
  const [country, setCountry] = useState('Global')
  const [timeRange, setTimeRange] = useState('24h')
  const [countryOpen, setCountryOpen] = useState(false)

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1060 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <TrendingUp size={22} color="#EA580C" strokeWidth={2.5} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>
            Trending
          </h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
          500+ viral videos updated daily — discover what's blowing up right now
        </p>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        {/* Country dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCountryOpen(!countryOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 10,
              fontSize: 13, color: '#374151', background: 'white', cursor: 'pointer',
              fontWeight: 500, outline: 'none'
            }}
          >
            <Globe size={14} color="#6B7280" />
            {country}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2 }}>
              <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {countryOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
              background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 140, padding: '4px 0'
            }}>
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => { setCountry(c); setCountryOpen(false) }} style={{
                  display: 'block', width: '100%', padding: '8px 14px', border: 'none',
                  background: country === c ? '#FFF7ED' : 'transparent', fontSize: 13,
                  color: country === c ? '#EA580C' : '#374151', cursor: 'pointer',
                  textAlign: 'left', fontWeight: country === c ? 600 : 400
                }}>{c}</button>
              ))}
            </div>
          )}
        </div>

        {/* Time range pills */}
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
          {TIME_RANGES.map(r => (
            <button key={r} onClick={() => setTimeRange(r)} style={{
              padding: '6px 16px', border: 'none',
              background: timeRange === r ? 'white' : 'transparent',
              color: timeRange === r ? '#111827' : '#6B7280',
              borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
              boxShadow: timeRange === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Tabs with count badges */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '2px solid #F3F4F6', paddingBottom: 0 }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? '#EA580C' : '#6B7280',
              background: 'none', border: 'none',
              borderBottom: active ? '2px solid #EA580C' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -2, transition: 'all 0.15s'
            }}>
              <Icon size={15} />
              {tab.key}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                background: active ? '#FFF7ED' : '#F3F4F6',
                color: active ? '#EA580C' : '#9CA3AF'
              }}>{tab.count}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'Hashtags' && <HashtagsTab />}
      {activeTab === 'Videos' && <VideosTab />}
      {activeTab === 'Sounds' && <SoundsTab />}
      {activeTab === 'Creators' && <CreatorsTab />}
    </div>
  )
}

/* ==================== HASHTAGS TAB ==================== */
function HashtagsTab() {
  const [search, setSearch] = useState('')
  const filtered = HASHTAGS.filter(h =>
    h.tag.toLowerCase().includes(search.toLowerCase()) ||
    h.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
        <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search hashtags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #E5E7EB',
            borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none',
            background: 'white', boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#EA580C'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Hashtag rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((h, i) => (
          <HashtagRow key={h.tag} hashtag={h} rank={i + 1} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No hashtags match your search.
          </div>
        )}
      </div>
    </div>
  )
}

function HashtagRow({ hashtag, rank }) {
  const [hovered, setHovered] = useState(false)
  const trendUp = Math.random() > 0.15 // most trending up
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
        background: hovered ? '#FFFBF7' : 'white',
        border: '1px solid', borderColor: hovered ? '#FDBA74' : 'rgba(229,231,235,0.8)',
        borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rank */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: rank <= 3 ? '#EA580C' : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: rank <= 3 ? 'white' : '#6B7280', fontWeight: 800, fontSize: 13, flexShrink: 0
      }}>{rank}</div>

      {/* Hashtag name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{hashtag.tag}</div>
      </div>

      {/* Category tag */}
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
        background: '#F3F4F6', color: '#6B7280', flexShrink: 0, whiteSpace: 'nowrap'
      }}>{hashtag.category}</span>

      {/* View count */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', minWidth: 60, textAlign: 'right', flexShrink: 0 }}>
        {fmtNum(hashtag.views)}
      </div>

      {/* Trend arrow */}
      <div style={{ flexShrink: 0 }}>
        {trendUp ? (
          <ArrowUpRight size={16} color="#16A34A" strokeWidth={2.5} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 7l10 10M17 7v10H7" />
          </svg>
        )}
      </div>

      {/* Use button */}
      <button
        style={{
          padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
          background: hovered ? '#EA580C' : '#FFF7ED', color: hovered ? 'white' : '#EA580C',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
        }}
      >Use</button>
    </div>
  )
}

/* ==================== VIDEOS TAB ==================== */
function VideosTab() {
  const videos = VIRAL_CONTENT.filter(v => v.thumbnail).slice(0, 16)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {videos.map(v => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  )
}

function VideoCard({ video }) {
  const videoRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  const creatorNames = ['Alex C.', 'Jess R.', 'Chloe N.', 'Marcus W.', 'Sarah J.', 'Raj P.', 'Amy F.', 'Tom B.']
  const creator = creatorNames[Math.abs(video.id?.charCodeAt?.(video.id.length - 1) || 0) % creatorNames.length]

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
          opacity: hovering && video.videoUrl ? 0 : 1, transition: 'opacity 0.3s'
        }}
      />
      {video.videoUrl && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          loop
          playsInline
          preload="none"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* View count overlay top-left */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 8px',
        display: 'flex', alignItems: 'center', gap: 4
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M3 18L9 12l4 4 8-10" stroke="white" strokeWidth="3" fill="none" /></svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{fmtNum(video.num_views || video.views)}</span>
      </div>

      {/* Remix button on hover */}
      {hovering && (
        <button style={{
          position: 'absolute', top: 8, right: 8,
          background: '#EA580C', border: 'none', borderRadius: 8,
          padding: '5px 12px', fontSize: 11, fontWeight: 700, color: 'white',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>Remix</button>
      )}

      {/* Bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        padding: '32px 10px 10px'
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'white', lineHeight: 1.3, marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{video.caption}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{creator}</span>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            <span>{'\u2764'} {fmtNum(video.num_likes || video.likes)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==================== SOUNDS TAB ==================== */
function SoundsTab() {
  const [playingIdx, setPlayingIdx] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOUNDS.map((s, i) => {
        const isPlaying = playingIdx === i
        return (
          <div key={i} style={{
            background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12,
            padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#FDBA74'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,231,235,0.8)'}
          >
            {/* Play button */}
            <button
              onClick={() => setPlayingIdx(isPlaying ? null : i)}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none',
                background: isPlaying ? '#EA580C' : '#FFF7ED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
              }}
            >
              {isPlaying
                ? <Pause size={16} color="white" fill="white" />
                : <Play size={16} color="#EA580C" fill="#EA580C" style={{ marginLeft: 2 }} />
              }
            </button>

            {/* Sound info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{s.artist}</span>
                <span style={{ fontSize: 11, color: '#D1D5DB' }}>|</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{s.duration}</span>
              </div>
            </div>

            {/* Usage count */}
            <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fmtNum(s.uses)}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>videos</div>
            </div>

            {/* Use Sound button */}
            <button style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
              background: '#EA580C', color: 'white', cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}>Use Sound</button>
          </div>
        )
      })}
    </div>
  )
}

/* ==================== CREATORS TAB ==================== */
function CreatorsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {CREATORS.map((c, i) => (
        <CreatorCard key={i} creator={c} rank={i + 1} />
      ))}
    </div>
  )
}

function CreatorCard({ creator, rank }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        background: 'white', border: '1px solid', borderColor: hovered ? '#FDBA74' : 'rgba(229,231,235,0.8)',
        borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        transition: 'all 0.15s'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar colored circle */}
      <div style={{
        width: 46, height: 46, borderRadius: '50%', background: AVATAR_COLORS[creator.color],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
        boxShadow: `0 2px 8px ${AVATAR_COLORS[creator.color]}40`
      }}>{creator.initials}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{creator.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{creator.username}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
            background: '#F3F4F6', color: '#6B7280'
          }}>{creator.niche}</span>
        </div>
      </div>

      {/* Follower count */}
      <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fmtNum(creator.followers)}</div>
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>followers</div>
      </div>

      {/* Follow button */}
      <button style={{
        padding: '7px 18px', borderRadius: 8, border: hovered ? 'none' : '1.5px solid #EA580C',
        fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: 'pointer',
        background: hovered ? '#EA580C' : 'white',
        color: hovered ? 'white' : '#EA580C',
        transition: 'all 0.15s'
      }}>Follow</button>
    </div>
  )
}
