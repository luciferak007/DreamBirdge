import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dreambirdge-nr0j.onrender.com',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('jp_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jp_token')
      localStorage.removeItem('jp_user')
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
}
export const jobsApi = {
  listPublic: (q='') => api.get('/jobs/public', { params: { q } }).then(r => r.data),
  getPublic: (id) => api.get(`/jobs/public/${id}`).then(r => r.data),
  list: (q='') => api.get('/jobs', { params: { q } }).then(r => r.data),
  get: (id) => api.get(`/jobs/${id}`).then(r => r.data),
  mine: () => api.get('/jobs/mine').then(r => r.data),
  create: (data) => api.post('/jobs', data).then(r => r.data),
  update: (id, data) => api.put(`/jobs/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then(r => r.data),
}
export const appsApi = {
  apply: (data) => api.post('/applications', data).then(r => r.data),
  mine: () => api.get('/applications/mine').then(r => r.data),
  forJob: (jobId) => api.get(`/applications/job/${jobId}`).then(r => r.data),
  setStatus: (id, status) => api.put(`/applications/${id}/status`, { status }).then(r => r.data),
}

// Upload a resume file (PDF/DOC/DOCX, max 5MB). Returns { url, filename, originalName }.
// `url` is server-relative (e.g. "/api/uploads/resume/xxx.pdf") — pass through resolveUploadUrl for links.
export const uploadsApi = {
  resume: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/uploads/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
}

export const resolveUploadUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
  return base + path
}

// ---------- ADMIN ----------
// All admin endpoints require an authenticated user with role=ADMIN.
// The backend rejects calls from any other role with HTTP 403.
export const adminApi = {
  stats:        ()              => api.get('/admin/stats').then(r => r.data),
  users:        ()              => api.get('/admin/users').then(r => r.data),
  jobs:         ()              => api.get('/admin/jobs').then(r => r.data),
  applications: ()              => api.get('/admin/applications').then(r => r.data),
  audit:        (params = {})   => api.get('/admin/audit', { params }).then(r => r.data),
  changeRole:   (id, role)      => api.put(`/admin/users/${id}/role`, { role }).then(r => r.data),
  deleteUser:   (id)            => api.delete(`/admin/users/${id}`).then(r => r.data),
  toggleJob:    (id, active)    => api.put(`/admin/jobs/${id}/active`, { active }).then(r => r.data),
  deleteJob:    (id)            => api.delete(`/admin/jobs/${id}`).then(r => r.data),
  deleteApp:    (id)            => api.delete(`/admin/applications/${id}`).then(r => r.data),
}

export default api
