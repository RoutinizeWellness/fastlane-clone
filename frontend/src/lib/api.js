import axios from 'axios'

// En dev: Vite proxy manda /api → localhost:3001
// En prod unificado: mismo origen, /api va directo al backend
const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fl_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fl_token')
      localStorage.removeItem('fl_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
