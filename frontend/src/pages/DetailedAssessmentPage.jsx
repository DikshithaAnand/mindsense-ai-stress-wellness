import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionService } from '../services/api'
import { LoadingSpinner } from '../components/Animations'

export function DetailedAssessmentPage() {
  const [sleepDuration, setSleepDuration] = useState(7)
  const [screenTime, setScreenTime] = useState(5)
  const [questionnaire, setQuestionnaire] = useState({
    q1: 2,
    q2: 2,
    q3: 2,
    q4: 2,
    q5: 2
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const questions = [
    {
      id: 'q1',
      text: 'In the last month, how often have you felt unable to control the important things in your life?',
      scale: 'Not at all - Very often'
    },
    {
      id: 'q2',
      text: 'How often have you felt confident about your ability to handle your personal problems?',
      scale: 'Very often - Not at all'
    },
    {
      id: 'q3',
      text: 'How often have you felt that things were going your way?',
      scale: 'Very often - Not at all'
    },
    {
      id: 'q4',
      text: 'How often have you felt difficulties were piling up so high that you could not overcome them?',
      scale: 'Not at all - Very often'
    },
    {
      id: 'q5',
      text: 'How often have you felt nervous and "stressed"?',
      scale: 'Not at all - Very often'
    }
  ]

  const handleQuestionChange = (questionId, value) => {
    setQuestionnaire({
      ...questionnaire,
      [questionId]: parseInt(value)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await predictionService.predict({
        sleep_duration: parseFloat(sleepDuration),
        screen_time: parseFloat(screenTime),
        questionnaire
      })

      navigate(`/result/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed')
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const totalScore = Object.values(questionnaire).reduce((a, b) => a + b, 0)
  const maxScore = 20
  const scorePercentage = (totalScore / maxScore) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-blue to-midnight">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-dark-blue border border-teal/20 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-lavender mb-2">Detailed Assessment</h1>
          <p className="text-teal mb-8">Sleep + Screen Time + 5 Wellness Questions</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sleep & Screen Time Section */}
            <div className="p-6 bg-midnight border border-teal/10 rounded-xl space-y-6">
              <h2 className="text-lavender font-semibold">Daily Metrics</h2>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-text-light">Sleep Duration</label>
                  <span className="text-xl font-bold text-teal">{sleepDuration}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  className="w-full h-2 bg-blue-gray rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-text-light">Screen Time</label>
                  <span className="text-xl font-bold text-teal">{screenTime}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="0.5"
                  value={screenTime}
                  onChange={(e) => setScreenTime(e.target.value)}
                  className="w-full h-2 bg-blue-gray rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Questionnaire Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lavender font-semibold">Wellness Questions</h2>
                <div className="text-right">
                  <p className="text-text-light/70 text-sm">Score: {totalScore}/20</p>
                  <div className="w-24 h-2 bg-midnight rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal to-lavender"
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {questions.map((question, idx) => (
                <div key={question.id} className="p-4 bg-midnight border border-teal/10 rounded-lg space-y-3">
                  <p className="text-text-light font-medium">
                    <span className="text-teal mr-2">{idx + 1}.</span>
                    {question.text}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-text-light/50 text-xs">{question.scale}</p>
                    <span className="text-teal font-semibold">{questionnaire[question.id]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={questionnaire[question.id]}
                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                    className="w-full h-2 bg-blue-gray rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-red-400">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-teal to-lavender text-midnight font-semibold rounded-lg hover:shadow-lg hover:shadow-teal/50 transition"
              >
                Get Full Analysis
              </button>
              <button
                type="button"
                onClick={() => navigate('/quick-assessment')}
                className="flex-1 py-3 bg-midnight border border-teal text-teal font-semibold rounded-lg hover:bg-teal/10 transition"
              >
                Quick Instead
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-midnight border border-lavender/20 rounded-lg">
            <p className="text-lavender text-sm font-semibold mb-2">📋 About This Assessment</p>
            <p className="text-text-light/70 text-xs">
              The 5-question wellness check is based on concepts from validated stress assessment tools. 
              Combined with your sleep and screen time data, the ML model provides personalized insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
