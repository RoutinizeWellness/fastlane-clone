import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../store'
import { Loader2 } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-black text-2xl text-gray-900">Fastlane</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Start creating viral content today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Alex Rivera" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" placeholder="Min 8 characters" minLength={6} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account — It's Free
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Have an account? <Link to="/login" className="text-brand-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
