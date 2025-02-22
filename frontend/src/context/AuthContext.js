import { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
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
          const decoded = jwt_decode(token);
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

  const login = async (fullName, password) => {
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
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showNotification('Logged out successfully', 'success');
  };

  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/users/profile', userData);
      setUser(res.data);
      showNotification('Profile updated successfully', 'success');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      showNotification(message, 'error');
      throw new Error(message);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const res = await api.post('/auth/verify-email', { token });
      showNotification('Email verified successfully', 'success');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Email verification failed';
      showNotification(message, 'error');
      throw new Error(message);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      showNotification('Password reset email sent', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      showNotification(message, 'error');
      throw new Error(message);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      showNotification('Password reset successful', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed';
      showNotification(message, 'error');
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        verifyEmail,
        forgotPassword,
        resetPassword
      }}
    >
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