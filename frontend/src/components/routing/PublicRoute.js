import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is authenticated, redirect based on role
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  // Allow access to public routes
  return children;
};

export default PublicRoute;