import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2, Download, Search, ChevronDown, Edit3, Share2,
  FileText, Film, Layers, Monitor, Bookmark, PenTool,
  Send, Package, ArrowUpDown, Plus, Zap
} from 'lucide-react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import { VIRAL_CONTENT } from '../lib/viralContent'
import { getBookmarks, removeBookmark, exportContent, exportAllContent } from '../lib/contentActions'

/* ── constants ── */
const ORANGE = '#EA580C'
const ORANGE_LIGHT = '#FFF7ED'
const ORANGE_MID = '#FDBA74'

const TYPE_LABEL = {
  slideshow: 'Slideshow',
  'wall-of-text': 'Wall of Text',
  'video-hook-and-demo': 'Hook & Demo',
  'green-screen-meme': 'Green Screen',
}

const TYPE_COLORS = {
  slideshow: { bg: '#EEF2FF', text: '#4F46E5' },
  'wall-of-text': { bg: '#FEF3C7', text: '#B45309' },
  'video-hook-and-demo': { bg: '#ECFDF5', text: '#059669' },
  'green-screen-meme': { bg: '#F0FDF4', text: '#16A34A' },
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'slideshow', label: 'Slideshow' },
  { value: 'wall-of-text', label: 'Wall of Text' },
  { value: 'video-hook-and-demo', label: 'Hook & Demo' },
  { value: 'green-screen-meme', label: 'Green Screen' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

const TABS = [
  { v: 'my-posts', l: 'My Posts', icon: Send, desc: 'Published' },
  { v: 'my-content', l: 'My Content', icon: PenTool, desc: 'Drafts & Created' },
  { v: 'studio', l: 'Studio Items', icon: Film, desc: 'Composition Pipeline' },
  { v: 'bookmarks', l: 'Bookmarks', icon: Bookmark, desc: 'Saved' },
]

/* ── mock data ── */
const MOCK_LIBRARY = VIRAL_CONTENT.map(v => ({
  id: v.id,
  type: v.contentType || 'wall-of-text',
  platform: 'tiktok',
  title: v.caption,
  thumbnail: v.thumbnail,
  videoUrl: v.videoUrl,
  created_at: '2026-03-23',
}))

/* ── ContentCard ── */
function ContentCard({ item, onDelete, onExport }) {
  const [hovered, setHovered] = useState(false)
  const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS['wall-of-text']
  const label = TYPE_LABEL[item.type] || item.type

  return (
    <div
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: '#111', cursor: 'pointer', aspectRatio: '9/16',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => {
        setHovered(true)
        const v = e.currentTarget.querySelector('video')
        if (v) v.play()
      }}
      onMouseLeave={e => {
        setHovered(false)
        const v = e.currentTarget.querySelector('video')
        if (v) v.pause()
      }}
    >
      {/* Media */}
      {item.videoUrl ? (
        <video src={item.videoUrl} poster={item.thumbnail || item.thumbnail_url} muted loop playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : item.thumbnail || item.thumbnail_url ? (
        <img src={item.thumbnail || item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: `hsl(${(item.id * 37) % 360}, 40%, 25%)` }}>
          {item.type === 'slideshow' ? <Layers size={40} color="#fff" /> : item.type === 'wall-of-text' ? <FileText size={40} color="#fff" /> : item.type === 'video-hook-and-demo' ? <Film size={40} color="#fff" /> : <Monitor size={40} color="#fff" />}
        </div>
      )}

      {/* Type badge */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        padding: '3px 10px', borderRadius: 20,
        background: typeColor.bg, color: typeColor.text,
        fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
        backdropFilter: 'blur(8px)', border: `1px solid ${typeColor.text}22`,
      }}>
        {label}
      </div>

      {/* Caption overlay for wall-of-text */}
      {item.type === 'wall-of-text' && (
        <div style={{ position: 'absolute', inset: 0, padding: '44px 14px 60px', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontSize: 11, fontWeight: 600, lineHeight: 1.5, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
            {item.title}
          </p>
        </div>
      )}

      {/* Bottom gradient with meta */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
        {item.title && item.type !== 'wall-of-text' && (
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 500, margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.title}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>
            {formatDate(item.created_at || new Date()).replace(', 2026', '').replace(', 2025', '')}
          </span>
          <span style={{ fontSize: 12 }}>
            {item.platform === 'tiktok' ? '📱' : item.platform === 'instagram' ? '📸' : '▶️'}
          </span>
        </div>
      </div>

      {/* Hover action buttons */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(8px)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}>
        {[
          { icon: Edit3, color: 'rgba(255,255,255,0.9)', bg: 'rgba(0,0,0,0.5)', onClick: () => {} },
          { icon: Download, color: 'rgba(255,255,255,0.9)', bg: 'rgba(59,130,246,0.75)', onClick: (e) => onExport(e, item.id) },
          { icon: Share2, color: 'rgba(255,255,255,0.9)', bg: 'rgba(139,92,246,0.75)', onClick: () => {} },
          { icon: Trash2, color: 'rgba(255,255,255,0.9)', bg: 'rgba(239,68,68,0.75)', onClick: () => onDelete(item.id) },
        ].map(({ icon: Icon, color, bg, onClick }, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); onClick(e) }} style={{
            width: 28, height: 28, borderRadius: '50%', background: bg,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color, backdropFilter: 'blur(6px)',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── EmptyState ── */
function EmptyState({ view, navigate }) {
  const configs = {
    'my-posts': {
      icon: Send,
      title: 'No published posts yet',
      desc: 'Posts you publish will appear here. Start creating content and share it with the world.',
      cta: 'Create Content',
      ctaAction: () => navigate('/app/blitz'),
    },
    'my-content': {
      icon: PenTool,
      title: 'No content created yet',
      desc: 'Your drafts and created content will live here. Head to Blitz to generate viral content.',
      cta: 'Create Content',
      ctaAction: () => navigate('/app/blitz'),
    },
    bookmarks: {
      icon: Bookmark,
      title: 'No bookmarks saved',
      desc: 'Save content you love from Blitz and it will appear here for easy access later.',
      cta: 'Go to Blitz',
      ctaAction: () => navigate('/app/blitz'),
    },
  }
  const c = configs[view] || configs['my-content']
  const Icon = c.icon

  return (
    <div style={{ textAlign: 'center', padding: '80px 0', maxWidth: 380, margin: '0 auto' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
        background: ORANGE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={32} color={ORANGE} />
      </div>
      <div style={{ fontWeight: 700, color: '#111827', fontSize: 18, marginBottom: 8 }}>{c.title}</div>
      <div style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{c.desc}</div>
      <button onClick={c.ctaAction} style={{
        padding: '10px 28px', borderRadius: 12, border: 'none',
        background: ORANGE, color: 'white', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#C2410C'}
        onMouseLeave={e => e.currentTarget.style.background = ORANGE}
      >
        <Zap size={15} /> {c.cta}
      </button>
    </div>
  )
}

/* ── Main Library ── */
export default function Library() {
  const navigate = useNavigate()
  const [dbItems, setDbItems] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [studioItems, setStudioItems] = useState([])
  const [view, setView] = useState('my-content')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    api.get('/library').then(r => setDbItems(r.data.items || [])).finally(() => setLoading(false))
    getBookmarks().then(b => setBookmarks(b))
    api.get('/content-items?limit=100').then(r => setStudioItems(r.data.items || [])).catch(() => {})
  }, [])

  const items = useMemo(() => {
    let list
    if (view === 'bookmarks') {
      list = [...bookmarks]
    } else if (view === 'studio') {
      list = studioItems.map(si => ({
        id: `studio-${si.id}`,
        _studioId: si.id,
        type: si.type,
        title: si.title || 'Untitled',
        created_at: si.created_at,
        state: si.state,
        render_url: si.render_url,
        _isStudio: true,
      }))
    } else {
      list = [...dbItems, ...MOCK_LIBRARY]
    }
    // filter by type
    if (filterType !== 'all') {
      list = list.filter(i => (i.type || i.contentType) === filterType)
    }
    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => (i.title || i.caption || '').toLowerCase().includes(q))
    }
    // sort
    list.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime()
      const db = new Date(b.created_at || 0).getTime()
      return sortBy === 'newest' ? db - da : da - db
    })
    return list
  }, [view, filterType, sortBy, search, dbItems, bookmarks, studioItems])

  const tabCounts = useMemo(() => ({
    'my-posts': [...dbItems, ...MOCK_LIBRARY].length,
    'my-content': [...dbItems, ...MOCK_LIBRARY].length,
    studio: studioItems.length,
    bookmarks: bookmarks.length,
  }), [dbItems, bookmarks, studioItems])

  const remove = async (id) => {
    if (view === 'bookmarks') {
      await removeBookmark(id)
      setBookmarks(prev => prev.filter(i => i.id !== id))
    } else if (id > 10) {
      await api.delete(`/library/${id}`)
      setDbItems(prev => prev.filter(i => i.id !== id))
    } else {
      setDbItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleExportAll = async () => { await exportAllContent() }
  const handleExport = async (e, id) => { e.stopPropagation(); await exportContent(id) }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Library</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Manage your content, drafts, and saved items</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const Icon = t.icon
          const active = view === t.v
          return (
            <button key={t.v} onClick={() => setView(t.v)} style={{
              padding: '10px 20px', borderRadius: 12, border: '1.5px solid',
              borderColor: active ? ORANGE : '#E5E7EB',
              background: active ? ORANGE_LIGHT : 'white',
              color: active ? ORANGE : '#4B5563',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#F9FAFB' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white' } }}
            >
              <Icon size={15} />
              {t.l}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 99,
                background: active ? ORANGE : '#E5E7EB',
                color: active ? 'white' : '#6B7280',
              }}>
                {tabCounts[t.v]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Toolbar: Search + Filters + Sort + Export */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text" placeholder="Search content..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10,
              border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none',
              transition: 'border-color 0.2s', background: 'white', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = ORANGE}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(f => {
            const active = filterType === f.value
            return (
              <button key={f.value} onClick={() => setFilterType(f.value)} style={{
                padding: '7px 14px', borderRadius: 99, border: '1.5px solid',
                borderColor: active ? ORANGE : '#E5E7EB',
                background: active ? ORANGE_LIGHT : 'white',
                color: active ? ORANGE : '#6B7280',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button onClick={() => setShowSort(!showSort)} style={{
            padding: '8px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB',
            background: 'white', color: '#374151', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <ArrowUpDown size={14} />
            {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
            <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: showSort ? 'rotate(180deg)' : 'none' }} />
          </button>
          {showSort && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowSort(false)} />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 11,
                background: 'white', borderRadius: 12, border: '1px solid #E5E7EB',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 160,
              }}>
                {SORT_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => { setSortBy(s.value); setShowSort(false) }} style={{
                    width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                    background: sortBy === s.value ? ORANGE_LIGHT : 'white',
                    color: sortBy === s.value ? ORANGE : '#374151',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => { if (sortBy !== s.value) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (sortBy !== s.value) e.currentTarget.style.background = 'white' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export all */}
        <button onClick={handleExportAll} style={{
          padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 10,
          fontSize: 12, color: '#374151', background: 'white', cursor: 'pointer',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
        >
          <Package size={14} /> Export All
        </button>
      </div>

      {/* Stats summary */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, padding: '12px 16px',
        background: '#F9FAFB', borderRadius: 12, alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>
          Showing <strong style={{ color: '#111827' }}>{items.length}</strong> {items.length === 1 ? 'item' : 'items'}
          {filterType !== 'all' && <> in <strong style={{ color: ORANGE }}>{TYPE_LABEL[filterType]}</strong></>}
          {search && <> matching "<strong style={{ color: ORANGE }}>{search}</strong>"</>}
        </span>
      </div>

      {/* Content grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {Array(10).fill(0).map((_, i) => (
            <div key={i} style={{ aspectRatio: '9/16', background: '#F3F4F6', borderRadius: 16 }} className="animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState view={view} navigate={navigate} />
      ) : view === 'studio' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {items.map(item => (
            <StudioCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <ContentCard key={item.id} item={item} onDelete={remove} onExport={handleExport} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── StudioCard — content items from composition pipeline ── */
const STATE_STYLES = {
  generated: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Generated' },
  edited: { bg: '#FEF3C7', text: '#92400E', label: 'Edited' },
  approved: { bg: '#DCFCE7', text: '#15803D', label: 'Approved' },
  scheduled: { bg: '#EDE9FE', text: '#5B21B6', label: 'Scheduled' },
  published: { bg: '#F0FDF4', text: '#166534', label: 'Published' },
}

function StudioCard({ item, navigate }) {
  const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS['wall-of-text']
  const typeLabel = TYPE_LABEL[item.type] || item.type
  const state = STATE_STYLES[item.state] || STATE_STYLES.generated
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(`/edit/${item._studioId}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
        background: 'white', border: '1.5px solid #E5E7EB',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: typeColor.bg, color: typeColor.text,
        }}>{typeLabel}</span>
        <span style={{
          padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: state.bg, color: state.text,
        }}>{state.label}</span>
        {item.render_url && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#059669', fontWeight: 600 }}>
            <Film size={10} /> MP4
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title}
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF' }}>
        {formatDate(item.created_at || new Date()).replace(', 2026', '')}
      </div>
    </div>
  )
}