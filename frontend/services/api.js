/**
 * API Service Module
 * Handles all HTTP requests to the Flask backend using Axios
 */

import axios from 'axios'

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ==================== User Authentication APIs ====================

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise} API response
 */
export const signup = async (userData) => {
  try {
    const response = await api.post('/api/signup', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise} API response
 */
export const signin = async (credentials) => {
  try {
    const response = await api.post('/api/signin', credentials)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

// ==================== Feedback APIs ====================

/**
 * Submit user feedback
 * @param {Object} feedbackData - { user_id, rating, comment }
 * @returns {Promise} API response with sentiment analysis
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback', feedbackData)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

/**
 * Get feedbacks for a specific user
 * @param {number} userId - User ID
 * @returns {Promise} API response with user's feedbacks
 */
export const getUserFeedbacks = async (userId) => {
  try {
    const response = await api.get(`/api/feedback/user/${userId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

// ==================== Admin APIs ====================

/**
 * Admin login
 * @param {Object} credentials - { username, password }
 * @returns {Promise} API response
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/api/admin/login', credentials)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

/**
 * Get all feedbacks (Admin only)
 * @returns {Promise} API response with all feedbacks
 */
export const getAllFeedbacks = async () => {
  try {
    const response = await api.get('/api/admin/feedbacks')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

/**
 * Get sentiment summary (Admin only)
 * @returns {Promise} API response with sentiment counts
 */
export const getSentimentSummary = async () => {
  try {
    const response = await api.get('/api/admin/summary')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

/**
 * Get all users (Admin only)
 * @returns {Promise} API response with all users
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/admin/users')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' }
  }
}

// Export the api instance for custom requests
export default api
