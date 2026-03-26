import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'

const METRIC_TABS = ['Views', 'Likes', 'Comments', 'Posts', 'Website']

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState('Views')
  const [timeRange, setTimeRange] = useState('30 days')

  useEffect(() => {
    api.get('/analytics/overview').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div style={{ width: 32, height: 32, border: '3px solid #EA580C', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" /></div>

  const { summary, chartData } = data || {}

  const metricValues = {
    Views: summary?.totalViews || 251,
    Likes: 2, Comments: 0, Posts: 2, Website: 0
  }

  const metricChanges = {
    Views: null, Likes: null, Comments: null, Posts: null, Website: '0%'
  }

  // Platform breakdown pie
  const platformData = [
    { name: 'TikTok', value: 95, color: '#000000' },
    { name: 'YouTube', value: 3, color: '#FF0000' },
    { name: 'Instagram', value: 2, color: '#E1306C' },
  ]

  // Content type pie
  const contentTypeData = [
    { name: 'Slideshow', value: 45, color: '#EA580C' },
    { name: 'Green Screen', value: 30, color: '#10B981' },
    { name: 'Wall of Text', value: 15, color: '#F59E0B' },
    { name: 'Video Hook', value: 10, color: '#6366F1' },
  ]

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1000 }} className="animate-fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>Analytics</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Track your content performance across all platforms.</p>
      </div>

      {/* Time range + filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['7 days','30 days','Quarter'].map(r => (
          <button key={r} onClick={() => setTimeRange(r)} style={{
            padding: '6px 14px', border: '1px solid', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
            borderColor: timeRange === r ? '#111827' : '#E5E7EB',
            background: timeRange === r ? '#111827' : 'white',
            color: timeRange === r ? 'white' : '#374151'
          }}>{r}</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {METRIC_TABS.map(m => (
          <div key={m} style={{
            background: 'white', border: '1px solid rgba(229,231,235,0.8)',
            borderRadius: 12, padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>
                {m === 'Views' ? '👁' : m === 'Likes' ? '🤍' : m === 'Comments' ? '💬' : m === 'Posts' ? '📋' : '🌐'}
              </span>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{m}</span>
              {metricChanges[m] && <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 'auto' }}>{metricChanges[m]}</span>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
              {formatNumber(metricValues[m])}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Cumulative Growth */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Cumulative Growth</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Total accumulated over the last 30 days</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {METRIC_TABS.map(m => (
              <button key={m} onClick={() => setActiveMetric(m)} style={{
                padding: '3px 10px', border: '1px solid', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500,
                borderColor: activeMetric === m ? '#111827' : '#E5E7EB',
                background: activeMetric === m ? '#111827' : 'transparent',
                color: activeMetric === m ? 'white' : '#6B7280'
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
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Growth Per Day</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Daily performance over the last 30 days</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {METRIC_TABS.map(m => (
              <button key={m} style={{ padding: '3px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 400, background: 'transparent', color: '#6B7280' }}>{m}</button>
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

      {/* Pie charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* By Platform */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>By Platform</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={platformData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
                {platformData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {platformData.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Content Type */}
        <div style={{ background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>By Content Type</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={contentTypeData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
                {contentTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contentTypeData.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
