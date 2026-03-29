import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare, Loader2, Send, Sparkles, CheckCheck, Archive,
  Mail, MailOpen, ThumbsUp, Minus, ThumbsDown, Play, Image, Film,
  Filter, ChevronDown
} from 'lucide-react'
import api from '../lib/api'

/* ============================================================
   CONSTANTS
   ============================================================ */

const ACCENT = '#EA580C'
const ACCENT_LIGHT = '#FFF7ED'
const ACCENT_HOVER = '#DC5A0B'

const PLATFORM_STYLES = {
  tiktok:    { bg: '#000000', text: '#FFFFFF', label: 'TikTok' },
  instagram: { bg: '#E1306C', text: '#FFFFFF', label: 'Instagram' },
  youtube:   { bg: '#FF0000', text: '#FFFFFF', label: 'YouTube' },
}

const SENTIMENT_CONFIG = {
  positive: { color: '#16A34A', label: 'Positive', Icon: ThumbsUp },
  neutral:  { color: '#CA8A04', label: 'Neutral',  Icon: Minus },
  negative: { color: '#DC2626', label: 'Negative', Icon: ThumbsDown },
}

/* ============================================================
   MOCK DATA — 18 realistic comments
   ============================================================ */

const MOCK_COMMENTS = [
  { id: 1, platform: 'tiktok', username: '@jessica.creates', initials: 'JC', avatarColor: '#7C3AED', time: '2 min ago', text: 'This editing technique is INSANE! Can you do a tutorial on how you did the zoom transitions? 🔥', sentiment: 'positive', replied: false, read: true, postRef: { caption: 'POV: When the edit hits different...', type: 'video' } },
  { id: 2, platform: 'instagram', username: '@mark.visuals', initials: 'MV', avatarColor: '#2563EB', time: '5 min ago', text: 'The color grading on this reel is absolutely chef\'s kiss. What LUT pack are you using?', sentiment: 'positive', replied: false, read: false, postRef: { caption: 'Golden hour in Tokyo 🌅', type: 'image' } },
  { id: 3, platform: 'youtube', username: '@TechReviewDaily', initials: 'TR', avatarColor: '#DC2626', time: '12 min ago', text: 'I followed your tutorial but the export settings didn\'t work for me. Getting a black screen after rendering. Any fix?', sentiment: 'negative', replied: false, read: false, postRef: { caption: 'Export Settings That Actually Work (2026)', type: 'video' } },
  { id: 4, platform: 'tiktok', username: '@dancewithluna', initials: 'DL', avatarColor: '#EC4899', time: '18 min ago', text: 'ok but why is nobody talking about the outfit 😍', sentiment: 'positive', replied: true, read: true, postRef: { caption: 'New choreo drop 💃', type: 'video' } },
  { id: 5, platform: 'instagram', username: '@foodie.adventures', initials: 'FA', avatarColor: '#F59E0B', time: '24 min ago', text: 'Looks good but honestly the plating could be better. The sauce placement is off.', sentiment: 'negative', replied: false, read: true, postRef: { caption: 'Homemade truffle pasta 🍝', type: 'image' } },
  { id: 6, platform: 'youtube', username: '@SarahLearnsStuff', initials: 'SL', avatarColor: '#8B5CF6', time: '31 min ago', text: 'This is by far the best explanation of the algorithm I\'ve ever seen. Subscribed immediately!', sentiment: 'positive', replied: false, read: false, postRef: { caption: 'How the TikTok Algorithm ACTUALLY Works', type: 'video' } },
  { id: 7, platform: 'tiktok', username: '@gym.bro.mike', initials: 'GM', avatarColor: '#059669', time: '45 min ago', text: 'Form check: your back is slightly rounded on the deadlift. Be careful with heavier weights bro', sentiment: 'neutral', replied: false, read: true, postRef: { caption: 'PR Day! 405lb deadlift 💪', type: 'video' } },
  { id: 8, platform: 'instagram', username: '@wanderlust.nina', initials: 'WN', avatarColor: '#0891B2', time: '1 hr ago', text: 'Adding this to my bucket list immediately! How many days do you recommend for this itinerary?', sentiment: 'positive', replied: true, read: true, postRef: { caption: 'Bali in 7 days — complete guide', type: 'image' } },
  { id: 9, platform: 'youtube', username: '@CodeWithAlex', initials: 'CA', avatarColor: '#4F46E5', time: '1 hr ago', text: 'The React section was good but the Node.js part felt rushed. Would love a deeper dive on the backend.', sentiment: 'neutral', replied: false, read: false, postRef: { caption: 'Full Stack App in 60 Minutes', type: 'video' } },
  { id: 10, platform: 'tiktok', username: '@skincare.queen', initials: 'SQ', avatarColor: '#DB2777', time: '1.5 hr ago', text: 'I\'ve been using this routine for 2 weeks and my skin has literally never looked better!! 🙌', sentiment: 'positive', replied: false, read: true, postRef: { caption: 'My $20 skincare routine that actually works', type: 'video' } },
  { id: 11, platform: 'instagram', username: '@photo.phil', initials: 'PP', avatarColor: '#6D28D9', time: '2 hr ago', text: 'Composition is decent but the highlights are completely blown out. Try exposing for the sky next time.', sentiment: 'negative', replied: false, read: true, postRef: { caption: 'Sunset from the rooftop 📷', type: 'image' } },
  { id: 12, platform: 'youtube', username: '@MusicMakerMax', initials: 'MM', avatarColor: '#B45309', time: '2 hr ago', text: 'What DAW are you using? The mix sounds really clean especially the low end.', sentiment: 'positive', replied: true, read: true, postRef: { caption: 'Making a beat from scratch — lo-fi edition', type: 'video' } },
  { id: 13, platform: 'tiktok', username: '@plantmom.amy', initials: 'PA', avatarColor: '#15803D', time: '3 hr ago', text: 'Wait this actually works?? My monstera has been dying for months I\'m trying this tonight', sentiment: 'neutral', replied: false, read: false, postRef: { caption: 'Save your dying houseplants with THIS trick', type: 'video' } },
  { id: 14, platform: 'instagram', username: '@style.by.sam', initials: 'SS', avatarColor: '#BE185D', time: '3.5 hr ago', text: 'This outfit is everything! Where is the jacket from? Need it immediately 😭', sentiment: 'positive', replied: false, read: false, postRef: { caption: 'Fall transition fits 🍂', type: 'image' } },
  { id: 15, platform: 'youtube', username: '@DebateKing2026', initials: 'DK', avatarColor: '#991B1B', time: '4 hr ago', text: 'Completely disagree with your take at 4:32. You\'re ignoring half the data that contradicts your point.', sentiment: 'negative', replied: false, read: true, postRef: { caption: 'Why Everyone Is Wrong About AI in 2026', type: 'video' } },
  { id: 16, platform: 'tiktok', username: '@comedy.carlos', initials: 'CC', avatarColor: '#EA580C', time: '5 hr ago', text: 'LMAOOO the way you just stood there 💀💀 I watched this like 10 times', sentiment: 'positive', replied: true, read: true, postRef: { caption: 'When your uber driver misses the turn (part 3)', type: 'video' } },
  { id: 17, platform: 'instagram', username: '@minimalist.home', initials: 'MH', avatarColor: '#64748B', time: '6 hr ago', text: 'Love the aesthetic but where do you actually put all your stuff? This feels impractical.', sentiment: 'neutral', replied: false, read: true, postRef: { caption: 'Living room makeover — before & after', type: 'image' } },
  { id: 18, platform: 'youtube', username: '@FitnessWithFaye', initials: 'FF', avatarColor: '#0D9488', time: '8 hr ago', text: 'Did this workout 3x this week and I am SORE in the best way. More like this please!! 💪🔥', sentiment: 'positive', replied: false, read: false, postRef: { caption: '30 Min Full Body HIIT — No Equipment', type: 'video' } },
]

/* ============================================================
   AI REPLY TEMPLATES (used for mock generation)
   ============================================================ */

const AI_REPLIES = {
  positive: [
    'Thank you so much for the kind words! Really glad you enjoyed it — more content like this coming soon! 🙏',
    'Appreciate you! That means a lot. Stay tuned for the next one!',
    'So happy to hear that! Thanks for watching and commenting ❤️',
  ],
  neutral: [
    'Great question! I\'ll cover that in more detail in an upcoming post. Stay tuned!',
    'Thanks for the feedback — always looking to improve. Will keep that in mind!',
    'Appreciate you taking the time to comment! More info coming soon.',
  ],
  negative: [
    'Sorry to hear that! Can you DM me the details so I can help troubleshoot?',
    'Appreciate the honest feedback — I\'ll work on improving that. Thanks for letting me know!',
    'Thanks for pointing that out. I\'ll address this in a follow-up post with more detail.',
  ],
}

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

function getAIReply(sentiment) {
  const options = AI_REPLIES[sentiment] || AI_REPLIES.neutral
  return options[Math.floor(Math.random() * options.length)]
}

function getCounts(comments) {
  const counts = { all: comments.length, tiktok: 0, instagram: 0, youtube: 0 }
  comments.forEach(c => { if (counts[c.platform] !== undefined) counts[c.platform]++ })
  return counts
}

/* ============================================================
   STYLES (inline)
   ============================================================ */

const s = {
  page: { animation: 'fadeIn 0.3s ease', minHeight: '100vh' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 10, margin: 0 },
  subtitle: { color: '#6B7280', fontSize: 14, marginTop: 4, marginBottom: 0 },
  bulkRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  bulkBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' },
  bulkBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', background: ACCENT, color: '#FFF', cursor: 'pointer', transition: 'all 0.15s' },
  tabRow: { display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 },
  tab: (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600,
    borderRadius: 999, border: active ? 'none' : '1px solid #E5E7EB',
    background: active ? ACCENT : '#FFFFFF', color: active ? '#FFFFFF' : '#4B5563',
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  }),
  tabCount: (active) => ({
    fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
    background: active ? 'rgba(255,255,255,0.25)' : '#F3F4F6', color: active ? '#FFF' : '#6B7280',
  }),
  card: (read) => ({
    background: read ? '#FFFFFF' : ACCENT_LIGHT,
    borderRadius: 12, border: read ? '1px solid #E5E7EB' : `1px solid #FDBA74`,
    padding: 20, marginBottom: 12, transition: 'all 0.2s',
    borderLeft: read ? '1px solid #E5E7EB' : `3px solid ${ACCENT}`,
  }),
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  avatar: (color) => ({
    width: 42, height: 42, borderRadius: '50%', background: color || '#6B7280',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#FFF', fontWeight: 700, fontSize: 14, flexShrink: 0, letterSpacing: 0.5,
  }),
  cardBody: { flex: 1, minWidth: 0 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  username: { fontWeight: 600, fontSize: 14, color: '#111827' },
  platformBadge: (bg, text) => ({
    display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700,
    padding: '2px 8px', borderRadius: 999, background: bg, color: text, letterSpacing: 0.3,
  }),
  time: { fontSize: 12, color: '#9CA3AF' },
  sentimentDot: (color) => ({
    width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block',
  }),
  sentimentLabel: { fontSize: 11, color: '#6B7280', fontWeight: 500 },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 10px 0' },
  postRef: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6', marginBottom: 10,
  },
  postThumb: (type) => ({
    width: 40, height: 40, borderRadius: 6,
    background: type === 'video' ? '#1F2937' : '#DBEAFE',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }),
  postCaption: { fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  actionRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  aiBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${ACCENT}`, background: '#FFF', color: ACCENT, cursor: 'pointer', transition: 'all 0.15s' },
  aiBtnGenerating: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid #D1D5DB`, background: '#F9FAFB', color: '#9CA3AF', cursor: 'not-allowed' },
  toggleBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, fontWeight: 500, borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFF', color: '#6B7280', cursor: 'pointer', transition: 'all 0.15s' },
  repliedBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#166534' },
  replyArea: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  textarea: { width: '100%', minHeight: 70, padding: '10px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #D1D5DB', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' },
  sendBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', background: ACCENT, color: '#FFF', cursor: 'pointer', alignSelf: 'flex-end' },
  cancelBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFF', color: '#6B7280', cursor: 'pointer', alignSelf: 'flex-end' },
  replySendRow: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' },
  statBar: { display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' },
  statCard: { background: '#FFF', borderRadius: 10, border: '1px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#6B7280' },
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Engagement() {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [filter, setFilter] = useState('all')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [generating, setGenerating] = useState(null)
  const [bulkGenerating, setBulkGenerating] = useState(false)

  // Try to load from API; fall back to mock data
  useEffect(() => {
    const params = filter !== 'all' ? { platform: filter } : {}
    api.get('/engagement/comments', { params })
      .then(r => {
        if (r.data.comments && r.data.comments.length > 0) {
          setComments(r.data.comments)
        }
      })
      .catch(() => {})
  }, [filter])

  const filtered = filter === 'all' ? comments : comments.filter(c => c.platform === filter)
  const counts = getCounts(comments)
  const unreadCount = comments.filter(c => !c.read).length
  const unrepliedCount = comments.filter(c => !c.replied).length

  /* --- Actions --- */

  const generateReply = useCallback(async (comment) => {
    setGenerating(comment.id)
    try {
      const { data } = await api.post('/engagement/reply', { comment: comment.text })
      setReplyText(data.reply || getAIReply(comment.sentiment))
    } catch {
      setReplyText(getAIReply(comment.sentiment))
    } finally {
      setReplyingTo(comment.id)
      setGenerating(null)
    }
  }, [])

  const aiReplyAll = useCallback(async () => {
    setBulkGenerating(true)
    const unreplied = comments.filter(c => !c.replied)
    for (const c of unreplied) {
      await new Promise(r => setTimeout(r, 200))
      setComments(prev => prev.map(x => x.id === c.id ? { ...x, replied: true, read: true } : x))
    }
    setBulkGenerating(false)
  }, [comments])

  const markAllRead = useCallback(() => {
    setComments(prev => prev.map(c => ({ ...c, read: true })))
  }, [])

  const archiveReplied = useCallback(() => {
    setComments(prev => prev.filter(c => !c.replied))
  }, [])

  const toggleRead = useCallback((id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, read: !c.read } : c))
  }, [])

  const toggleReplied = useCallback((id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, replied: !c.replied } : c))
  }, [])

  const sendReply = useCallback((id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, replied: true, read: true } : c))
    setReplyingTo(null)
    setReplyText('')
  }, [])

  /* --- Render --- */

  const TABS = [
    { key: 'all', label: 'All Platforms' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
  ]

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>
            <MessageSquare size={22} style={{ color: ACCENT }} />
            Engagement
            <span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginLeft: 4 }}>
              {filtered.length} comment{filtered.length !== 1 ? 's' : ''}
            </span>
          </h1>
          <p style={s.subtitle}>
            Manage comments and replies across all platforms &middot; {unreadCount} unread &middot; {unrepliedCount} awaiting reply
          </p>
        </div>
        <div style={s.bulkRow}>
          <button style={s.bulkBtn} onClick={markAllRead}>
            <MailOpen size={14} /> Mark All Read
          </button>
          <button style={s.bulkBtn} onClick={archiveReplied}>
            <Archive size={14} /> Archive Replied
          </button>
          <button
            style={{ ...s.bulkBtnPrimary, opacity: bulkGenerating ? 0.7 : 1 }}
            onClick={aiReplyAll}
            disabled={bulkGenerating}
          >
            {bulkGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Reply All
          </button>
        </div>
      </div>

      {/* Stat summary cards */}
      <div style={s.statBar}>
        <div style={s.statCard}>
          <MessageSquare size={20} style={{ color: ACCENT }} />
          <div>
            <div style={s.statValue}>{comments.length}</div>
            <div style={s.statLabel}>Total Comments</div>
          </div>
        </div>
        <div style={s.statCard}>
          <Mail size={20} style={{ color: '#2563EB' }} />
          <div>
            <div style={s.statValue}>{unreadCount}</div>
            <div style={s.statLabel}>Unread</div>
          </div>
        </div>
        <div style={s.statCard}>
          <CheckCheck size={20} style={{ color: '#16A34A' }} />
          <div>
            <div style={s.statValue}>{comments.filter(c => c.replied).length}</div>
            <div style={s.statLabel}>Replied</div>
          </div>
        </div>
        <div style={s.statCard}>
          <ThumbsDown size={20} style={{ color: '#DC2626' }} />
          <div>
            <div style={s.statValue}>{comments.filter(c => c.sentiment === 'negative').length}</div>
            <div style={s.statLabel}>Negative</div>
          </div>
        </div>
      </div>

      {/* Platform filter tabs */}
      <div style={s.tabRow}>
        {TABS.map(t => (
          <button key={t.key} style={s.tab(filter === t.key)} onClick={() => setFilter(t.key)}>
            {t.label}
            <span style={s.tabCount(filter === t.key)}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div>
        {filtered.length === 0 && (
          <div style={s.emptyState}>
            <MessageSquare size={40} style={{ color: '#D1D5DB', marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>No comments to show</p>
            <p style={{ fontSize: 13 }}>Comments from your posts will appear here</p>
          </div>
        )}

        {filtered.map(c => {
          const ps = PLATFORM_STYLES[c.platform] || { bg: '#6B7280', text: '#FFF', label: c.platform }
          const sent = SENTIMENT_CONFIG[c.sentiment] || SENTIMENT_CONFIG.neutral

          return (
            <div key={c.id} style={s.card(c.read)}>
              <div style={s.cardTop}>
                {/* Avatar */}
                <div style={s.avatar(c.avatarColor)}>
                  {c.initials}
                </div>

                {/* Body */}
                <div style={s.cardBody}>
                  {/* Meta row */}
                  <div style={s.metaRow}>
                    <span style={s.username}>{c.username}</span>
                    <span style={s.platformBadge(ps.bg, ps.text)}>{ps.label}</span>
                    <span style={s.time}>{c.time}</span>
                    <span style={s.sentimentDot(sent.color)} title={sent.label} />
                    <span style={s.sentimentLabel}>{sent.label}</span>
                    {c.replied && (
                      <span style={s.repliedBadge}>
                        <CheckCheck size={11} /> Replied
                      </span>
                    )}
                  </div>

                  {/* Comment text */}
                  <p style={s.commentText}>{c.text}</p>

                  {/* Original post reference */}
                  {c.postRef && (
                    <div style={s.postRef}>
                      <div style={s.postThumb(c.postRef.type)}>
                        {c.postRef.type === 'video'
                          ? <Play size={16} style={{ color: '#9CA3AF' }} />
                          : <Image size={16} style={{ color: '#60A5FA' }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 1 }}>Original post</div>
                        <div style={s.postCaption}>{c.postRef.caption}</div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={s.actionRow}>
                    <button
                      style={generating === c.id ? s.aiBtnGenerating : s.aiBtn}
                      onClick={() => generateReply(c)}
                      disabled={generating === c.id}
                    >
                      {generating === c.id
                        ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
                        : <><Sparkles size={12} /> AI Reply</>
                      }
                    </button>
                    <button style={s.toggleBtn} onClick={() => toggleRead(c.id)}>
                      {c.read ? <MailOpen size={12} /> : <Mail size={12} />}
                      {c.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button style={s.toggleBtn} onClick={() => toggleReplied(c.id)}>
                      <CheckCheck size={12} />
                      {c.replied ? 'Unreply' : 'Mark Replied'}
                    </button>
                  </div>

                  {/* Reply textarea */}
                  {replyingTo === c.id && (
                    <div style={s.replyArea}>
                      <textarea
                        style={s.textarea}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Edit your AI-generated reply or write your own..."
                      />
                      <div style={s.replySendRow}>
                        <button style={s.cancelBtn} onClick={() => { setReplyingTo(null); setReplyText('') }}>
                          Cancel
                        </button>
                        <button style={s.sendBtn} onClick={() => sendReply(c.id)}>
                          <Send size={13} /> Send Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
