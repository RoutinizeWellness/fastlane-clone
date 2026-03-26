import { useState, useEffect } from 'react'
import { MessageSquare, Loader2, Send } from 'lucide-react'
import api from '../lib/api'

const PLATFORM_COLORS = { tiktok: 'bg-gray-900 text-white', instagram: 'bg-pink-500 text-white', youtube: 'bg-red-500 text-white', linkedin: 'bg-blue-600 text-white', twitter: 'bg-sky-400 text-white' }

export default function Engagement() {
  const [comments, setComments] = useState([])
  const [filter, setFilter] = useState('all')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    const params = filter !== 'all' ? { platform: filter } : {}
    api.get('/engagement/comments', { params }).then(r => setComments(r.data.comments || []))
  }, [filter])

  const generateReply = async (comment) => {
    setGenerating(comment.id)
    try {
      const { data } = await api.post('/engagement/reply', { comment: comment.text })
      setReplyText(data.reply)
      setReplyingTo(comment.id)
    } finally { setGenerating(null) }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={22} />Engagement</h1>
        <p className="text-gray-500 mt-1">Manage comments and replies across all platforms</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'tiktok', 'instagram', 'youtube', 'linkedin'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition-all ${filter === p ? 'bg-brand-primary text-white border-brand-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start gap-4">
              <img src={c.avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{c.username}</span>
                  <span className={`badge text-xs px-2 py-0.5 ${PLATFORM_COLORS[c.platform] || 'bg-gray-100 text-gray-600'}`}>{c.platform}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                  {c.replied && <span className="badge bg-green-100 text-green-700 text-xs">Replied</span>}
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>

                {replyingTo === c.id && (
                  <div className="mt-3 flex gap-2">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)}
                      className="input flex-1 text-sm py-1.5" placeholder="Your reply..." />
                    <button onClick={() => { setReplyingTo(null); setReplyText('') }} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                    <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"><Send size={12} />Send</button>
                  </div>
                )}
              </div>
              <button onClick={() => generateReply(c)} disabled={generating === c.id}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0">
                {generating === c.id ? <Loader2 size={12} className="animate-spin" /> : '✨'}
                AI Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
