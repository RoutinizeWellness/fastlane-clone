import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import api from '../lib/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns'

const PLATFORM_COLORS = { tiktok: '#000', instagram: '#E1306C', youtube: '#FF0000', linkedin: '#0077B5', twitter: '#1DA1F2' }
const PLATFORM_ICONS = { tiktok: '🎵', instagram: '📸', youtube: '▶️', linkedin: '💼', twitter: '🐦' }

// Mock scheduled posts matching screenshot
const MOCK_POSTS = [
  { id: 1, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-24T03:32:00', status: 'scheduled' },
  { id: 2, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-24T03:35:00', status: 'scheduled' },
  { id: 3, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-25T20:03:00', status: 'scheduled' },
  { id: 4, platform: 'tiktok', type: 'Wall of Text', scheduled_at: '2026-03-26T20:04:00', status: 'scheduled' },
  { id: 5, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-27T20:05:00', status: 'scheduled' },
  { id: 6, platform: 'tiktok', type: 'Slideshow', scheduled_at: '2026-03-28T18:06:00', status: 'scheduled' },
  { id: 7, platform: 'tiktok', type: 'Slideshow', scheduled_at: '2026-03-29T19:07:00', status: 'scheduled' },
  { id: 8, platform: 'tiktok', type: 'Slideshow', scheduled_at: '2026-03-30T19:07:00', status: 'scheduled' },
  { id: 9, platform: 'tiktok', type: 'Wall of Text', scheduled_at: '2026-03-31T19:07:00', status: 'scheduled' },
]

export default function Calendar() {
  const [current, setCurrent] = useState(new Date('2026-03-01'))
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ platform: 'tiktok', type: 'Slideshow', scheduled_at: '' })

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startDay = getDay(startOfMonth(current))

  const postsForDay = (day) => posts.filter(p => isSameDay(new Date(p.scheduled_at), day))

  const schedule = () => {
    if (!form.scheduled_at) return
    setPosts(prev => [...prev, { id: Date.now(), ...form }])
    setShowModal(false)
  }

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          📅
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setCurrent(subMonths(current, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827', minWidth: 140, textAlign: 'center' }}>{format(current, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrent(addMonths(current, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><ChevronRight size={18} /></button>
        </div>
        <button onClick={() => setShowModal(true)} style={{ marginLeft: 'auto', background: '#EA580C', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Schedule Post
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, background: 'white', borderRadius: 16, border: '1px solid rgba(229,231,235,0.8)', overflow: 'hidden' }}>
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(229,231,235,0.8)' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', height: 'calc(100% - 40px)' }}>
          {Array(startDay).fill(null).map((_, i) => <div key={`e${i}`} style={{ borderRight: '1px solid rgba(229,231,235,0.5)', borderBottom: '1px solid rgba(229,231,235,0.5)', minHeight: 90 }} />)}
          {days.map((day, di) => {
            const dayPosts = postsForDay(day)
            const isToday = isSameDay(day, new Date())
            const dayNum = format(day, 'd')
            return (
              <div key={di} style={{ borderRight: '1px solid rgba(229,231,235,0.5)', borderBottom: '1px solid rgba(229,231,235,0.5)', minHeight: 90, padding: '6px 6px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 13, fontWeight: dayPosts.length > 0 ? 700 : 400,
                    color: isToday ? 'white' : '#374151',
                    background: isToday ? '#EA580C' : 'transparent',
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>{dayNum}</span>
                  {dayPosts.length > 0 && (
                    <span style={{ fontSize: 10, color: '#6B7280' }}>({dayPosts.length} post{dayPosts.length > 1 ? 's' : ''})</span>
                  )}
                </div>
                {dayPosts.slice(0, 3).map((p, pi) => (
                  <div key={pi} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#FFF7ED', border: '1px solid #FED7AA',
                    borderRadius: 4, padding: '2px 4px', marginBottom: 2, cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: 9 }}>{PLATFORM_ICONS[p.platform]}</span>
                    <span style={{ fontSize: 10, color: '#EA580C', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.platform?.charAt(0).toUpperCase()+p.platform?.slice(1)}: {p.type}
                    </span>
                    <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 'auto', flexShrink: 0 }}>{format(new Date(p.scheduled_at), 'h:mm a')}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && <div style={{ fontSize: 10, color: '#9CA3AF' }}>+{dayPosts.length - 3} more</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Schedule a Post</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Platform</label>
                <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                  {['tiktok','instagram','youtube','linkedin','twitter'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Content Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                  {['Slideshow','Wall of Text','Video Hook','Green Screen'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Date & Time</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={schedule} disabled={!form.scheduled_at} style={{ padding: '12px', background: '#EA580C', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
