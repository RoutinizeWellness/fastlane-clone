import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Eye, Heart, MessageCircle, FileText, Globe, ExternalLink, Zap, Award, BarChart3 } from 'lucide-react'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'

const METRIC_TABS = ['Views', 'Likes', 'Comments', 'Posts', 'Website']

// --- Platform card configs ---
const PLATFORM_CARDS = [
  {
    name: 'TikTok',
    icon: '📱',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #111 0%, #333 100%)',
    stats: [
      { label: 'Views', value: '100.2k', change: '+24%' },
      { label: 'Comments', value: '+130', change: '+18%' },
      { label: 'Shares', value: '1.4k', change: '+31%' },
    ],
    insight: 'Slideshows are killing it',
    insightDetail: 'Your slideshow posts get 3.2x more engagement than other formats.',
    badge: 'Top Platform',
  },
  {
    name: 'Instagram Reels',
    icon: '📸',
    color: '#E1306C',
    bgGradient: 'linear-gradient(135deg, #E1306C 0%, #F77737 100%)',
    stats: [
      { label: 'Views', value: '48.7k', change: '+144%' },
      { label: 'Outliers', value: '3x', change: null },
      { label: 'Saves', value: '892', change: '+67%' },
    ],
    insight: 'Outperforming your previous reels',
    insightDetail: '144% spike in views this week. 3 posts detected as outliers.',
    badge: 'Trending Up',
  },
  {
    name: 'YouTube Shorts',
    icon: '▶️',
    color: '#FF0000',
    bgGradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    stats: [
      { label: 'Total Videos', value: '112', change: '+8' },
      { label: 'Views', value: '302.1k', change: '+12%' },
      { label: 'Watch Time', value: '1,240h', change: '+9%' },
    ],
    insight: 'Most Viewed: Green Screen Meme',
    insightDetail: 'Green screen memes drive 2.8x more views than your average short.',
    badge: 'Highest Reach',
  },
]

// --- Content type ranking ---
const CONTENT_RANKINGS = [
  { rank: 1, name: 'Slideshow', avgViews: '18.4k', avgLikes: '1.2k', avgComments: '89', growth: '+42%', color: '#EA580C', bar: 100 },
  { rank: 2, name: 'Green Screen Meme', avgViews: '14.1k', avgLikes: '980', avgComments: '67', growth: '+28%', color: '#10B981', bar: 77 },
  { rank: 3, name: 'Wall of Text', avgViews: '8.9k', avgLikes: '540', avgComments: '112', growth: '+15%', color: '#F59E0B', bar: 48 },
  { rank: 4, name: 'Video Hook', avgViews: '6.2k', avgLikes: '320', avgComments: '34', growth: '+5%', color: '#6366F1', bar: 34 },
]

// --- Growth KPI data ---
const KPI_DATA = [
  { key: 'Views', icon: Eye, value: 451200, change: 24.3, prev: 363100 },
  { key: 'Likes', icon: Heart, value: 12840, change: 18.7, prev: 10820 },
  { key: 'Comments', icon: MessageCircle, value: 3420, change: 31.2, prev: 2608 },
  { key: 'Posts', icon: FileText, value: 47, change: 14.6, prev: 41 },
  { key: 'Website', icon: Globe, value: 0, change: null, prev: 0 },
]

/* PLACEHOLDER: component body below */
export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState('Views')
  const [timeRange, setTimeRange] = useState('30 days')

  useEffect(() => {
    api.get('/analytics/overview').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #EA580C', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>
  )

  const { summary, chartData } = data || {}

  // Platform breakdown pie
  const platformData = [
    { name: 'TikTok', value: 62, color: '#000000' },
    { name: 'YouTube', value: 24, color: '#FF0000' },
    { name: 'Instagram', value: 14, color: '#E1306C' },
  ]

  // Content type pie
  const contentTypeData = [
    { name: 'Slideshow', value: 38, color: '#EA580C' },
    { name: 'Green Screen', value: 28, color: '#10B981' },
    { name: 'Wall of Text', value: 20, color: '#F59E0B' },
    { name: 'Video Hook', value: 14, color: '#6366F1' },
  ]

  const cardStyle = {
    background: 'white',
    border: '1px solid rgba(229,231,235,0.8)',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>Analytics</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Track your content performance across all platforms.</p>
      </div>

      {/* Time range */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['7 days', '30 days', 'Quarter'].map(r => (
          <button key={r} onClick={() => setTimeRange(r)} style={{
            padding: '6px 14px', border: '1px solid', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
            borderColor: timeRange === r ? '#111827' : '#E5E7EB',
            background: timeRange === r ? '#111827' : 'white',
            color: timeRange === r ? 'white' : '#374151',
          }}>{r}</button>
        ))}
      </div>

      {/* KPI Cards with growth */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {KPI_DATA.map(kpi => {
          const Icon = kpi.icon
          const isPositive = kpi.change !== null && kpi.change > 0
          const isNegative = kpi.change !== null && kpi.change < 0
          const isNeutral = kpi.change === null
          return (
            <div key={kpi.key} style={{
              ...cardStyle,
              padding: '14px 16px',
              transition: 'box-shadow 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: kpi.key === 'Website' ? '#F3F4F6' : 'rgba(234,88,12,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color={kpi.key === 'Website' ? '#9CA3AF' : '#EA580C'} />
                </div>
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{kpi.key}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {kpi.key === 'Website' ? '--' : formatNumber(kpi.value)}
              </div>
              {!isNeutral && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {isPositive ? <ArrowUpRight size={13} color="#10B981" /> : <ArrowDownRight size={13} color="#EF4444" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: isPositive ? '#10B981' : '#EF4444' }}>
                    {isPositive ? '+' : ''}{kpi.change}%
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 2 }}>vs prev</span>
                </div>
              )}
              {isNeutral && kpi.key === 'Website' && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Not connected</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Platform Performance Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>Platform Performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PLATFORM_CARDS.map(p => (
            <div key={p.name} style={{
              borderRadius: 14, overflow: 'hidden',
              border: '1px solid rgba(229,231,235,0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {/* Card header */}
              <div style={{
                background: p.bgGradient, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                }}>{p.badge}</span>
              </div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, background: 'white' }}>
                {p.stats.map((s, i) => (
                  <div key={s.label} style={{
                    padding: '12px 14px',
                    borderRight: i < 2 ? '1px solid #F3F4F6' : 'none',
                  }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>{s.value}</div>
                    {s.change && (
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 2 }}>{s.change}</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Insight */}
              <div style={{
                padding: '10px 14px', background: '#FAFAFA',
                borderTop: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={12} color="#EA580C" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.insight}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: '1.4' }}>{p.insightDetail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Cumulative Growth */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Cumulative Growth</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Total accumulated over the last {timeRange}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {METRIC_TABS.slice(0, 4).map(m => (
              <button key={m} onClick={() => setActiveMetric(m)} style={{
                padding: '3px 10px', border: '1px solid', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500,
                borderColor: activeMetric === m ? '#111827' : '#E5E7EB',
                background: activeMetric === m ? '#111827' : 'transparent',
                color: activeMetric === m ? 'white' : '#6B7280',
              }}>{m}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={d => d?.slice(5)} tick={{ fontSize: 10 }} interval={6} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={v => formatNumber(v)} />
              <Area type="monotone" dataKey="views" stroke="#EA580C" strokeWidth={2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Per Day */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Growth Per Day</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Daily performance over the last {timeRange}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {METRIC_TABS.slice(0, 4).map(m => (
              <button key={m} style={{
                padding: '3px 10px', border: '1px solid #E5E7EB', borderRadius: 6,
                fontSize: 11, cursor: 'pointer', fontWeight: 400, background: 'transparent', color: '#6B7280',
              }}>{m}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={(chartData || []).slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={d => d?.slice(5)} tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={v => formatNumber(v)} />
              <Bar dataKey="views" fill="#EA580C" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content Type Performance Ranking */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Content Type Performance</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Ranked by average views per post</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(234,88,12,0.08)', padding: '4px 10px', borderRadius: 20,
          }}>
            <Award size={12} color="#EA580C" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#EA580C' }}>Slideshow is your top format</span>
          </div>
        </div>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 120px 100px 100px 80px',
          gap: 8, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 8,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>#</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Type</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Avg Views</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Avg Likes</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Comments</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Growth</span>
        </div>
        {/* Table rows */}
        {CONTENT_RANKINGS.map(cr => (
          <div key={cr.name} style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 120px 100px 100px 80px',
            gap: 8, padding: '10px 12px', alignItems: 'center',
            borderBottom: '1px solid #F3F4F6',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: cr.rank === 1 ? '#EA580C' : '#F3F4F6',
              color: cr.rank === 1 ? 'white' : '#6B7280',
              fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cr.rank}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: cr.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{cr.name}</span>
              <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2, marginLeft: 8, maxWidth: 80 }}>
                <div style={{ width: `${cr.bar}%`, height: '100%', background: cr.color, borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{cr.avgViews}</span>
            <span style={{ fontSize: 13, color: '#374151' }}>{cr.avgLikes}</span>
            <span style={{ fontSize: 13, color: '#374151' }}>{cr.avgComments}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>{cr.growth}</span>
          </div>
        ))}
      </div>

      {/* Pie charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* By Platform */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>Views by Platform</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={platformData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
                {platformData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {platformData.map(p => (
                <div key={p.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{p.value}%</span>
                  </div>
                  <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, marginLeft: 18 }}>
                    <div style={{ width: `${p.value}%`, height: '100%', background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Content Type */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>Views by Content Type</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={contentTypeData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
                {contentTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {contentTypeData.map(p => (
                <div key={p.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{p.value}%</span>
                  </div>
                  <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, marginLeft: 18 }}>
                    <div style={{ width: `${(p.value / 38) * 100}%`, height: '100%', background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Website Traffic CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1px solid #FDBA74',
        borderRadius: 14, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(234,88,12,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={22} color="#EA580C" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 2 }}>Website Traffic</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: '1.4' }}>
              Connect your website to track visitors and content-driven growth.
            </div>
          </div>
        </div>
        <button style={{
          background: '#EA580C', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
        }}>
          <ExternalLink size={14} />
          Connect Website
        </button>
      </div>
    </div>
  )
}
