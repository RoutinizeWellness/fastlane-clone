import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Zap, FileText, BookOpen, Calendar, BarChart2, TrendingUp, Users, Tag, HelpCircle, MessageSquare, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useStore } from '../store'

const NAV_TOP = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/blitz', icon: Zap, label: 'Blitz' },
  { to: '/content', icon: FileText, label: 'Content' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]
const NAV_BOTTOM = [
  { to: '/brand', icon: Tag, label: 'Brand' },
  { to: '/guide', icon: HelpCircle, label: 'Guide' },
  { to: '/engagement', icon: MessageSquare, label: 'Feedback' },
  { href: 'https://discord.gg/aaAQ9VzQ6j', icon: MessageSquare, label: 'Discord' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <aside style={{
      width: 160,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      borderRight: '1px solid rgba(229,231,235,0.8)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(229,231,235,0.6)' }}>
        {/* Fastlane logo - F stylized */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h18v4H7v3h10v4H7v7H3V3z" fill="#EA580C"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', color: '#111827' }}>Fastlane</span>
        </div>
        {/* Workspace selector */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: '#F3F4F6', border: 'none', borderRadius: 8,
          padding: '6px 8px', cursor: 'pointer', marginTop: 8
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, background: '#EA580C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0
          }}>
            {initials[0]}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name?.split(' ')[0] || 'Workspace'}
          </span>
          <ChevronDown size={12} color="#9CA3AF" />
        </button>
      </div>

      {/* Free trial banner */}
      <div style={{ padding: '8px 12px', background: '#FFF7ED', borderBottom: '1px solid #FED7AA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C' }} />
          <span style={{ fontSize: 11, color: '#EA580C', fontWeight: 600 }}>Free trial • 3d left</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_TOP.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
            fontSize: 13, fontWeight: isActive ? 600 : 400,
            color: isActive ? '#111827' : '#6B7280',
            background: isActive ? '#F3F4F6' : 'transparent',
            transition: 'all 0.15s'
          })}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(229,231,235,0.8)', margin: '8px 0' }} />

        {NAV_BOTTOM.map((item) => {
          const { icon: Icon, label } = item
          if (item.href) {
            return (
              <a key={label} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: 400, color: '#6B7280',
                transition: 'all 0.15s'
              }}>
                <Icon size={15} />
                {label}
              </a>
            )
          }
          return (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#111827' : '#6B7280',
              background: isActive ? '#F3F4F6' : 'transparent',
              transition: 'all 0.15s'
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User bottom */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(229,231,235,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#EA580C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 11, flexShrink: 0
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 4 }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
