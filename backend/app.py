"""
Flask Application - AI + React Screening Test
==============================================
Main Flask application with REST API endpoints for:
- User registration (Signup)
- User authentication (Signin)
- Feedback submission with sentiment analysis
- Admin dashboard with sentiment summary

Author: AI Screening Test
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from sentiment_model import sentiment_analyzer, initialize_model
from models import db, User, Feedback, init_db, get_sentiment_summary
import os

# Create Flask application
app = Flask(__name__)

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'screening_test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for frontend communication
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize database
init_db(app)

# Initialize sentiment model
initialize_model()


# ==================== HELPER FUNCTIONS ====================

def validate_signup_data(data):
    """
    Validate signup form data.
    
    Args:
        data: Dictionary containing name, email, and password
        
    Returns:
        Tuple (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Validate name
    if not name:
        return False, "Name is required"
    if len(name) < 2:
        return False, "Name must be at least 2 characters"
    if len(name) > 100:
        return False, "Name must be less than 100 characters"
    
    # Validate email
    if not email:
        return False, "Email is required"
    if '@' not in email or '.' not in email:
        return False, "Invalid email format"
    if len(email) > 120:
        return False, "Email must be less than 120 characters"
    
    # Validate password
    if not password:
        return False, "Password is required"
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    
    return True, None


def validate_login_data(data):
    """
    Validate login form data.
    
    Args:
        data: Dictionary containing email and password
        
    Returns:
        Tuple (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email:
        return False, "Email is required"
    if not password:
        return False, "Password is required"
    
    return True, None


def validate_feedback_data(data):
    """
    Validate feedback form data.
    
    Args:
        data: Dictionary containing user_id, rating, and comment
        
    Returns:
        Tuple (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"
    
    user_id = data.get('user_id')
    rating = data.get('rating')
    comment = data.get('comment', '').strip()
    
    # Validate user_id
    if not user_id:
        return False, "User ID is required"
    
    # Validate rating
    if rating is None:
        return False, "Rating is required"
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return False, "Rating must be between 1 and 5"
    except (ValueError, TypeError):
        return False, "Rating must be a number"
    
    # Validate comment
    if not comment:
        return False, "Comment is required"
    if len(comment) < 5:
        return False, "Comment must be at least 5 characters"
    if len(comment) > 1000:
        return False, "Comment must be less than 1000 characters"
    
    return True, None


# ==================== API ROUTES ====================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API health check."""
    return jsonify({
        'message': 'AI + React Screening Test API',
        'status': 'running',
        'endpoints': {
            'signup': 'POST /api/signup',
            'signin': 'POST /api/signin',
            'feedback': 'POST /api/feedback',
            'admin_login': 'POST /api/admin/login',
            'admin_feedbacks': 'GET /api/admin/feedbacks',
            'admin_summary': 'GET /api/admin/summary'
        }
    })


# ==================== USER AUTHENTICATION ====================

@app.route('/api/signup', methods=['POST'])
def signup():
    """
    User registration endpoint.
    
    Request Body:
        {
            "name": "User Name",
            "email": "user@example.com",
            "password": "password123"
        }
    
    Returns:
        Success: {"success": true, "message": "User registered successfully", "user": {...}}
        Error: {"success": false, "message": "Error message"}
    """
    try:
        data = request.get_json()
        
        # Validate input data
        is_valid, error = validate_signup_data(data)
        if not is_valid:
            return jsonify({'success': False, 'message': error}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Check for duplicate email
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered. Please use a different email.'
            }), 409
        
        # Create new user
        new_user = User(name=name, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully!',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500


@app.route('/api/signin', methods=['POST'])
def signin():
    """
    User login endpoint.
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    
    Returns:
        Success: {"success": true, "message": "Login successful", "user": {...}}
        Error: {"success": false, "message": "Error message"}
    """
    try:
        data = request.get_json()
        
        # Validate input data
        is_valid, error = validate_login_data(data)
        if not is_valid:
            return jsonify({'success': False, 'message': error}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Verify credentials
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found. Please check your email.'
            }), 404
        
        if user.password != password:
            return jsonify({
                'success': False,
                'message': 'Invalid password. Please try again.'
            }), 401
        
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}'
        }), 500


# ==================== FEEDBACK ====================

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """
    Submit user feedback with sentiment analysis.
    
    Request Body:
        {
            "user_id": 1,
            "rating": 5,
            "comment": "Great product! I love it."
        }
    
    Returns:
        Success: {"success": true, "message": "Feedback submitted", 
                  "sentiment": "Positive", "feedback": {...}}
        Error: {"success": false, "message": "Error message"}
    """
    try:
        data = request.get_json()
        
        # Validate input data
        is_valid, error = validate_feedback_data(data)
        if not is_valid:
            return jsonify({'success': False, 'message': error}), 400
        
        user_id = data['user_id']
        rating = int(data['rating'])
        comment = data['comment'].strip()
        
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found. Please login again.'
            }), 404
        
        # Analyze sentiment using AI model
        sentiment = sentiment_analyzer.predict(comment)
        
        # Create feedback entry
        feedback = Feedback(
            user_id=user_id,
            rating=rating,
            comment=comment,
            sentiment=sentiment
        )
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully!',
            'sentiment': sentiment,
            'feedback': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to submit feedback: {str(e)}'
        }), 500


@app.route('/api/feedback/user/<int:user_id>', methods=['GET'])
def get_user_feedbacks(user_id):
    """
    Get all feedbacks for a specific user.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        JSON list of feedback entries
    """
    try:
        feedbacks = Feedback.query.filter_by(user_id=user_id).order_by(
            Feedback.created_at.desc()
        ).all()
        
        return jsonify({
            'success': True,
            'feedbacks': [f.to_dict() for f in feedbacks]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch feedbacks: {str(e)}'
        }), 500


# ==================== ADMIN ====================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """
    Admin login endpoint with static credentials.
    
    Request Body:
        {
            "username": "admin",
            "password": "admin123"
        }
    
    Returns:
        Success: {"success": true, "message": "Admin login successful"}
        Error: {"success": false, "message": "Invalid credentials"}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Static admin credentials
        ADMIN_USERNAME = 'admin'
        ADMIN_PASSWORD = 'admin123'
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            return jsonify({
                'success': True,
                'message': 'Admin login successful!',
                'admin': True
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid admin credentials'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Admin login failed: {str(e)}'
        }), 500


@app.route('/api/admin/feedbacks', methods=['GET'])
def admin_get_feedbacks():
    """
    Get all user feedbacks for admin dashboard.
    
    Returns:
        JSON list of all feedback entries with user information
    """
    try:
        # Get all feedbacks with user information
        feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'count': len(feedbacks),
            'feedbacks': [f.to_dict() for f in feedbacks]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch feedbacks: {str(e)}'
        }), 500


@app.route('/api/admin/summary', methods=['GET'])
def admin_sentiment_summary():
    """
    Get sentiment analysis summary for admin dashboard.
    
    Returns:
        JSON with counts for Positive, Negative, Neutral sentiments
    """
    try:
        summary = get_sentiment_summary()
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch summary: {str(e)}'
        }), 500


@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """
    Get all registered users for admin dashboard.
    
    Returns:
        JSON list of all users (without passwords)
    """
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'count': len(users),
            'users': [u.to_dict() for u in users]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch users: {str(e)}'
        }), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'message': 'Resource not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500


# ==================== MAIN ====================

if __name__ == '__main__':
    print("=" * 60)
    print("AI + React Screening Test API Server")
    print("=" * 60)
    print("\nAPI Endpoints:")
    print("  POST /api/signup          - User registration")
    print("  POST /api/signin          - User login")
    print("  POST /api/feedback        - Submit feedback")
    print("  POST /api/admin/login     - Admin login")
    print("  GET  /api/admin/feedbacks - Get all feedbacks")
    print("  GET  /api/admin/summary   - Get sentiment summary")
    print("  GET  /api/admin/users     - Get all users")
    print("\n" + "=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
