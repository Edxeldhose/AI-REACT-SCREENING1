/**
 * Feedback Page Component
 * User feedback submission form with sentiment analysis display
 */

import { useState, useEffect } from 'react'
import { submitFeedback, getUserFeedbacks } from '../services/api'

function Feedback({ user }) {
  // Form state
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [sentimentResult, setSentimentResult] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true)
  
  // Star hover state
  const [hoverRating, setHoverRating] = useState(0)

  // Load user's previous feedbacks
  useEffect(() => {
    loadFeedbacks()
  }, [user])

  const loadFeedbacks = async () => {
    if (!user?.id) return
    
    try {
      const response = await getUserFeedbacks(user.id)
      if (response.success) {
        setFeedbacks(response.feedbacks)
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err)
    } finally {
      setLoadingFeedbacks(false)
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
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
    setSentimentResult(null)
  }

  // Handle rating click
  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
    if (formErrors.rating) {
      setFormErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (formData.rating === 0) {
      errors.rating = 'Please select a rating'
    }
    
    if (!formData.comment.trim()) {
      errors.comment = 'Please enter your feedback'
    } else if (formData.comment.trim().length < 5) {
      errors.comment = 'Feedback must be at least 5 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    setSentimentResult(null)
    
    try {
      const response = await submitFeedback({
        user_id: user.id,
        rating: formData.rating,
        comment: formData.comment.trim()
      })
      
      if (response.success) {
        setSuccess('Feedback submitted successfully!')
        setSentimentResult(response.sentiment)
        
        // Add new feedback to list
        setFeedbacks(prev => [response.feedback, ...prev])
        
        // Reset form
        setFormData({ rating: 0, comment: '' })
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      } else {
        setError(response.message || 'Failed to submit feedback')
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Share Your Feedback</h2>
        <p>We value your opinion! Help us improve by sharing your experience.</p>
      </div>
      
      {/* Feedback Form Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Submit Feedback</h3>
          <span className="nav-user">User: {user?.name}</span>
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
          {/* Rating Field */}
          <div className="form-group">
            <label>
              Rating <span>*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rating-star ${
                    star <= (hoverRating || formData.rating) ? 'active' : ''
                  }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
              {formData.rating > 0 && (
                <span className="rating-value">{formData.rating}/5</span>
              )}
            </div>
            {formErrors.rating && (
              <div className="form-error">{formErrors.rating}</div>
            )}
          </div>
          
          {/* Comment Field */}
          <div className="form-group">
            <label htmlFor="comment">
              Your Feedback <span>*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              className={`form-control ${formErrors.comment ? 'error' : ''}`}
              placeholder="Tell us about your experience..."
              value={formData.comment}
              onChange={handleChange}
              disabled={loading}
              rows={4}
            />
            {formErrors.comment && (
              <div className="form-error">{formErrors.comment}</div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
        
        {/* Sentiment Result */}
        {sentimentResult && (
          <div className={`sentiment-result ${sentimentResult.toLowerCase()}`}>
            <div className="sentiment-icon">
              {getSentimentIcon(sentimentResult)}
            </div>
            <h3>Sentiment: {sentimentResult}</h3>
            <p>Our AI has analyzed your feedback and detected {sentimentResult.toLowerCase()} sentiment.</p>
          </div>
        )}
      </div>
      
      {/* Previous Feedbacks */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Your Previous Feedbacks</h3>
        </div>
        
        {loadingFeedbacks ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
            <p>Loading your feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="alert alert-info">
            <span>ℹ️</span>
            <span>You haven't submitted any feedback yet.</span>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-item">
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className="star"
                        style={{ 
                          color: i < feedback.rating ? '#f59e0b' : '#e2e8f0',
                          fontSize: '1rem'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="feedback-date">
                    {formatDate(feedback.created_at)}
                  </span>
                </div>
                <p className="feedback-comment">{feedback.comment}</p>
                <span className={`feedback-sentiment sentiment-${feedback.sentiment.toLowerCase()}`}>
                  {getSentimentIcon(feedback.sentiment)} {feedback.sentiment}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feedback
