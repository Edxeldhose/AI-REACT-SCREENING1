# AI + React Screening Test

A full-stack application with Flask backend and React frontend featuring AI-powered sentiment analysis.

 📁 Project Structure

```
ai-react-screening/
│
├── backend/
│   ├── app.py                 # Main Flask application with API routes
│   ├── models.py              # Database models (User, Feedback)
│   ├── sentiment_model.py     # AI sentiment analysis model
│   ├── requirements.txt       # Python dependencies
│   └── screening_test.db      # SQLite database (auto-created)
│
└── frontend/
    ├── package.json           # Node.js dependencies
    ├── vite.config.js         # Vite configuration
    ├── index.html             # Entry HTML file
    │
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Main App component with routes
        ├── App.css            # Global styles
        │
        ├── pages/
        │   ├── Signup.jsx     # User registration page
        │   ├── Login.jsx      # User login page
        │   ├── Feedback.jsx   # Feedback submission page
        │   └── AdminDashboard.jsx  # Admin dashboard page
        │
        ├── components/
        │   └── Navbar.jsx     # Navigation bar
        │
        └── services/
            └── api.js         # Axios API service
```

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary Key (Auto-increment) |
| name | VARCHAR(100) | User's full name |
| email | VARCHAR(120) | User's email (Unique) |
| password | VARCHAR(255) | User's password |
| created_at | DATETIME | Account creation timestamp |

### Feedbacks Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary Key (Auto-increment) |
| user_id | INTEGER | Foreign Key (Users.id) |
| rating | INTEGER | Rating (1-5) |
| comment | TEXT | Feedback comment |
| sentiment | VARCHAR(20) | Predicted sentiment |
| created_at | DATETIME | Submission timestamp |

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | User registration |
| `/api/signin` | POST | User login |
| `/api/feedback` | POST | Submit feedback |
| `/api/feedback/user/:id` | GET | Get user's feedbacks |
| `/api/admin/login` | POST | Admin login |
| `/api/admin/feedbacks` | GET | Get all feedbacks |
| `/api/admin/summary` | GET | Get sentiment summary |
| `/api/admin/users` | GET | Get all users |

## 🚀 Installation & Running Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🧪 Testing the Application

### 1. User Registration (Signup)
- Navigate to `http://localhost:3000`
- Click "Sign Up"
- Fill in the form:
  - Name: John Doe
  - Email: john@example.com
  - Password: password123
- Submit to create account

### 2. User Login
- After signup, you'll be redirected to login
- Enter credentials:
  - Email: john@example.com
  - Password: password123
- Successful login redirects to Feedback page

### 3. Submit Feedback
- Select a rating (1-5 stars)
- Enter a comment
- Submit feedback
- View AI-predicted sentiment result

### 4. Admin Dashboard
- Navigate to `/admin`
- Login with credentials:
  - Username: `admin`
  - Password: `admin123`
- View dashboard with:
  - Total feedbacks count
  - Sentiment breakdown (Positive, Negative, Neutral)
  - All user feedbacks table

## 🤖 AI Sentiment Analysis

The sentiment analysis model uses:
- **CountVectorizer** for text feature extraction
- **Multinomial Naive Bayes** classifier
- Trained on sample dataset with Positive, Negative, Neutral labels

### Sample Training Data Examples:
- **Positive**: "I love this product! It's amazing."
- **Negative**: "Terrible experience! Complete waste of money."
- **Neutral**: "The product is okay, nothing special."

## 📝 Sample Test Data

### Test Users
```json
[
  {"name": "John Doe", "email": "john@example.com", "password": "password123"},
  {"name": "Jane Smith", "email": "jane@example.com", "password": "password123"},
  {"name": "Bob Wilson", "email": "bob@example.com", "password": "password123"}
]
```

### Test Feedbacks
```json
[
  {"rating": 5, "comment": "Excellent service! Very satisfied with my experience."},
  {"rating": 2, "comment": "Terrible experience! Complete waste of money."},
  {"rating": 3, "comment": "The product is okay, nothing special."},
  {"rating": 4, "comment": "Great quality and fast delivery. Recommended!"},
  {"rating": 1, "comment": "Awful! Don't buy this, it's a scam."}
]
```

## 🔧 Configuration

### Backend (app.py)
- Database: SQLite (`screening_test.db`)
- CORS: Enabled for all origins
- Port: 5000 (default)

### Frontend (vite.config.js)
- Port: 3000
- Proxy: `/api` → `http://localhost:5000`

## 🛠️ Technologies Used

### Backend
- Flask 3.0
- Flask-CORS
- Flask-SQLAlchemy
- SQLite
- scikit-learn
- NumPy

### Frontend
- React 18
- React Router DOM
- Axios
- Vite

## 📸 Screenshots Description

1. **Signup Page**: Clean registration form with validation
2. **Login Page**: Simple authentication form
3. **Feedback Page**: Star rating system with comment textarea, displays sentiment result
4. **Admin Dashboard**: Statistics cards, feedback table, sentiment percentage breakdown

## 🔒 Security Notes

⚠️ **For Production Use:**
- Implement password hashing (bcrypt)
- Add JWT/session-based authentication
- Implement proper CORS restrictions
- Add input sanitization
- Use environment variables for secrets
- Add rate limiting

## 📄 License

This project is created for screening test purposes.

---

**Author**: AI Screening Test
**Version**: 1.0.0
