import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { token } = useAuth()
  // TEMPORARY: Bypass auth for testing! Remove this when backend has auth!
  return <Outlet />
  // Original code:
  // if (!token) return <Navigate to="/login" replace />
  // return <Outlet />
}
