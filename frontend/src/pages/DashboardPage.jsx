import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionService } from '../services/api'
import { LoadingSpinner, BreathingAnimation } from '../components/Animations'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBreathing, setShowBreathing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await predictionService.getUserStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const stressColors = {
    Low: '#5fc3d0',
    Medium: '#f59e0b',
    High: '#ef4444'
  }

  const stressData = stats ? [
    { name: 'Low', value: stats.stress_distribution.Low },
    { name: 'Medium', value: stats.stress_distribution.Medium },
    { name: 'High', value: stats.stress_distribution.High }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      {/* Header */}
      <div className="bg-dark-blue border-b border-teal/20 px-6 py-8">
        <h1 className="text-4xl font-bold text-lavender mb-2">Welcome Back</h1>
        <p className="text-teal">Track your mental wellness journey</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/quick-assessment')}
            className="p-6 bg-dark-blue border border-teal/30 rounded-xl hover:border-teal hover:shadow-lg hover:shadow-teal/20 transition transform hover:scale-105"
          >
            <div className="text-teal text-3xl mb-2">📊</div>
            <h3 className="text-lavender font-semibold mb-1">Quick Assessment</h3>
            <p className="text-text-light/70 text-sm">2 minutes to predict stress</p>
          </button>

          <button
            onClick={() => navigate('/detailed-assessment')}
            className="p-6 bg-dark-blue border border-teal/30 rounded-xl hover:border-teal hover:shadow-lg hover:shadow-teal/20 transition transform hover:scale-105"
          >
            <div className="text-teal text-3xl mb-2">🧠</div>
            <h3 className="text-lavender font-semibold mb-1">Detailed Assessment</h3>
            <p className="text-text-light/70 text-sm">5 questions + ML prediction</p>
          </button>

          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className="p-6 bg-dark-blue border border-teal/30 rounded-xl hover:border-teal hover:shadow-lg hover:shadow-teal/20 transition transform hover:scale-105"
          >
            <div className="text-teal text-3xl mb-2">🧘</div>
            <h3 className="text-lavender font-semibold mb-1">Relax & Reset</h3>
            <p className="text-text-light/70 text-sm">Breathing exercise</p>
          </button>
        </div>

        {/* Breathing Animation */}
        {showBreathing && (
          <div className="mb-8 p-6 bg-dark-blue border border-teal/20 rounded-xl">
            <BreathingAnimation />
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Total Assessments</p>
              <p className="text-4xl font-bold text-teal">{stats.total_predictions}</p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Current Status</p>
              <p className="text-2xl font-bold" style={{ color: stressColors[stats.recent_stress_level] }}>
                {stats.recent_stress_level}
              </p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Avg Sleep</p>
              <p className="text-2xl font-bold text-lavender">{stats.average_sleep_duration}h</p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Avg Screen Time</p>
              <p className="text-2xl font-bold text-lavender">{stats.average_screen_time}h</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
            <h3 className="text-lavender font-semibold mb-4">Stress Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#5fc3d0"
                  dataKey="value"
                >
                  {stressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={stressColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
            <h3 className="text-lavender font-semibold mb-4">Assessment History</h3>
            <button
              onClick={() => navigate('/history')}
              className="w-full py-3 bg-teal/20 border border-teal text-teal rounded-lg hover:bg-teal/30 transition"
            >
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
