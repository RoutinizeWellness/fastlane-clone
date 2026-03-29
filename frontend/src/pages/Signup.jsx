import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../store'
import { Loader2, Check, Chrome } from 'lucide-react'

const features = [
  'Generate Trending Content',
  '500+ Trending Videos',
  'Most Realistic UGC Avatars',
  'Multi-Platform Posting',
  'Track Performance',
]

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  leftPanel: {
    width: '50%',
    backgroundColor: '#111827',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '64px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#EA580C',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#fff',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '16px',
    color: '#D1D5DB',
  },
  checkCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(234,88,12,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  testimonial: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '32px',
    marginTop: '48px',
  },
  testimonialText: {
    fontSize: '15px',
    color: '#9CA3AF',
    lineHeight: '1.7',
    fontStyle: 'italic',
    marginBottom: '16px',
  },
  testimonialAuthor: {
    fontSize: '14px',
    color: '#6B7280',
  },
  rightPanel: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: '48px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  subheading: {
    fontSize: '15px',
    color: '#6B7280',
    marginBottom: '32px',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 0',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    backgroundColor: '#fff',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: '13px',
    color: '#9CA3AF',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px 0',
    backgroundColor: '#EA580C',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
    transition: 'opacity 0.15s',
  },
  switchText: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6B7280',
  },
  switchLink: {
    color: '#EA580C',
    fontWeight: '600',
    textDecoration: 'none',
  },
  errorBox: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    borderRadius: '10px',
    fontSize: '14px',
  },
}

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/signup', form)
      login(data.user, data.token)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.wrapper}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><span>⚡</span></div>
            <span style={styles.logoText}>Fastlane</span>
          </div>
          <div style={styles.featureList}>
            {features.map((f) => (
              <div key={f} style={styles.featureItem}>
                <div style={styles.checkCircle}>
                  <Check size={16} color="#EA580C" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.testimonial}>
          <p style={styles.testimonialText}>
            "Fastlane helped us 10x our content output. The AI-generated UGC avatars are
            indistinguishable from real creators. Absolutely game-changing for our marketing."
          </p>
          <p style={styles.testimonialAuthor}>— Sarah K., Growth Lead at ScaleUp</p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h1 style={styles.heading}>Create an account</h1>
          <p style={styles.subheading}>10x your organic marketing in minutes</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="button"
            style={styles.googleBtn}
            onClick={() => alert('Google OAuth coming soon')}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
          >
            <Chrome size={18} />
            Continue with Google
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
                placeholder="Your name"
                required
                onFocus={(e) => { e.target.style.borderColor = '#EA580C' }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                placeholder="you@example.com"
                required
                onFocus={(e) => { e.target.style.borderColor = '#EA580C' }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                placeholder="Min 8 characters"
                minLength={6}
                required
                onFocus={(e) => { e.target.style.borderColor = '#EA580C' }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Continue
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
