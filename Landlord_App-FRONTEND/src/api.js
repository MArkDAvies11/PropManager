const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://landlord-app-backend-1eph.onrender.com'

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },
  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  upload: async (endpoint, formData) => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    })
    return handleResponse(response)
  }
}

// Auth functions
export const auth = {
  login: async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },
  register: async (userData) => {
    return api.post('/api/auth/register', userData)
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data)
}

// Properties functions
export const properties = {
  getAll: () => api.get('/api/properties'),
  getById: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  delete: (id) => api.delete(`/api/properties/${id}`),
  uploadImage: (id, formData) => api.upload(`/api/properties/${id}/images`, formData)
}

// Payments functions
export const payments = {
  getAll: () => api.get('/api/payments'),
  getById: (id) => api.get(`/api/payments/${id}`),
  create: (data) => api.post('/api/payments', data),
  update: (id, data) => api.put(`/api/payments/${id}`, data)
}

// Chat functions
export const chat = {
  getConversations: () => api.get('/api/conversations'),
  createConversation: (data) => api.post('/api/conversations', data),
  getMessages: (id) => api.get(`/api/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/api/conversations/${id}/messages`, data)
}

// Dashboard functions
export const dashboard = {
  getLandlordDashboard: () => api.get('/api/dashboard/landlord'),
  getTenantDashboard: () => api.get('/api/dashboard/tenant')
}

export default API_BASE_URL