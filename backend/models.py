"""
Database Models Module
======================
Defines the database structure using Flask-SQLAlchemy.

Tables:
- User: Stores user registration information
- Feedback: Stores user feedback with sentiment analysis results
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy instance
db = SQLAlchemy()


class User(db.Model):
    """
    User model for storing user account information.
    
    Attributes:
        id: Primary key (auto-increment)
        name: User's full name
        email: User's email address (unique)
        password: User's password (should be hashed in production)
        created_at: Timestamp of account creation
        feedbacks: Relationship to user's feedback entries
    """
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to feedback
    feedbacks = db.relationship('Feedback', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, name, email, password):
        """Initialize a new User instance."""
        self.name = name
        self.email = email
        self.password = password
    
    def to_dict(self):
        """Convert user to dictionary (excluding password for security)."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """String representation of the User object."""
        return f'<User {self.name} ({self.email})>'


class Feedback(db.Model):
    """
    Feedback model for storing user feedback with sentiment analysis.
    
    Attributes:
        id: Primary key (auto-increment)
        user_id: Foreign key referencing the user
        rating: User's rating (1-5 scale)
        comment: User's feedback comment/text
        sentiment: Predicted sentiment from AI analysis
        created_at: Timestamp of feedback submission
    """
    
    __tablename__ = 'feedbacks'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False, default='Neutral')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, rating, comment, sentiment='Neutral'):
        """Initialize a new Feedback instance."""
        self.user_id = user_id
        self.rating = rating
        self.comment = comment
        self.sentiment = sentiment
    
    def to_dict(self):
        """Convert feedback to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'rating': self.rating,
            'comment': self.comment,
            'sentiment': self.sentiment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """String representation of the Feedback object."""
        return f'<Feedback by User {self.user_id}: Rating {self.rating}, Sentiment: {self.sentiment}>'


def init_db(app):
    """
    Initialize the database with the Flask app.
    Creates all tables if they don't exist.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")


def get_sentiment_summary():
    """
    Get a summary of sentiment counts from the feedback table.
    
    Returns:
        Dictionary with counts for each sentiment type
    """
    from sqlalchemy import func
    
    summary = db.session.query(
        Feedback.sentiment,
        func.count(Feedback.id).label('count')
    ).group_by(Feedback.sentiment).all()
    
    # Initialize default values
    result = {
        'Positive': 0,
        'Negative': 0,
        'Neutral': 0,
        'Total': 0
    }
    
    # Populate with actual counts
    for sentiment, count in summary:
        result[sentiment] = count
        result['Total'] += count
    
    return result
