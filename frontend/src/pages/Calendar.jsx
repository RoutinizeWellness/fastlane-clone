import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Globe, Repeat, MessageCircle, Users, Scissors, Lock, Send, Zap } from 'lucide-react'
import api from '../lib/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns'

const PLATFORM_COLORS = {
  tiktok: '#000000',
  instagram: '#E1306C',
  youtube: '#FF0000',
}

const PLATFORM_BG = {
  tiktok: { bg: '#F0F0F0', border: '#D1D5DB', text: '#000' },
  instagram: { bg: '#FDF2F8', border: '#FBCFE8', text: '#BE185D' },
  youtube: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
}

const PLATFORM_LABELS = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube Shorts',
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const MOCK_POSTS = [
  { id: 1, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-24T03:32:00', status: 'scheduled', postingMethod: 'inbox', caption: 'Check this out!' },
  { id: 2, platform: 'instagram', type: 'Green Screen', scheduled_at: '2026-03-24T03:35:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 3, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-25T20:03:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 4, platform: 'youtube', type: 'Wall of Text', scheduled_at: '2026-03-26T20:04:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 5, platform: 'tiktok', type: 'Green Screen', scheduled_at: '2026-03-27T20:05:00', status: 'scheduled', postingMethod: 'inbox', caption: '' },
  { id: 6, platform: 'instagram', type: 'Slideshow', scheduled_at: '2026-03-28T18:06:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 7, platform: 'tiktok', type: 'Slideshow', scheduled_at: '2026-03-29T19:07:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 8, platform: 'youtube', type: 'Slideshow', scheduled_at: '2026-03-30T19:07:00', status: 'scheduled', postingMethod: 'direct', caption: '' },
  { id: 9, platform: 'tiktok', type: 'Wall of Text', scheduled_at: '2026-03-31T19:07:00', status: 'scheduled', postingMethod: 'inbox', caption: '' },
]

function getTimezoneLabel() {
  const offset = -(new Date().getTimezoneOffset())
  const sign = offset >= 0 ? '+' : '-'
  const hrs = Math.floor(Math.abs(offset) / 60)
  const mins = Math.abs(offset) % 60
  return `GMT ${sign}${hrs}${mins > 0 ? ':' + String(mins).padStart(2, '0') : ''}`
}

const DEFAULT_FORM = {
  platform: 'tiktok',
  type: 'Slideshow',
  scheduled_at: '',
  postingMethod: 'inbox',
  repeatWeekly: false,
  repeatDays: [false, false, false, false, false, false, false],
  privacy: 'public',
  allowComments: true,
  allowDuets: true,
  allowStitch: true,
  caption: '',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  background: '#FAFAFA',
  color: '#111827',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: 6,
}

function ScheduleModal({ form, setForm, onClose, onSave }) {
  const isTikTok = form.platform === 'tiktok'
  const showPrivacy = form.platform === 'tiktok'
  const showInteractions = form.platform === 'tiktok'

  const toggleRepeatDay = (idx) => {
    const next = [...form.repeatDays]
    next[idx] = !next[idx]
    setForm({ ...form, repeatDays: next })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, padding: 0, width: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Schedule a Post</span>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#6B7280', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Platform Selection */}
          <div>
            <label style={labelStyle}>Platform</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setForm({ ...form, platform: k, postingMethod: k === 'tiktok' ? 'inbox' : 'direct' })}
                  style={{
                    flex: 1, padding: '10px 8px', border: form.platform === k ? '2px solid #EA580C' : '1px solid #E5E7EB',
                    borderRadius: 10, background: form.platform === k ? '#FFF7ED' : '#FAFAFA',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                  }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: PLATFORM_COLORS[k] }} />
                  <span style={{ fontSize: 11, fontWeight: form.platform === k ? 700 : 500, color: form.platform === k ? '#EA580C' : '#6B7280' }}>{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TikTok Posting Method */}
          {isTikTok && (
            <div>
              <label style={labelStyle}>Posting Method</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setForm({ ...form, postingMethod: 'inbox' })}
                  style={{
                    flex: 1, padding: '10px 12px', border: form.postingMethod === 'inbox' ? '2px solid #EA580C' : '1px solid #E5E7EB',
                    borderRadius: 10, background: form.postingMethod === 'inbox' ? '#FFF7ED' : '#FAFAFA',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                  }}>
                  <Send size={14} color={form.postingMethod === 'inbox' ? '#EA580C' : '#9CA3AF'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: form.postingMethod === 'inbox' ? '#EA580C' : '#374151' }}>Send to Inbox</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>Queues to TikTok inbox</div>
                  </div>
                </button>
                <button onClick={() => setForm({ ...form, postingMethod: 'direct' })}
                  style={{
                    flex: 1, padding: '10px 12px', border: form.postingMethod === 'direct' ? '2px solid #EA580C' : '1px solid #E5E7EB',
                    borderRadius: 10, background: form.postingMethod === 'direct' ? '#FFF7ED' : '#FAFAFA',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                  }}>
                  <Zap size={14} color={form.postingMethod === 'direct' ? '#EA580C' : '#9CA3AF'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: form.postingMethod === 'direct' ? '#EA580C' : '#374151' }}>Direct Posting</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>Auto-publishes</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Content Type */}
          <div>
            <label style={labelStyle}>Content Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              {['Slideshow', 'Wall of Text', 'Video Hook', 'Green Screen'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Date/Time + Timezone */}
          <div>
            <label style={labelStyle}>
              Date & Time
              <span style={{ marginLeft: 8, fontWeight: 400, color: '#9CA3AF', fontSize: 11 }}>({getTimezoneLabel()})</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Repeat Weekly */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.repeatWeekly ? 10 : 0 }}>
              <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Repeat size={13} color="#6B7280" /> Repeat Weekly
              </label>
              <button onClick={() => setForm({ ...form, repeatWeekly: !form.repeatWeekly })}
                style={{
                  width: 38, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: form.repeatWeekly ? '#EA580C' : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
                }}>
                <span style={{
                  position: 'absolute', top: 2, left: form.repeatWeekly ? 20 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>
            {form.repeatWeekly && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {DAY_LABELS.map((label, idx) => (
                  <button key={idx} onClick={() => toggleRepeatDay(idx)}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: form.repeatDays[idx] ? '2px solid #EA580C' : '1px solid #E5E7EB',
                      background: form.repeatDays[idx] ? '#FFF7ED' : '#FAFAFA', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, color: form.repeatDays[idx] ? '#EA580C' : '#6B7280', transition: 'all 0.15s',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Privacy - TikTok only */}
          {showPrivacy && (
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="#6B7280" /> Privacy
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['public', 'friends', 'private'].map(opt => (
                  <button key={opt} onClick={() => setForm({ ...form, privacy: opt })}
                    style={{
                      flex: 1, padding: '8px 10px', border: form.privacy === opt ? '2px solid #EA580C' : '1px solid #E5E7EB',
                      borderRadius: 8, background: form.privacy === opt ? '#FFF7ED' : '#FAFAFA',
                      cursor: 'pointer', fontSize: 12, fontWeight: form.privacy === opt ? 700 : 500,
                      color: form.privacy === opt ? '#EA580C' : '#6B7280', textTransform: 'capitalize', transition: 'all 0.15s',
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interaction Settings - TikTok only */}
          {showInteractions && (
            <div>
              <label style={labelStyle}>Interaction Settings</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'allowComments', label: 'Allow Comments', icon: MessageCircle },
                  { key: 'allowDuets', label: 'Allow Duets', icon: Users },
                  { key: 'allowStitch', label: 'Allow Stitch', icon: Scissors },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} color="#6B7280" />
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
                    </div>
                    <button onClick={() => setForm({ ...form, [key]: !form[key] })}
                      style={{
                        width: 38, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: form[key] ? '#EA580C' : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
                      }}>
                      <span style={{
                        position: 'absolute', top: 2, left: form[key] ? 20 : 2,
                        width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label style={labelStyle}>Caption / Description</label>
            <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })}
              placeholder="Write your caption here..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'white', borderRadius: '0 0 16px 16px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={!form.scheduled_at}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: 10,
              background: form.scheduled_at ? '#EA580C' : '#F3B391', color: 'white',
              fontWeight: 700, fontSize: 13, cursor: form.scheduled_at ? 'pointer' : 'not-allowed',
              boxShadow: form.scheduled_at ? '0 2px 8px rgba(234,88,12,0.3)' : 'none',
            }}>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const [current, setCurrent] = useState(new Date('2026-03-01'))
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [form, setForm] = useState({ ...DEFAULT_FORM })

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startDay = getDay(startOfMonth(current))
  const postsForDay = (day) => posts.filter(p => isSameDay(new Date(p.scheduled_at), day))
  const totalRows = Math.ceil((startDay + days.length) / 7)

  const openModal = (day) => {
    const dateStr = day ? format(day, "yyyy-MM-dd'T'HH:mm") : ''
    setForm({ ...DEFAULT_FORM, scheduled_at: dateStr })
    setSelectedDay(day || null)
    setShowModal(true)
  }

  const schedule = () => {
    if (!form.scheduled_at) return
    const newPost = {
      id: Date.now(),
      platform: form.platform,
      type: form.type,
      scheduled_at: form.scheduled_at,
      status: 'scheduled',
      postingMethod: form.postingMethod,
      caption: form.caption,
      privacy: form.privacy,
      allowComments: form.allowComments,
      allowDuets: form.allowDuets,
      allowStitch: form.allowStitch,
      repeatWeekly: form.repeatWeekly,
      repeatDays: form.repeatDays,
    }
    setPosts(prev => [...prev, newPost])
    setShowModal(false)
    setForm({ ...DEFAULT_FORM })
  }

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>
          <Clock size={18} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setCurrent(subMonths(current, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827', minWidth: 160, textAlign: 'center' }}>{format(current, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrent(addMonths(current, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><ChevronRight size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, padding: '4px 10px', background: '#F3F4F6', borderRadius: 6 }}>
          <Globe size={13} color="#6B7280" />
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{getTimezoneLabel()}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[k], display: 'inline-block' }} />
              {v}
            </span>
          ))}
        </div>
        <button onClick={() => openModal(null)} style={{ background: '#EA580C', border: 'none', borderRadius: 8, padding: '8px 18px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(234,88,12,0.3)' }}>
          <Plus size={15} /> Schedule Post
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, background: 'white', borderRadius: 16, border: '1px solid rgba(229,231,235,0.8)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(229,231,235,0.8)', background: '#FAFAFA' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${totalRows}, 1fr)`, height: 'calc(100% - 38px)' }}>
          {Array(startDay).fill(null).map((_, i) => (
            <div key={`e${i}`} style={{ borderRight: '1px solid rgba(229,231,235,0.5)', borderBottom: '1px solid rgba(229,231,235,0.5)', background: '#FAFAFA', minHeight: 85 }} />
          ))}
          {days.map((day, di) => {
            const dayPosts = postsForDay(day)
            const isToday = isSameDay(day, new Date())
            const dayNum = format(day, 'd')
            return (
              <div key={di}
                onClick={() => openModal(day)}
                style={{ borderRight: '1px solid rgba(229,231,235,0.5)', borderBottom: '1px solid rgba(229,231,235,0.5)', minHeight: 85, padding: '5px 5px', cursor: 'pointer', position: 'relative', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFFBF7' }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? '#FFFAF5' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'white' : '#374151',
                    background: isToday ? '#EA580C' : 'transparent',
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>{dayNum}</span>
                  {dayPosts.length > 0 && (
                    <span style={{ fontSize: 9, color: '#EA580C', fontWeight: 700, background: '#FFF7ED', borderRadius: 4, padding: '1px 5px' }}>{dayPosts.length}</span>
                  )}
                </div>
                {dayPosts.slice(0, 3).map((p, pi) => {
                  const colors = PLATFORM_BG[p.platform] || PLATFORM_BG.tiktok
                  return (
                    <div key={pi} style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      background: colors.bg, borderLeft: `3px solid ${PLATFORM_COLORS[p.platform]}`,
                      borderRadius: 4, padding: '2px 5px', marginBottom: 2, fontSize: 10,
                    }}>
                      <span style={{ color: colors.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {p.type}
                      </span>
                      <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>{format(new Date(p.scheduled_at), 'h:mma')}</span>
                    </div>
                  )
                })}
                {dayPosts.length > 3 && <div style={{ fontSize: 9, color: '#EA580C', fontWeight: 600, paddingLeft: 4 }}>+{dayPosts.length - 3} more</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && <ScheduleModal form={form} setForm={setForm} onClose={() => setShowModal(false)} onSave={schedule} />}
    </div>
  )
}
