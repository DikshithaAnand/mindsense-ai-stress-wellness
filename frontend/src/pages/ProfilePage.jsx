import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    if (user) {
      setProfileData(user)
    }
  }, [user])

  if (!profileData) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-lavender mb-8">Profile</h1>

        <div className="bg-dark-blue border border-teal/20 rounded-2xl p-8 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal to-lavender rounded-full flex items-center justify-center">
              <span className="text-2xl text-midnight font-bold">{profileData.first_name?.[0]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-lavender">{profileData.first_name} {profileData.last_name}</h2>
              <p className="text-teal">{profileData.email}</p>
            </div>
          </div>

          <div className="border-t border-teal/20 pt-6 space-y-4">
            <div>
              <p className="text-text-light/70 text-sm mb-1">Account Type</p>
              <p className="text-lavender font-semibold capitalize">{profileData.role} Account</p>
            </div>
            <div>
              <p className="text-text-light/70 text-sm mb-1">Member Since</p>
              <p className="text-lavender font-semibold">{new Date(profileData.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t border-teal/20 pt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-teal/20 border border-teal text-teal font-semibold rounded-lg hover:bg-teal/30 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
