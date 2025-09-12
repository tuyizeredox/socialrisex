import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error.response?.data || error);
    }
    
    // Handle network errors with retry logic
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      // Wait 1 second and retry once for network errors
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    
    // Provide better error messages for API failures
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Network error occurred. Please check your connection.';
    
    return Promise.reject({
      ...error.response?.data,
      message: errorMessage,
      status: error.response?.status
    });
  }
);

export default api;
