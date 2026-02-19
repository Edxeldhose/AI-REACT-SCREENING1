/**
 * Protected Route Component
 * Guards routes that require authentication
 */

import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute - Redirects to login if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect to if not authenticated (default: '/login')
 */
function ProtectedRoute({ user, children, redirectTo = '/login' }) {
  // If no user is authenticated, redirect to login page
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }
  
  // User is authenticated, render the protected content
  return children
}

/**
 * AdminRoute - Redirects to admin login if user is not an admin
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether user has admin privileges
 * @param {React.ReactNode} props.children - Child components to render if admin
 * @param {string} props.redirectTo - Path to redirect to if not admin (default: '/admin')
 */
export function AdminRoute({ isAdmin, children, redirectTo = '/admin' }) {
  // If not an admin, redirect to admin login page
  if (!isAdmin) {
    return <Navigate to={redirectTo} replace />
  }
  
  // User is admin, render the protected content
  return children
}

/**
 * GuestRoute - Redirects authenticated users away from guest-only pages
 * Useful for login/signup pages that shouldn't be accessible after login
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @param {React.ReactNode} props.children - Child components to render if NOT authenticated
 * @param {string} props.redirectTo - Path to redirect to if authenticated (default: '/feedback')
 */
export function GuestRoute({ user, children, redirectTo = '/feedback' }) {
  // If user IS authenticated, redirect them away from guest pages
  if (user) {
    return <Navigate to={redirectTo} replace />
  }
  
  // User is a guest, render the guest-only content
  return children
}

export default ProtectedRoute
