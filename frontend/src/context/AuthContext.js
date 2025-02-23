import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Update this line
import api from '../utils/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  const showNotification = (message, severity) => {
    if (notification?.showNotification) {
      notification.showNotification(message, severity);
    } else {
      console.log(`${severity}: ${message}`);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token); // This should now work
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            await loadUser();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        showNotification('Registration successful!', 'success');
        return res.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      showNotification(message, 'error');
      throw new Error(message);
    }
  };
  // Add memoization for callbacks
  const login = useCallback(async (fullName, password) => {
    try {
      const res = await api.post('/auth/login', { fullName, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        showNotification('Login successful!', 'success');
        return res.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      showNotification(message, 'error');
      throw new Error(message);
    }
  }, [showNotification]);
  // Add useMemo for context value
  const contextValue = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    verifyEmail,
    forgotPassword,
    resetPassword
  }), [user, loading, register, login, logout, updateProfile, verifyEmail, forgotPassword, resetPassword]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};