import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/api'

export function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await authService.logout()
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      logout()
      navigate('/login')
    }
  }

  return (
    <nav className="bg-midnight border-b border-teal/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-br from-teal to-lavender rounded-lg flex items-center justify-center">
              <span className="text-midnight font-bold">M</span>
            </div>
            <span className="text-lavender font-bold text-xl">MINDsense</span>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <span className="text-text-light text-sm">{user.first_name} {user.last_name}</span>
              <button
                onClick={() => navigate('/profile')}
                className="text-teal hover:text-lavender transition"
              >
                Profile
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-teal hover:text-lavender transition"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-teal/20 border border-teal text-teal rounded-lg hover:bg-teal/30 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
