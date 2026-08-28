import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login({ email, password })
      const { access_token, user_id, role } = response.data
      
      login(
        { id: user_id, email, role, first_name: 'User', last_name: '' },
        access_token
      )
      
      navigate(role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-blue border border-teal/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-lavender mb-2">MINDsense</h1>
            <p className="text-teal text-sm">Student Stress Estimation & Wellness</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-light text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-text-light text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-teal to-lavender text-midnight font-semibold rounded-lg hover:shadow-lg hover:shadow-teal/50 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-text-light text-sm mt-4">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-teal hover:text-lavender transition"
            >
              Register here
            </button>
          </p>
        </div>

        <div className="text-center mt-8 text-text-light/50 text-xs">
          <p>Demo credentials: admin@mindsense.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
