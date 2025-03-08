import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000, // Reduced timeout to 10 seconds for faster failure detection
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry once if timeout or network failure occurs
    if ((error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        return await api(originalRequest);
      } catch (retryError) {
        window.location.reload(); // Reload page on failure
      }
    }

    // Handle unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
