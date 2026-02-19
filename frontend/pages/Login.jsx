/**
 * Login Page Component
 * User authentication form
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signin } from '../services/api'

function Login({ onLogin }) {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    setError('')
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await signin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })
      
      if (response.success) {
        onLogin(response.user)
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.email && (
              <div className="form-error">{formErrors.email}</div>
            )}
          </div>
          
          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span>*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${formErrors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.password && (
              <div className="form-error">{formErrors.password}</div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="form-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
