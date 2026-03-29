import { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
  X, User, CreditCard, Building2, Link2, LogOut,
  Phone, Mail, Lock, Camera, ChevronRight, Check,
  Crown, Zap, Send, Plus, Eye, EyeOff
} from 'lucide-react'

/* ---------- helpers ---------- */
const STORAGE_KEY = 'fl_integrations'

const loadConnections = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
const saveConnections = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c))

/* ---------- platform config ---------- */
const PLATFORMS = [
  { id: 'tiktok',    name: 'TikTok',    abbr: 'TK', color: '#000000', ring: '#25F4EE', desc: 'Post directly to TikTok', acct: '@creator_tk' },
  { id: 'instagram', name: 'Instagram',  abbr: 'IG', color: '#E1306C', ring: '#C13584', desc: 'Post Reels and Stories',   acct: '@creator_ig' },
  { id: 'youtube',   name: 'YouTube',    abbr: 'YT', color: '#FF0000', ring: '#FF4444', desc: 'Upload YouTube Shorts',   acct: 'Creator Channel' },
  { id: 'linkedin',  name: 'LinkedIn',   abbr: 'IN', color: '#0077B5', ring: '#0A66C2', desc: 'Share professional content', acct: 'Creator Profile' },
  { id: 'twitter',   name: 'Twitter / X', abbr: 'X',  color: '#000000', ring: '#1DA1F2', desc: 'Tweet and post threads',  acct: '@creator_x' },
]

/* ---------- section nav items ---------- */
const SECTIONS = [
  { id: 'account',      label: 'Account',      Icon: User },
  { id: 'integrations', label: 'Integrations',  Icon: Link2 },
  { id: 'billing',      label: 'Billing',       Icon: CreditCard },
  { id: 'workspaces',   label: 'Workspaces',    Icon: Building2 },
]

/* ---------- reusable small components ---------- */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#111827' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: '#F3F4F6', margin: '20px 0' }} />
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Settings() {
  const { user, logout } = useStore()
  const [section, setSection] = useState('account')
  const [profileTab, setProfileTab] = useState('profile')
  const [connections, setConnections] = useState(loadConnections)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => { saveConnections(connections) }, [connections])

  const toggleConnection = (id) => {
    setConnections(prev => {
      const next = { ...prev, [id]: !prev[id] }
      return next
    })
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    setInviteSent(true)
    setTimeout(() => { setInviteSent(false); setInviteEmail('') }, 2000)
  }

  /* ---- render ---- */
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: 780, maxHeight: '88vh', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>

        {/* ============ LEFT SIDEBAR ============ */}
        {renderSidebar(section, setSection, logout)}

        {/* ============ RIGHT CONTENT ============ */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA' }}>
          {section === 'account' && renderAccount(user, profileTab, setProfileTab, showOldPw, setShowOldPw, showNewPw, setShowNewPw)}
          {section === 'integrations' && renderIntegrations(connections, toggleConnection)}
          {section === 'billing' && renderBilling()}
          {section === 'workspaces' && renderWorkspaces(inviteEmail, setInviteEmail, inviteSent, handleInvite, user)}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SIDEBAR
   ================================================================ */
function renderSidebar(section, setSection, logout) {
  return (
    <div style={{ width: 210, borderRight: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column', padding: '24px 14px', background: '#fff' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', padding: '0 10px', marginBottom: 10, textTransform: 'uppercase' }}>Settings</div>

      {SECTIONS.map(({ id, label, Icon }) => {
        const active = section === id
        return (
          <button key={id} onClick={() => setSection(id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: active ? '#FFF7ED' : 'transparent',
            color: active ? '#EA580C' : '#6B7280',
            textAlign: 'left', marginBottom: 2, transition: 'all 0.15s', width: '100%'
          }}>
            <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
            {label}
            {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Book a call CTA */}
      <div style={{
        border: '1.5px solid #EA580C', borderRadius: 10, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', marginBottom: 8
      }}>
        <Phone size={14} color="#EA580C" />
        <span style={{ fontSize: 12, color: '#EA580C', fontWeight: 600, lineHeight: 1.3 }}>Book a call<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.8 }}>with our team</span></span>
        <X size={12} color="#EA580C" style={{ marginLeft: 'auto', opacity: 0.5 }} />
      </div>

      <button onClick={() => logout && logout()} style={{
        padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 13, color: '#9CA3AF', textAlign: 'left', display: 'flex', alignItems: 'center',
        gap: 8, borderRadius: 8, width: '100%', transition: 'color 0.15s'
      }}>
        <LogOut size={14} /> Sign out
      </button>
    </div>
  )
}

/* ================================================================
   ACCOUNT SECTION
   ================================================================ */
function renderAccount(user, profileTab, setProfileTab, showOldPw, setShowOldPw, showNewPw, setShowNewPw) {
  const tabs = ['Profile', 'Security']
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Account" subtitle="Manage your profile and security settings." />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1.5px solid #E5E7EB', marginBottom: 28 }}>
        {tabs.map(t => {
          const active = profileTab === t.toLowerCase()
          return (
            <button key={t} onClick={() => setProfileTab(t.toLowerCase())} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: active ? 600 : 400, color: active ? '#EA580C' : '#6B7280',
              paddingBottom: 12, borderBottom: active ? '2.5px solid #EA580C' : '2.5px solid transparent',
              transition: 'all 0.15s'
            }}>{t}</button>
          )
        })}
      </div>

      {profileTab === 'profile' && renderProfileTab(user)}
      {profileTab === 'security' && renderSecurityTab(showOldPw, setShowOldPw, showNewPw, setShowNewPw)}
    </div>
  )
}

function renderProfileTab(user) {
  const name = user?.name || 'Tini Boti'
  const email = user?.email || 'tiniboti@gmail.com'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Avatar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Profile Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff',
            position: 'relative'
          }}>
            {initials}
            <div style={{
              position: 'absolute', bottom: -2, right: -2, width: 22, height: 22,
              borderRadius: '50%', background: '#fff', border: '2px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <Camera size={11} color="#6B7280" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Upload a photo (max 2MB)</div>
          </div>
          <button style={{
            marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer'
          }}>Change</button>
        </div>
      </div>

      {/* Name & Email fields */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Personal Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Full Name</label>
            <input defaultValue={name} style={{
              width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box',
              background: '#FAFAFA'
            }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
            <input defaultValue={email} style={{
              width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box',
              background: '#FAFAFA'
            }} />
          </div>
        </div>
        <button style={{
          marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none',
          background: '#EA580C', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>Save Changes</button>
      </div>

      {/* Connected accounts */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Connected Accounts</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Google</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{user?.email || 'tiniboti@gmail.com'}</div>
          </div>
          <Check size={16} color="#22C55E" />
        </div>
      </div>
    </div>
  )
}

function renderSecurityTab(showOldPw, setShowOldPw, showNewPw, setShowNewPw) {
  const pwFieldStyle = {
    width: '100%', padding: '9px 12px', paddingRight: 36, borderRadius: 8,
    border: '1px solid #E5E7EB', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box', background: '#FAFAFA'
  }
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Lock size={16} color="#374151" />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Change Password</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Current Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showOldPw ? 'text' : 'password'} placeholder="Enter current password" style={pwFieldStyle} />
            <button onClick={() => setShowOldPw(!showOldPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showOldPw ? <EyeOff size={14} color="#9CA3AF" /> : <Eye size={14} color="#9CA3AF" />}
            </button>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showNewPw ? 'text' : 'password'} placeholder="Enter new password" style={pwFieldStyle} />
            <button onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showNewPw ? <EyeOff size={14} color="#9CA3AF" /> : <Eye size={14} color="#9CA3AF" />}
            </button>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" style={{ ...pwFieldStyle, paddingRight: 12 }} />
        </div>
        <button style={{
          alignSelf: 'flex-start', marginTop: 4, padding: '8px 20px', borderRadius: 8,
          border: 'none', background: '#EA580C', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>Update Password</button>
      </div>
    </div>
  )
}

/* ================================================================
   INTEGRATIONS SECTION
   ================================================================ */
function renderIntegrations(connections, toggleConnection) {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Integrations" subtitle="Connect your social accounts to publish content." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLATFORMS.map(p => {
          const connected = !!connections[p.id]
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
              transition: 'box-shadow 0.15s',
            }}>
              {/* Platform logo circle */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
                boxShadow: `0 0 0 3px ${connected ? p.ring + '33' : 'transparent'}`,
                transition: 'box-shadow 0.2s'
              }}>
                {p.abbr}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: connected ? '#22C55E' : '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {connected && <Check size={12} />}
                  {connected ? `Connected as ${p.acct}` : 'Not connected'}
                </div>
              </div>

              {/* Connect / Disconnect button */}
              <button onClick={() => toggleConnection(p.id)} style={{
                padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', minWidth: 100, textAlign: 'center',
                background: connected ? '#FEF2F2' : '#EA580C',
                color: connected ? '#DC2626' : '#fff',
                border: connected ? '1px solid #FECACA' : '1px solid #EA580C',
              }}>
                {connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================
   BILLING SECTION
   ================================================================ */
function renderBilling() {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Billing" subtitle="Manage your subscription and billing details." />

      {/* Current plan card */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 60%)',
        border: '1.5px solid #FDBA74', borderRadius: 14, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: '#EA580C', borderRadius: '50%', opacity: 0.06 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Crown size={18} color="#EA580C" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Plan</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Free Plan</div>
        <div style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 18px' }}>Basic features with limited publishing. Upgrade to unlock all platforms and scheduling.</div>
        <button style={{
          padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: '#EA580C', color: '#fff', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Zap size={14} /> Upgrade to Growth
        </button>
      </div>

      {/* Plan comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[
          { plan: 'Free', price: '$0', features: ['3 posts / month', '1 social account', 'Basic analytics'], current: true },
          { plan: 'Growth', price: '$29', features: ['Unlimited posts', '5 social accounts', 'Advanced analytics', 'Priority support'], current: false },
        ].map(p => (
          <div key={p.plan} style={{
            background: '#fff', border: p.current ? '2px solid #EA580C' : '1px solid #E5E7EB',
            borderRadius: 12, padding: '18px 20px', position: 'relative'
          }}>
            {p.current && (
              <div style={{
                position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700,
                color: '#EA580C', background: '#FFF7ED', padding: '2px 8px', borderRadius: 20
              }}>Current</div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{p.plan}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '4px 0 10px' }}>
              {p.price}<span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}>/mo</span>
            </div>
            {p.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', marginBottom: 6 }}>
                <Check size={12} color="#22C55E" /> {f}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Billing history */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Billing History</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>No billing history yet.</div>
      </div>
    </div>
  )
}

/* ================================================================
   WORKSPACES / INVITE TEAM SECTION
   ================================================================ */
function renderWorkspaces(inviteEmail, setInviteEmail, inviteSent, handleInvite, user) {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Workspaces" subtitle="Manage your workspace and team members." />

      {/* Current workspace */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Current Workspace</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #EA580C, #FB923C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff'
          }}>
            {(user?.name || 'T')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{user?.name || 'Tini Boti'}'s Workspace</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>1 member</div>
          </div>
        </div>
      </div>

      {/* Invite team */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Mail size={16} color="#374151" />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Invite Team Members</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              fontSize: 13, outline: 'none', background: '#FAFAFA'
            }}
          />
          <button onClick={handleInvite} style={{
            padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: inviteSent ? '#22C55E' : '#EA580C', color: '#fff', fontSize: 13,
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.2s', minWidth: 90, justifyContent: 'center'
          }}>
            {inviteSent ? <><Check size={14} /> Sent!</> : <><Send size={13} /> Invite</>}
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>Invite up to 5 team members on the Growth plan.</div>
      </div>

      {/* Team list */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Team Members</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #FB923C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff'
          }}>
            {(user?.name || 'T')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name || 'Tini Boti'}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{user?.email || 'tiniboti@gmail.com'}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#EA580C', background: '#FFF7ED', padding: '3px 8px', borderRadius: 20 }}>Owner</span>
        </div>
      </div>
    </div>
  )
}
