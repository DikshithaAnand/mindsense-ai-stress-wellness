import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'

// Pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuickAssessmentPage } from './pages/QuickAssessmentPage'
import { DetailedAssessmentPage } from './pages/DetailedAssessmentPage'
import { ResultPage } from './pages/ResultPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quick-assessment"
            element={
              <ProtectedRoute>
                <QuickAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detailed-assessment"
            element={
              <ProtectedRoute>
                <DetailedAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
