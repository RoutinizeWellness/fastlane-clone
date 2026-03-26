import { useState } from 'react'
import { useStore } from '../store'
import { X } from 'lucide-react'

export default function Settings() {
  const { user } = useStore()
  const [section, setSection] = useState('account')
  const [profileTab, setProfileTab] = useState('profile')

  const SECTIONS = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'workspaces', label: 'Workspaces', icon: '🏢' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'demo-videos', label: 'Demo Videos', icon: '🎬' },
    { id: 'remix', label: 'Remix', icon: '🔄' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 680, maxHeight: '85vh', display: 'flex', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, borderRight: '1px solid rgba(229,231,235,0.8)', display: 'flex', flexDirection: 'column', padding: '20px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>SETTINGS</div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: section === s.id ? '#F3F4F6' : 'transparent',
              color: section === s.id ? '#111827' : '#6B7280',
              textAlign: 'left', marginBottom: 2, transition: 'all 0.15s'
            }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
          {/* Book a call */}
          <div style={{ marginTop: 'auto', border: '1px solid #EA580C', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <span style={{ fontSize: 12 }}>📅</span>
            <span style={{ fontSize: 12, color: '#EA580C', fontWeight: 600 }}>Book a call with us</span>
            <X size={12} color="#EA580C" style={{ marginLeft: 'auto' }} />
          </div>
          <button style={{ marginTop: 8, padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
            → Sign out
          </button>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {section === 'account' && (
            <div style={{ padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Account</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Manage your account info.</p>
              </div>

              {/* Sub tabs */}
              <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid rgba(229,231,235,0.8)', marginBottom: 24 }}>
                {['Profile', 'Security'].map(t => (
                  <button key={t} onClick={() => setProfileTab(t.toLowerCase())} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: profileTab === t.toLowerCase() ? 600 : 400,
                    color: profileTab === t.toLowerCase() ? '#EA580C' : '#6B7280',
                    paddingBottom: 10, borderBottom: profileTab === t.toLowerCase() ? '2px solid #EA580C' : '2px solid transparent'
                  }}>{t}</button>
                ))}
              </div>

              {profileTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Profile */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(229,231,235,0.5)' }}>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Profile</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                      <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{user?.name || 'Tini Boti'}</span>
                    </div>
                    <button style={{ fontSize: 13, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Update profile</button>
                  </div>
                  {/* Email */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(229,231,235,0.5)' }}>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Email addresses</span>
                    <div>
                      <div style={{ fontSize: 14, color: '#111827' }}>{user?.email || 'tiniboti@gmail.com'}</div>
                      <button style={{ fontSize: 12, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>+ Add email address</button>
                    </div>
                    <div style={{ width: 80 }} />
                  </div>
                  {/* Connected */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Connected accounts</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      <span style={{ fontSize: 14, color: '#111827' }}>Google · {user?.email || 'tiniboti@gmail.com'}</span>
                    </div>
                    <div style={{ width: 80 }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'integrations' && (
            <div style={{ padding: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.3px' }}>Integrations</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'TikTok', icon: '🎵', color: '#000', desc: 'Post directly to TikTok' },
                  { name: 'Instagram', icon: '📸', color: '#E1306C', desc: 'Post Reels and Stories' },
                  { name: 'YouTube', icon: '▶️', color: '#FF0000', desc: 'Upload YouTube Shorts' },
                  { name: 'LinkedIn', icon: '💼', color: '#0077B5', desc: 'Share professional content' },
                  { name: 'Twitter/X', icon: '🐦', color: '#1DA1F2', desc: 'Tweet and post threads' },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid rgba(229,231,235,0.8)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{p.desc}</div>
                      </div>
                    </div>
                    <button style={{ padding: '6px 16px', background: '#EA580C', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Connect</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!['account','integrations'].includes(section) && (
            <div style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Coming soon</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
