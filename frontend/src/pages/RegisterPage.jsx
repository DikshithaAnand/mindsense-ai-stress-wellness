import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.register(formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-blue border border-teal/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-lavender mb-2">Join MINDsense</h1>
            <p className="text-teal text-sm">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-light text-sm mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-text-light text-sm mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-text-light text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-text-light text-sm mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-midnight border border-teal/20 rounded-lg text-text-light focus:border-teal outline-none transition"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-teal to-lavender text-midnight font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-text-light text-sm mt-4">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-teal hover:text-lavender transition"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
