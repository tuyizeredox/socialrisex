import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 8000, // Timeout set to 8 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Retry once if timeout or network failure occurs
    if (!originalRequest._retry && (error.code === 'ECONNABORTED' || !error.response)) {
      originalRequest._retry = true;
      try {
        return await api(originalRequest);
      } catch (retryError) {
        // Optionally log the error to a monitoring service
        console.error('Retry failed:', retryError);
      }
    }

    // Handle unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect user to login page without reloading
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
