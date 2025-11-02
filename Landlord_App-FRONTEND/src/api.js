/**
 * PropManager Frontend - API Configuration
 * 
 * This file handles all HTTP communication with the backend API.
 * Features:
 * - Centralized API base URL configuration
 * - JWT token authentication
 * - Automatic error handling
 * - RESTful API methods (GET, POST, PUT, DELETE)
 * - Organized API functions by feature (auth, properties, payments, chat)
 */

// API Base URL - Uses environment variable or defaults to production URL
// Set VITE_API_URL in .env file for local development (e.g., http://localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://landlord-app-backend-1eph.onrender.com'

/**
 * Get Authentication Headers
 * Retrieves JWT token from localStorage and includes it in request headers
 * @returns {Object} Headers object with Content-Type and Authorization
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')  // JWT token stored after login
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })  // Add token if exists
  }
}

/**
 * Handle API Response
 * Checks response status and parses JSON or throws error
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not OK
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to parse error message from response
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

/**
 * Core API Methods
 * Generic HTTP methods used by all API functions
 */
export const api = {
  // GET request - Retrieve data
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  // POST request - Create new data
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },
  
  // PUT request - Update existing data
  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },
  
  // DELETE request - Remove data
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  // UPLOAD request - Send files/images
  upload: async (endpoint, formData) => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Note: Don't set Content-Type for FormData, browser sets it automatically
      },
      body: formData
    })
    return handleResponse(response)
  }
}

/**
 * Authentication API Functions
 * Handles user login, registration, and session management
 */
export const auth = {
  /**
   * Login User
   * Authenticates user and stores JWT token in localStorage
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and access token
   */
  login: async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    if (data.access_token) {
      // Store token and user data for subsequent requests
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },
  
  /**
   * Register New User
   * Creates new landlord or tenant account
   * @param {Object} userData - User registration data (email, password, role, etc.)
   * @returns {Promise<Object>} Created user data
   */
  register: async (userData) => {
    return api.post('/api/auth/register', userData)
  },
  
  /**
   * Logout User
   * Clears authentication data from localStorage
   */
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },
  
  // Get current user profile
  getProfile: () => api.get('/api/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => api.put('/api/auth/profile', data)
}

/**
 * Properties API Functions
 * Manages rental properties (CRUD operations)
 */
export const properties = {
  getAll: () => api.get('/api/properties'),  // Get all properties
  getById: (id) => api.get(`/api/properties/${id}`),  // Get single property by ID
  create: (data) => api.post('/api/properties', data),  // Create new property (landlord only)
  update: (id, data) => api.put(`/api/properties/${id}`, data),  // Update property (landlord only)
  delete: (id) => api.delete(`/api/properties/${id}`),  // Delete property (landlord only)
  uploadImage: (id, formData) => api.upload(`/api/properties/${id}/images`, formData)  // Upload property image
}

/**
 * Payments API Functions
 * Handles rent payments via M-Pesa STK Push
 * All payments are KES 20,000 (fixed rent amount)
 */
export const payments = {
  getAll: () => api.get('/api/payments'),  // Get all payments (landlord sees all, tenant sees own)
  getById: (id) => api.get(`/api/payments/${id}`),  // Get single payment by ID
  create: (data) => api.post('/api/payments', data),  // Initiate M-Pesa STK Push payment
  update: (id, data) => api.put(`/api/payments/${id}`, data)  // Update payment status
}

/**
 * Chat API Functions
 * Real-time messaging between landlord and tenants
 * Uses polling (every 2 seconds) instead of WebSockets
 */
export const chat = {
  getConversations: () => api.get('/api/conversations'),  // Get all conversations
  createConversation: (data) => api.post('/api/conversations', data),  // Start new conversation
  getMessages: (id) => api.get(`/api/conversations/${id}/messages`),  // Get messages for conversation
  sendMessage: (id, data) => api.post(`/api/conversations/${id}/messages`, data)  // Send new message
}

/**
 * Dashboard API Functions
 * Retrieves dashboard statistics and data
 */
export const dashboard = {
  getLandlordDashboard: () => api.get('/api/dashboard/landlord'),  // Get landlord dashboard data
  getTenantDashboard: () => api.get('/api/dashboard/tenant')  // Get tenant dashboard data
}

// Export API base URL for direct use if needed
export default API_BASE_URL