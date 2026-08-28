import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user } = useAuth()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return children
}
