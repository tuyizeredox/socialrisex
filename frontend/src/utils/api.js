import axios from 'axios';

const api = axios.create({
  baseURL: 'https://socialrisexbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 30000 // 30 seconds timeout
});

// Add request interceptor with caching
api.interceptors.request.use(
  (config) => {
    // Add timestamp for performance monitoring
    config.metadata = { startTime: new Date() };
    
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add cache control for GET requests
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'max-age=900'; // 15 minutes
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor with performance monitoring
api.interceptors.response.use(
  (response) => {
    // Log request duration
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);

    // Cache successful GET responses in localStorage
    if (response.config.method === 'get') {
      const cacheKey = `api_cache_${response.config.url}`;
      const cacheData = {
        data: response.data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
