/**
 * Signup Page Component
 * User registration form with validation
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../services/api'

function Signup({ onSignup }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
    setSuccess('')
    
    try {
      const response = await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })
      
      if (response.success) {
        setSuccess('Account created successfully! Redirecting...')
        
        // Store user data and redirect after delay
        setTimeout(() => {
          onSignup(response.user)
        }, 1500)
      } else {
        setError(response.message || 'Registration failed')
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
          <h2>Create Account</h2>
          <p>Sign up to get started with our platform</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${formErrors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.name && (
              <div className="form-error">{formErrors.name}</div>
            )}
          </div>
          
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
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.password && (
              <div className="form-error">{formErrors.password}</div>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span>*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-control ${formErrors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.confirmPassword && (
              <div className="form-error">{formErrors.confirmPassword}</div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
