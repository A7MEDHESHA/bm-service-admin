import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BRAND_NAME } from '../config/branding.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // TEMPORARY: Auto log in for testing!
  useEffect(() => {
    // Set a dummy token and user
    login('dummy-token', { id: 1, name: 'Admin User', role: 'admin' })
    navigate('/dashboard')
  }, [login, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // API CALL: POST /auth/login
      const data = await loginRequest(email, password)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-wide">{BRAND_NAME}</h1>
          <p className="text-sm text-slate-500">Staff login</p>
          <div className="brand-stripes mt-3" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
          required
        />

        <label className="block text-sm text-slate-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 border border-slate-300 rounded-md text-sm"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
