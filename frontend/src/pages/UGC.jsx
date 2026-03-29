import { useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'

// --- Avatar color palette for initials circles ---
const COLORS = [
  '#EA580C', '#2563EB', '#7C3AED', '#059669', '#D97706',
  '#DC2626', '#0891B2', '#4F46E5', '#BE185D', '#15803D',
  '#9333EA', '#B45309', '#0D9488', '#6D28D9', '#C026D3',
  '#1D4ED8', '#E11D48', '#0369A1', '#65A30D', '#A21CAF',
]

// --- Avatar data: 48 diverse avatars ---
const AVATARS = [
  { id: 1, name: 'Sophia Chen', gender: 'Female', age: 28, style: 'Professional', popular: true },
  { id: 2, name: 'Marcus Johnson', gender: 'Male', age: 34, style: 'Authoritative', popular: false },
  { id: 3, name: 'Isabella Rivera', gender: 'Female', age: 22, style: 'Energetic', popular: false },
  { id: 4, name: 'James O\'Brien', gender: 'Male', age: 40, style: 'Professional', popular: false },
  { id: 5, name: 'Priya Sharma', gender: 'Female', age: 26, style: 'Friendly', popular: true },
  { id: 6, name: 'David Kim', gender: 'Male', age: 31, style: 'Casual', popular: false },
  { id: 7, name: 'Emma Taylor', gender: 'Female', age: 24, style: 'Casual', popular: false },
  { id: 8, name: 'Andre Williams', gender: 'Male', age: 29, style: 'Energetic', popular: false },
  { id: 9, name: 'Mei Lin', gender: 'Female', age: 21, style: 'Friendly', popular: false },
  { id: 10, name: 'Ryan Cooper', gender: 'Male', age: 36, style: 'Authoritative', popular: false },
  { id: 11, name: 'Aisha Patel', gender: 'Female', age: 23, style: 'Energetic', popular: false },
  { id: 12, name: 'Carlos Mendez', gender: 'Male', age: 27, style: 'Casual', popular: true },
  { id: 13, name: 'Yuki Tanaka', gender: 'Female', age: 25, style: 'Friendly', popular: false },
  { id: 14, name: 'Liam Johansson', gender: 'Male', age: 33, style: 'Professional', popular: false },
  { id: 15, name: 'Fatima Al-Rashid', gender: 'Female', age: 30, style: 'Authoritative', popular: false },
  { id: 16, name: 'Kofi Asante', gender: 'Male', age: 28, style: 'Energetic', popular: false },
  { id: 17, name: 'Olivia Nguyen', gender: 'Female', age: 22, style: 'Casual', popular: false },
  { id: 18, name: 'Ethan Brooks', gender: 'Male', age: 38, style: 'Authoritative', popular: false },
  { id: 19, name: 'Amara Okafor', gender: 'Female', age: 26, style: 'Professional', popular: false },
  { id: 20, name: 'Diego Fernandez', gender: 'Male', age: 24, style: 'Friendly', popular: false },
  { id: 21, name: 'Hannah Mueller', gender: 'Female', age: 32, style: 'Professional', popular: false },
  { id: 22, name: 'Raj Krishnamurthy', gender: 'Male', age: 35, style: 'Authoritative', popular: false },
  { id: 23, name: 'Zara Mitchell', gender: 'Female', age: 20, style: 'Energetic', popular: true },
  { id: 24, name: 'Tomasz Kowalski', gender: 'Male', age: 41, style: 'Professional', popular: false },
  { id: 25, name: 'Leila Haddad', gender: 'Female', age: 27, style: 'Friendly', popular: false },
  { id: 26, name: 'Samuel Osei', gender: 'Male', age: 23, style: 'Casual', popular: false },
  { id: 27, name: 'Chloe Dubois', gender: 'Female', age: 29, style: 'Professional', popular: false },
  { id: 28, name: 'Hiroshi Yamamoto', gender: 'Male', age: 37, style: 'Authoritative', popular: false },
  { id: 29, name: 'Valentina Rossi', gender: 'Female', age: 24, style: 'Energetic', popular: false },
  { id: 30, name: 'Noah Andersen', gender: 'Male', age: 26, style: 'Casual', popular: false },
  { id: 31, name: 'Nia Thompson', gender: 'Female', age: 21, style: 'Friendly', popular: false },
  { id: 32, name: 'Mateo Vargas', gender: 'Male', age: 33, style: 'Professional', popular: false },
  { id: 33, name: 'Suki Park', gender: 'Female', age: 25, style: 'Casual', popular: false },
  { id: 34, name: 'Alexander Petrov', gender: 'Male', age: 42, style: 'Authoritative', popular: true },
  { id: 35, name: 'Adanna Eze', gender: 'Female', age: 28, style: 'Energetic', popular: false },
  { id: 36, name: 'Lucas Moreau', gender: 'Male', age: 30, style: 'Friendly', popular: false },
  { id: 37, name: 'Jasmine Wu', gender: 'Female', age: 23, style: 'Casual', popular: false },
  { id: 38, name: 'Omar Hassan', gender: 'Male', age: 39, style: 'Professional', popular: false },
  { id: 39, name: 'Elena Popescu', gender: 'Female', age: 31, style: 'Authoritative', popular: false },
  { id: 40, name: 'Tyler Washington', gender: 'Male', age: 22, style: 'Energetic', popular: false },
  { id: 41, name: 'Ananya Desai', gender: 'Female', age: 27, style: 'Friendly', popular: false },
  { id: 42, name: 'Sebastian Cruz', gender: 'Male', age: 25, style: 'Casual', popular: true },
  { id: 43, name: 'Mia Johansson', gender: 'Female', age: 20, style: 'Energetic', popular: false },
  { id: 44, name: 'Benjamin Achebe', gender: 'Male', age: 44, style: 'Authoritative', popular: false },
  { id: 45, name: 'Sakura Ito', gender: 'Female', age: 24, style: 'Friendly', popular: false },
  { id: 46, name: 'Daniel Reyes', gender: 'Male', age: 32, style: 'Professional', popular: false },
  { id: 47, name: 'Nadia Volkov', gender: 'Female', age: 29, style: 'Professional', popular: false },
  { id: 48, name: 'Kwame Mensah', gender: 'Male', age: 26, style: 'Casual', popular: false },
]

const GENDER_CATEGORIES = ['All', 'Female', 'Male', 'Young (18-25)', 'Professional (30-45)', 'Diverse']
const STYLE_OPTIONS = ['All Styles', 'Casual', 'Professional', 'Energetic', 'Friendly', 'Authoritative']


function getInitials(name) {
  const parts = name.split(' ')
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase()
}

function getColor(id) {
  return COLORS[(id - 1) % COLORS.length]
}

export default function UGC() {
  const [category, setCategory] = useState('All')
  const [style, setStyle] = useState('All Styles')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(24)

  const filtered = AVATARS.filter(a => {
    const matchCat =
      category === 'All' ||
      category === 'Diverse' ||
      (category === 'Young (18-25)' && a.age >= 18 && a.age <= 25) ||
      (category === 'Professional (30-45)' && a.age >= 30 && a.age <= 45) ||
      a.gender === category
    const matchStyle = style === 'All Styles' || a.style === style
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.style.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchStyle && matchSearch
  })

  const visible = filtered.slice(0, visibleCount)
  const popularAvatars = AVATARS.filter(a => a.popular).slice(0, 6)

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
          AI UGC Avatars
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
          500+ hyper-realistic AI avatars ready to create content for your brand.
        </p>
      </div>

      {/* Most Popular Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Star size={16} color="#EA580C" fill="#EA580C" />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Most Popular</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {popularAvatars.map(avatar => (
            <AvatarCard key={'pop-' + avatar.id} avatar={avatar} featured />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#E5E7EB', marginBottom: 24 }} />

      {/* Search + filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search avatars..."
          value={search}
          onChange={e => { setSearch(e.target.value); setVisibleCount(24) }}
          style={{
            padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#374151', outline: 'none', width: 220,
            transition: 'border-color 0.15s'
          }}
          onFocus={e => (e.target.style.borderColor = '#EA580C')}
          onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GENDER_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => { setCategory(c); setVisibleCount(24) }}
              style={{
                padding: '6px 14px', border: '1px solid',
                borderColor: category === c ? '#111827' : '#E5E7EB',
                background: category === c ? '#111827' : 'white',
                color: category === c ? 'white' : '#374151',
                borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Style filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Style:</span>
        {STYLE_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => { setStyle(s); setVisibleCount(24) }}
            style={{
              padding: '5px 12px', border: '1px solid',
              borderColor: style === s ? '#EA580C' : '#E5E7EB',
              background: style === s ? '#FFF7ED' : 'white',
              color: style === s ? '#EA580C' : '#6B7280',
              borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid counter */}
      <div style={{ marginBottom: 14, fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
        Showing {visible.length} of 500+ avatars
      </div>

      {/* Avatar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {visible.map(avatar => (
          <AvatarCard key={avatar.id} avatar={avatar} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>
          No avatars match your filters.
        </div>
      )}

      {/* Load More */}
      {visibleCount < filtered.length && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            onClick={() => setVisibleCount(prev => prev + 24)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 32px', border: '1px solid #E5E7EB', borderRadius: 10,
              background: 'white', color: '#374151', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.color = '#EA580C' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
          >
            Load More <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function AvatarCard({ avatar, featured }) {
  const [hovering, setHovering] = useState(false)
  const initials = getInitials(avatar.name)
  const color = getColor(avatar.id)

  const styleTagColors = {
    Casual: { bg: '#F0FDF4', text: '#166534' },
    Professional: { bg: '#EFF6FF', text: '#1E40AF' },
    Energetic: { bg: '#FFF7ED', text: '#C2410C' },
    Friendly: { bg: '#FDF4FF', text: '#86198F' },
    Authoritative: { bg: '#F5F3FF', text: '#5B21B6' },
  }
  const tag = styleTagColors[avatar.style] || { bg: '#F3F4F6', text: '#374151' }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid rgba(229,231,235,0.8)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
        transform: hovering ? 'translateY(-2px)' : 'none',
        boxShadow: hovering
          ? '0 4px 12px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Colored circle with initials */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: featured ? '1' : '3/4',
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: featured ? 48 : 72,
            height: featured ? 48 : 72,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: featured ? 18 : 26,
            fontWeight: 700,
            letterSpacing: '1px',
            transition: 'transform 0.3s',
            transform: hovering ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {initials}
        </div>
        {hovering && !featured && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Preview
          </div>
        )}
        {avatar.popular && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#EA580C',
              color: 'white',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Star size={10} fill="white" /> Popular
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: featured ? '10px 10px' : '14px 16px' }}>
        <div
          style={{
            fontSize: featured ? 12 : 14,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {avatar.name}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: featured ? 8 : 12, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 6,
              background: tag.bg,
              color: tag.text,
            }}
          >
            {avatar.style}
          </span>
        </div>
        <button
          style={{
            width: '100%',
            padding: featured ? '6px 0' : '8px 0',
            border: 'none',
            borderRadius: 8,
            background: '#EA580C',
            color: 'white',
            fontSize: featured ? 11 : 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.target.style.background = '#C2410C')}
          onMouseLeave={e => (e.target.style.background = '#EA580C')}
        >
          Use Avatar
        </button>
      </div>
    </div>
  )
}
