import { useState } from 'react'

const AVATARS = [
  { id: 1, name: 'Sophia Chen', gender: 'Female', ethnicity: 'Asian', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 2, name: 'Marcus Johnson', gender: 'Male', ethnicity: 'Black', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 3, name: 'Isabella Rivera', gender: 'Female', ethnicity: 'Latina', img: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 4, name: 'James O\'Brien', gender: 'Male', ethnicity: 'Caucasian', img: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 5, name: 'Priya Sharma', gender: 'Female', ethnicity: 'South Asian', img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 6, name: 'David Kim', gender: 'Male', ethnicity: 'Asian', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 7, name: 'Emma Taylor', gender: 'Female', ethnicity: 'Caucasian', img: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 8, name: 'Andre Williams', gender: 'Male', ethnicity: 'Black', img: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 9, name: 'Mei Lin', gender: 'Female', ethnicity: 'Asian', img: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 10, name: 'Ryan Cooper', gender: 'Male', ethnicity: 'Caucasian', img: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 11, name: 'Aisha Patel', gender: 'Female', ethnicity: 'South Asian', img: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 12, name: 'Carlos Mendez', gender: 'Male', ethnicity: 'Latino', img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
]

const CATEGORIES = ['All', 'Female', 'Male', 'Diverse']

export default function UGC() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = AVATARS.filter(a => {
    const matchCat = category === 'All' || category === 'Diverse' || a.gender === category
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.ethnicity.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1000 }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
          AI UGC Avatars
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
          500+ hyper-realistic AI avatars ready to create content for your brand.
        </p>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search avatars..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#374151', outline: 'none', width: 220,
            transition: 'border-color 0.15s'
          }}
          onFocus={e => e.target.style.borderColor = '#EA580C'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '6px 14px', border: '1px solid',
              borderColor: category === c ? '#111827' : '#E5E7EB',
              background: category === c ? '#111827' : 'white',
              color: category === c ? 'white' : '#374151',
              borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Avatar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(avatar => (
          <AvatarCard key={avatar.id} avatar={avatar} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>
          No avatars match your filters.
        </div>
      )}
    </div>
  )
}

function AvatarCard({ avatar }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      style={{
        background: 'white', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.2s', cursor: 'pointer',
        transform: hovering ? 'translateY(-2px)' : 'none',
        boxShadow: hovering ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
        <img
          src={avatar.img}
          alt={avatar.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hovering ? 'scale(1.05)' : 'scale(1)' }}
        />
        {/* Hover preview label */}
        {hovering && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.7)', color: 'white',
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600
          }}>Preview</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{avatar.name}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
            background: avatar.gender === 'Female' ? '#FCE7F3' : '#DBEAFE',
            color: avatar.gender === 'Female' ? '#9D174D' : '#1D4ED8'
          }}>{avatar.gender}</span>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
            background: '#F3F4F6', color: '#374151'
          }}>{avatar.ethnicity}</span>
        </div>
        <button style={{
          width: '100%', padding: '8px 0', border: 'none', borderRadius: 8,
          background: '#EA580C', color: 'white', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'background 0.15s'
        }}
          onMouseEnter={e => e.target.style.background = '#C2410C'}
          onMouseLeave={e => e.target.style.background = '#EA580C'}
        >Use Avatar</button>
      </div>
    </div>
  )
}
