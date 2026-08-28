import { useState, useEffect } from 'react'
import { predictionService } from '../services/api'
import { LoadingSpinner } from '../components/Animations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function HistoryPage() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await predictionService.getHistory()
      setPredictions(response.data.predictions)
    } catch (error) {
      console.error('Failed to fetch history:', error)
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

  // Prepare data for trend chart
  const trendData = predictions?.map(p => ({
    date: new Date(p.created_at).toLocaleDateString(),
    stress: { 'Low': 0, 'Medium': 1, 'High': 2 }[p.predicted_stress]
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-lavender mb-2">Assessment History</h1>
        <p className="text-teal mb-8">Track your wellness journey over time</p>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6 mb-8">
            <h2 className="text-lavender font-semibold mb-6">Stress Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#5fc3d0" opacity={0.1} />
                <XAxis dataKey="date" stroke="#e8e8e8" />
                <YAxis stroke="#e8e8e8" />
                <Tooltip />
                <Line type="monotone" dataKey="stress" stroke="#5fc3d0" dot={{ fill: '#e8d5f2' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History List */}
        <div className="space-y-4">
          <h2 className="text-lavender font-semibold">All Assessments ({predictions?.length || 0})</h2>
          {predictions && predictions.length > 0 ? (
            predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-4 bg-dark-blue border border-teal/20 rounded-xl hover:border-teal transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stressColors[prediction.predicted_stress] }}
                      />
                      <span className="text-lavender font-semibold">{prediction.predicted_stress} Stress</span>
                    </div>
                    <p className="text-text-light/70 text-sm mt-1">
                      Sleep: {prediction.sleep_duration}h • Screen: {prediction.screen_time}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-teal font-semibold">{(prediction.max_probability * 100).toFixed(0)}%</p>
                    <p className="text-text-light/50 text-sm">{new Date(prediction.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-light/70">No assessments yet. Start with a quick assessment!</p>
          )}
        </div>
      </div>
    </div>
  )
}
