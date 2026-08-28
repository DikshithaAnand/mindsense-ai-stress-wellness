import { useState, useEffect } from 'react'
import { adminService } from '../services/api'
import { LoadingSpinner } from '../components/Animations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function AdminPage() {
  const [stats, setStats] = useState(null)
  const [modelPerf, setModelPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, perfRes] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getModelPerformance()
      ])
      setStats(statsRes.data)
      setModelPerf(perfRes.data)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const stressData = stats ? [
    { name: 'Low', value: stats.stress_distribution.Low },
    { name: 'Medium', value: stats.stress_distribution.Medium },
    { name: 'High', value: stats.stress_distribution.High }
  ] : []

  const stressColors = {
    Low: '#5fc3d0',
    Medium: '#f59e0b',
    High: '#ef4444'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-lavender mb-8">Admin Dashboard</h1>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Total Users</p>
              <p className="text-4xl font-bold text-teal">{stats.total_users}</p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Students</p>
              <p className="text-4xl font-bold text-teal">{stats.total_students}</p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Total Predictions</p>
              <p className="text-4xl font-bold text-teal">{stats.total_predictions}</p>
            </div>
            <div className="p-6 bg-dark-blue border border-teal/20 rounded-xl">
              <p className="text-text-light/70 text-sm mb-2">Avg per Student</p>
              <p className="text-4xl font-bold text-teal">
                {stats.total_students > 0 ? (stats.total_predictions / stats.total_students).toFixed(1) : 0}
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6">
            <h2 className="text-lavender font-semibold mb-6">Stress Distribution</h2>
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

          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6">
            <h2 className="text-lavender font-semibold mb-6">Model Performance</h2>
            {modelPerf && modelPerf.xgboost && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-light">Accuracy</span>
                    <span className="text-teal font-semibold">{(modelPerf.xgboost.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-midnight rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal to-lavender"
                      style={{ width: `${modelPerf.xgboost.accuracy * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-light">F1-Score</span>
                    <span className="text-teal font-semibold">{(modelPerf.xgboost.f1_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-midnight rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal to-lavender"
                      style={{ width: `${modelPerf.xgboost.f1_score * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-light">Precision</span>
                    <span className="text-teal font-semibold">{(modelPerf.xgboost.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-midnight rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal to-lavender"
                      style={{ width: `${modelPerf.xgboost.precision * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
