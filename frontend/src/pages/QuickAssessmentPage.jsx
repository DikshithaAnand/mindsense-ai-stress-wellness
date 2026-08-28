import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionService } from '../services/api'
import { LoadingSpinner } from '../components/Animations'

export function QuickAssessmentPage() {
  const [sleepDuration, setSleepDuration] = useState(7)
  const [screenTime, setScreenTime] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await predictionService.predict({
        sleep_duration: parseFloat(sleepDuration),
        screen_time: parseFloat(screenTime)
      })

      navigate(`/result/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed')
      setLoading(false)
    }
  }

  const getSleepAdvice = (hours) => {
    if (hours < 5) return '⚠️ Very low sleep - severe impact'
    if (hours < 6) return '⚠️ Below recommended - consider adjusting'
    if (hours < 7) return '📈 Getting closer to recommended'
    if (hours <= 9) return '✅ Healthy sleep duration'
    return '⏰ Excessive sleep - might indicate fatigue'
  }

  const getScreenAdvice = (hours) => {
    if (hours > 10) return '🔴 Very high - take regular breaks'
    if (hours > 8) return '🟡 High - consider digital wellness'
    if (hours > 6) return '🟡 Moderate - try to reduce'
    if (hours <= 4) return '✅ Healthy screen time'
    return '✅ Good balance'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-dark-blue border border-teal/20 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-lavender mb-2">Quick Assessment</h1>
          <p className="text-teal mb-8">Estimate your stress level in 2 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sleep Duration */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-text-light font-semibold">Sleep Duration</label>
                <span className="text-2xl font-bold text-teal">{sleepDuration} hours</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                className="w-full h-2 bg-midnight border border-teal/20 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-teal text-sm mt-3">{getSleepAdvice(sleepDuration)}</p>
              <p className="text-text-light/50 text-xs mt-2">Recommended: 7-9 hours per night</p>
            </div>

            {/* Screen Time */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-text-light font-semibold">Screen Time (per day)</label>
                <span className="text-2xl font-bold text-teal">{screenTime} hours</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={screenTime}
                onChange={(e) => setScreenTime(e.target.value)}
                className="w-full h-2 bg-midnight border border-teal/20 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-teal text-sm mt-3">{getScreenAdvice(screenTime)}</p>
              <p className="text-text-light/50 text-xs mt-2">Recommended: 4-6 hours maximum</p>
            </div>

            {error && <p className="text-red-400">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-teal to-lavender text-midnight font-semibold rounded-lg hover:shadow-lg hover:shadow-teal/50 transition"
              >
                Get Prediction
              </button>
              <button
                type="button"
                onClick={() => navigate('/detailed-assessment')}
                className="flex-1 py-3 bg-midnight border border-teal text-teal font-semibold rounded-lg hover:bg-teal/10 transition"
              >
                Add Questions
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-midnight border border-lavender/20 rounded-lg">
            <p className="text-lavender text-sm font-semibold mb-2">⚠️ Disclaimer</p>
            <p className="text-text-light/70 text-xs">
              MINDsense is an educational wellness-support system and is not a medical diagnostic tool. 
              Always consult healthcare professionals for mental health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
