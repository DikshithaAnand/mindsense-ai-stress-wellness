import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
}

export const predictionService = {
  predict: (data) => api.post('/predictions/predict', data),
  getHistory: () => api.get('/predictions/history'),
  getPrediction: (id) => api.get(`/predictions/${id}`),
  getSHAPExplanation: (id) => api.get(`/predictions/${id}/shap`),
  getRecommendations: (id) => api.get(`/predictions/${id}/recommendations`),
  getUserStats: () => api.get('/predictions/user/stats')
}

export const adminService = {
  getSystemStats: () => api.get('/admin/stats'),
  listUsers: () => api.get('/admin/users'),
  getModelPerformance: () => api.get('/admin/model/performance')
}

export default api
