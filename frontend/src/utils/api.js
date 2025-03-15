import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000, // Reduced from 15s to 5s for faster failure detection
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // Prevent caching issues
  },
  // Optimize performance
  transitional: {
    silentJSONParsing: true, // Faster JSON parsing
    forcedJSONParsing: false, // Skip parsing for non-JSON responses
  },
});

// Lightweight request interceptor (runs synchronously)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optimized response interceptor with fast retry and reload
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Initialize retry count if not present
    config._retryCount = config._retryCount || 0;

    // Fast retry logic for network issues
    if (
      config._retryCount < 2 && 
      (error.code === 'ECONNABORTED' || !error.response)
    ) {
      config._retryCount++;
      // Linear backoff: 500ms, 1000ms (faster than exponential)
      await new Promise((resolve) => setTimeout(resolve, 500 * config._retryCount));
      return api(config);
    }

    // Handle 401 immediately
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.assign('/login');
      return Promise.reject(error);
    }

    // Auto-reload after persistent failure
    if (config._retryCount >= 2) {
      const errorMessage = 'Network error: Please check your connection';
      console.error(errorMessage, error);
      
      // Show error to user and reload
      if (!document.getElementById('error-toast')) {
        const toast = document.createElement('div');
        toast.id = 'error-toast';
        toast.style.cssText = 'position: fixed; bottom: 20px; left: 20px; padding: 10px; background: #ff4444; color: white; z-index: 1000;';
        toast.textContent = errorMessage + ' - Reloading in 3 seconds...';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          document.body.removeChild(toast);
          window.location.reload();
        }, 3000);
      }
    }

    return Promise.reject(error);
  }
);

// Optimized warmup with minimal overhead
export const warmupBackend = () => {
  api.get('/health', { timeout: 2000 })
    .then(() => console.log('Backend warmed up'))
    .catch((error) => console.warn('Warmup failed:', error.message));
};

export default api;
