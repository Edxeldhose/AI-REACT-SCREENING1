/**
 * Navbar Component
 * Navigation bar with links and user info
 */

import { Link, useLocation } from 'react-router-dom'

function Navbar({ user, isAdmin, onLogout }) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🤖 AI Screening</h1>
        <span>Sentiment Analysis</span>
      </div>
      
      <div className="navbar-links">
        {/* Public Links */}
        {!user && !isAdmin && (
          <>
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}
            >
              Sign Up
            </Link>
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin
            </Link>
          </>
        )}
        
        {/* User Links */}
        {user && !isAdmin && (
          <>
            <Link 
              to="/feedback" 
              className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`}
            >
              Feedback
            </Link>
          </>
        )}
        
        {/* Admin Links */}
        {isAdmin && (
          <>
            <Link 
              to="/admin/dashboard" 
              className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </>
        )}
        
        {/* User Info & Logout */}
        {(user || isAdmin) && (
          <div className="nav-user">
            {user && <span>Welcome, {user.name}!</span>}
            {isAdmin && !user && <span>Admin Mode</span>}
            <button 
              className="btn btn-secondary btn-small" 
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
