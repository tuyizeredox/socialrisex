import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect them to the login page if not authenticated
    return <Navigate to="/login" />;
  }

  // If user is not activated and not already on the activate page, redirect to activate
  if (!user.isActive && location.pathname !== '/app/activate') {
    return <Navigate to="/app/activate" />;
  }

  return children;
};

export default PrivateRoute; 