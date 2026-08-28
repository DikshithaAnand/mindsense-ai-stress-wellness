import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { predictionService } from '../services/api'
import { LoadingSpinner, WavesAnimation } from '../components/Animations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function ResultPage() {
  const { id } = useParams()
  const [prediction, setPrediction] = useState(null)
  const [shap, setShap] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchResult()
  }, [id])

  const fetchResult = async () => {
    try {
      const [predRes, shapRes, recRes] = await Promise.all([
        predictionService.getPrediction(id),
        predictionService.getSHAPExplanation(id),
        predictionService.getRecommendations(id)
      ])
      setPrediction(predRes.data)
      setShap(shapRes.data)
      setRecommendations(recRes.data)
    } catch (error) {
      console.error('Failed to fetch result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!prediction) return <div className="text-text-light">Result not found</div>

  const stressColors = {
    Low: '#5fc3d0',
    Medium: '#f59e0b',
    High: '#ef4444'
  }

  const probabilityData = [
    { name: 'Low', probability: (prediction.probability_low * 100).toFixed(1) },
    { name: 'Medium', probability: (prediction.probability_medium * 100).toFixed(1) },
    { name: 'High', probability: (prediction.probability_high * 100).toFixed(1) }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Result Card */}
        <div className="bg-dark-blue border-2 border-teal rounded-2xl p-8 shadow-xl mb-8">
          <div className="text-center mb-8">
            <p className="text-text-light/70 text-sm mb-2">Your Predicted Stress Level</p>
            <h1 className="text-6xl font-bold mb-4" style={{ color: stressColors[prediction.predicted_stress] }}>
              {prediction.predicted_stress}
            </h1>
            <p className="text-lavender text-lg">Based on your sleep and screen time data</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-midnight border border-teal/20 rounded-lg text-center">
              <p className="text-text-light/70 text-sm mb-2">Sleep Duration</p>
              <p className="text-3xl font-bold text-teal">{prediction.sleep_duration}h</p>
            </div>
            <div className="p-4 bg-midnight border border-teal/20 rounded-lg text-center">
              <p className="text-text-light/70 text-sm mb-2">Screen Time</p>
              <p className="text-3xl font-bold text-teal">{prediction.screen_time}h</p>
            </div>
          </div>
        </div>

        {/* Probability Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6">
            <h2 className="text-lavender font-semibold mb-4">Prediction Confidence</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={probabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#5fc3d0" opacity={0.1} />
                <XAxis dataKey="name" stroke="#e8e8e8" />
                <YAxis stroke="#e8e8e8" />
                <Tooltip />
                <Bar dataKey="probability" fill="#5fc3d0" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-text-light/70 text-xs mt-4 text-center">
              Maximum Confidence: {(prediction.max_probability * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6">
            <h2 className="text-lavender font-semibold mb-4">Relax & Reset</h2>
            <WavesAnimation />
          </div>
        </div>

        {/* SHAP Explanation */}
        {shap && (
          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6 mb-8">
            <h2 className="text-lavender font-semibold mb-6">Understanding Your Prediction</h2>
            <p className="text-text-light/70 text-sm mb-6">
              Here's how your sleep and screen time influenced this stress prediction:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-midnight border border-teal/10 rounded-lg">
                <p className="text-lavender font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">😴</span> Sleep Duration Impact
                </p>
                <p className="text-4xl font-bold mb-2" style={{ color: shap.sleep_duration_impact < 0 ? '#5fc3d0' : '#ef4444' }}>
                  {shap.sleep_duration_impact.toFixed(3)}
                </p>
                <p className="text-text-light/70 text-sm">
                  {shap.sleep_duration_impact < 0
                    ? '✅ More sleep = Lower stress'
                    : '⚠️ Less sleep = Higher stress'}
                </p>
              </div>
              <div className="p-4 bg-midnight border border-teal/10 rounded-lg">
                <p className="text-lavender font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">📱</span> Screen Time Impact
                </p>
                <p className="text-4xl font-bold mb-2" style={{ color: shap.screen_time_impact > 0 ? '#ef4444' : '#5fc3d0' }}>
                  {shap.screen_time_impact.toFixed(3)}
                </p>
                <p className="text-text-light/70 text-sm">
                  {shap.screen_time_impact > 0
                    ? '⚠️ More screen time = Higher stress'
                    : '✅ Less screen time = Lower stress'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && (
          <div className="bg-dark-blue border border-teal/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lavender font-semibold">Personalized Recommendations</h2>
              <span className="px-3 py-1 bg-teal/20 border border-teal text-teal text-xs font-semibold rounded-full">
                {recommendations.overall_priority} Priority
              </span>
            </div>
            <div className="space-y-3">
              {recommendations.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-midnight border-l-4 rounded-lg"
                  style={{ borderLeftColor: rec.priority === 'High' ? '#ef4444' : rec.priority === 'Medium' ? '#f59e0b' : '#5fc3d0' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lavender font-semibold mb-1">{rec.title}</p>
                      <p className="text-text-light/70 text-sm">{rec.description}</p>
                    </div>
                    <span className="ml-4 px-2 py-1 bg-teal/10 text-teal text-xs font-semibold rounded">
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 bg-teal/20 border border-teal text-teal font-semibold rounded-lg hover:bg-teal/30 transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/quick-assessment')}
            className="flex-1 py-3 bg-gradient-to-r from-teal to-lavender text-midnight font-semibold rounded-lg hover:shadow-lg transition"
          >
            New Assessment
          </button>
        </div>
      </div>
    </div>
  )
}
