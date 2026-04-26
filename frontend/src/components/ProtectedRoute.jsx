import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: loc }} replace />
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />
  return children
}
