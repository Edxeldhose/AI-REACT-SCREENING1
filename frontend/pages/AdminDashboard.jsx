/**
 * Admin Dashboard Component
 * Admin login and dashboard with sentiment analysis summary
 */

import { useState, useEffect } from 'react'
import { adminLogin, getAllFeedbacks, getSentimentSummary } from '../services/api'

function AdminDashboard({ onAdminLogin, isAdmin }) {
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  
  // Dashboard state
  const [feedbacks, setFeedbacks] = useState([])
  const [summary, setSummary] = useState({
    Positive: 0,
    Negative: 0,
    Neutral: 0,
    Total: 0
  })
  
  // UI state
  const [loginLoading, setLoginLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Load dashboard data when admin is logged in
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  // Load all data
  const loadDashboardData = async () => {
    setDataLoading(true)
    try {
      const [feedbacksRes, summaryRes] = await Promise.all([
        getAllFeedbacks(),
        getSentimentSummary()
      ])
      
      if (feedbacksRes.success) {
        setFeedbacks(feedbacksRes.feedbacks)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.summary)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  // Handle login input change
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    setError('')
  }

  // Validate login form
  const validateLoginForm = () => {
    const errors = {}
    
    if (!loginForm.username.trim()) {
      errors.username = 'Username is required'
    }
    if (!loginForm.password) {
      errors.password = 'Password is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    
    if (!validateLoginForm()) {
      return
    }
    
    setLoginLoading(true)
    setError('')
    
    try {
      const response = await adminLogin(loginForm)
      
      if (response.success) {
        onAdminLogin()
        setLoginForm({ username: '', password: '' })
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '😊'
      case 'negative': return '😞'
      case 'neutral': return '😐'
      default: return '🤔'
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Admin Login Form
  if (!isAdmin) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h2>Admin Login</h2>
            <p>Access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label htmlFor="username">
                Username <span>*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-control ${formErrors.username ? 'error' : ''}`}
                placeholder="Enter admin username"
                value={loginForm.username}
                onChange={handleLoginChange}
                disabled={loginLoading}
              />
              {formErrors.username && (
                <div className="form-error">{formErrors.username}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                Password <span>*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${formErrors.password ? 'error' : ''}`}
                placeholder="Enter admin password"
                value={loginForm.password}
                onChange={handleLoginChange}
                disabled={loginLoading}
              />
              {formErrors.password && (
                <div className="form-error">{formErrors.password}</div>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loginLoading}
            >
              {loginLoading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>
          
          <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
            <span>ℹ️</span>
            <span>Default credentials: admin / admin123</span>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of user feedbacks and sentiment analysis</p>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{summary.Total}</div>
          <div className="stat-label">Total Feedbacks</div>
        </div>
        <div className="stat-card positive">
          <div className="stat-value">{summary.Positive}</div>
          <div className="stat-label">😊 Positive</div>
        </div>
        <div className="stat-card negative">
          <div className="stat-value">{summary.Negative}</div>
          <div className="stat-label">😞 Negative</div>
        </div>
        <div className="stat-card neutral">
          <div className="stat-value">{summary.Neutral}</div>
          <div className="stat-label">😐 Neutral</div>
        </div>
      </div>
      
      {/* Feedback Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All User Feedbacks</h3>
          <button 
            className="btn btn-secondary btn-small"
            onClick={loadDashboardData}
            disabled={dataLoading}
          >
            {dataLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="alert alert-info">
            <span>ℹ️</span>
            <span>No feedbacks submitted yet.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Sentiment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td>{feedback.id}</td>
                    <td>{feedback.user_name}</td>
                    <td>
                      <span style={{ color: '#f59e0b' }}>
                        {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                      </span>
                      <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>
                        ({feedback.rating}/5)
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {feedback.comment.length > 100 
                        ? `${feedback.comment.substring(0, 100)}...` 
                        : feedback.comment}
                    </td>
                    <td>
                      <span className={`feedback-sentiment sentiment-${feedback.sentiment.toLowerCase()}`}>
                        {getSentimentIcon(feedback.sentiment)} {feedback.sentiment}
                      </span>
                    </td>
                    <td>{formatDate(feedback.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Sentiment Analysis Summary */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Sentiment Analysis Summary</h3>
        </div>
        
        {summary.Total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {((summary.Positive / summary.Total) * 100).toFixed(1)}%
              </div>
              <div style={{ color: '#64748b' }}>Positive</div>
            </div>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😞</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {((summary.Negative / summary.Total) * 100).toFixed(1)}%
              </div>
              <div style={{ color: '#64748b' }}>Negative</div>
            </div>
            <div style={{ 
              background: 'rgba(107, 114, 128, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😐</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>
                {((summary.Neutral / summary.Total) * 100).toFixed(1)}%
              </div>
              <div style={{ color: '#64748b' }}>Neutral</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
