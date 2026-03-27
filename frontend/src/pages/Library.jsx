import { useState, useEffect } from 'react'
import { Trash2, Download } from 'lucide-react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import { VIRAL_CONTENT } from '../lib/viralContent'
import { getBookmarks, removeBookmark, exportContent, exportAllContent } from '../lib/contentActions'

const TYPE_LABEL = { slideshow: 'Slideshow', 'wall-of-text': 'Wall of Text', 'video-hook-and-demo': 'Video Hook', 'green-screen-meme': 'Green Screen' }

// Mock content using REAL viral content from Fastlane
const MOCK_LIBRARY = VIRAL_CONTENT.map(v => ({
  id: v.id,
  type: v.contentType || 'wall-of-text',
  platform: 'tiktok',
  title: v.caption,
  thumbnail: v.thumbnail,
  videoUrl: v.videoUrl,
  created_at: '2026-03-23'
}))

export default function Library() {
  const [items, setItems] = useState([])
  const [dbItems, setDbItems] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [view, setView] = useState('my-content') // my-posts | my-content | bookmarks
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/library').then(r => setDbItems(r.data.items || [])).finally(() => setLoading(false))
    getBookmarks().then(b => setBookmarks(b))
  }, [])

  useEffect(() => {
    if (view === 'bookmarks') {
      const filtered = filterType === 'all' ? bookmarks : bookmarks.filter(i => i.contentType === filterType || i.type === filterType)
      setItems(filtered)
    } else {
      const combined = [...dbItems, ...MOCK_LIBRARY]
      const filtered = filterType === 'all' ? combined : combined.filter(i => i.type === filterType)
      setItems(filtered)
    }
  }, [filterType, dbItems, view, bookmarks])

  const remove = async (id) => {
    if (view === 'bookmarks') {
      await removeBookmark(id)
      setBookmarks(prev => prev.filter(i => i.id !== id))
    } else if (id > 10) {
      await api.delete(`/library/${id}`)
      setDbItems(prev => prev.filter(i => i.id !== id))
    } else {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleExportAll = async () => {
    await exportAllContent()
  }

  const handleExport = async (e, id) => {
    e.stopPropagation()
    await exportContent(id)
  }

  return (
    <div style={{ padding: '24px 28px' }} className="animate-fade-up">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[{v:'my-posts',l:'My Posts'},{v:'my-content',l:'My Content'},{v:'bookmarks',l:'Bookmarks'}].map(t => (
          <button key={t.v} onClick={() => setView(t.v)} style={{
            padding: '8px 16px', borderRadius: 9999, border: '1px solid',
            borderColor: view === t.v ? 'transparent' : '#E5E7EB',
            background: view === t.v ? '#111827' : 'white',
            color: view === t.v ? 'white' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
          }}>{t.l}</button>
        ))}
        {/* Type filter */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={handleExportAll} style={{
            padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#374151', background: 'white', cursor: 'pointer',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Download size={14} /> Export All
          </button>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', background: 'white', cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="slideshow">Slideshow</option>
            <option value="wall-of-text">Wall of Text</option>
            <option value="video-hook-and-demo">Video Hook</option>
            <option value="green-screen-meme">Green Screen</option>
          </select>
        </div>
      </div>

      {/* Grid - masonry style like original */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Array(10).fill(0).map((_, i) => <div key={i} style={{ aspectRatio: '4/5', background: '#F3F4F6', borderRadius: 12 }} className="animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 600, color: '#374151' }}>No content yet</div>
          <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>Generate content to see it here</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', cursor: 'pointer', aspectRatio: '9/16' }}
              onMouseEnter={e => { const v = e.currentTarget.querySelector('video'); if (v) v.play() }}
              onMouseLeave={e => { const v = e.currentTarget.querySelector('video'); if (v) v.pause() }}>
              {/* Video thumbnail + hover play */}
              {item.videoUrl ? (
                <video src={item.videoUrl} poster={item.thumbnail || item.thumbnail_url} muted loop playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : item.thumbnail || item.thumbnail_url ? (
                <img src={item.thumbnail || item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: `hsl(${item.id * 37}, 45%, 30%)` }}>
                  {item.type === 'slideshow' ? '🎠' : item.type === 'wall-of-text' ? '📝' : item.type === 'video-hook-and-demo' ? '🎬' : '🟩'}
                </div>
              )}

              {/* Caption for wall of text */}
              {(item.type === 'wall-of-text') && (
                <div style={{ position: 'absolute', inset: 0, padding: '40px 10px 10px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'white', fontSize: 11, fontWeight: 600, lineHeight: 1.45, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                    {item.title}
                  </p>
                </div>
              )}

              {/* Bottom meta */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 8px 6px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>
                    {formatDate(item.created_at || new Date()).replace(', 2026','').replace(', 2025','')}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: 700, textTransform: 'capitalize' }}>
                    {TYPE_LABEL[item.type] || item.type}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => remove(item.id)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <Trash2 size={11} />
              </button>
              {/* Export / Download */}
              <button onClick={(e) => handleExport(e, item.id)} style={{ position: 'absolute', top: 6, right: 34, width: 24, height: 24, borderRadius: '50%', background: 'rgba(59,130,246,0.85)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <Download size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
