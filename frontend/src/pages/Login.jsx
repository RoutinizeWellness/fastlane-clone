import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../store'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('demo@fastlane.ai')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.user, data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-black text-2xl text-gray-900">Fastlane</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign In
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            No account? <Link to="/signup" className="text-brand-primary font-semibold hover:underline">Sign up free</Link>
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
            Demo: demo@fastlane.ai / demo1234
          </div>
        </div>
      </div>
    </div>
  )
}
