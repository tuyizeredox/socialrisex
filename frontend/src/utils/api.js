import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000, // Increase timeout to 15 seconds to account for cold starts
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

// Add response interceptor with improved retry logic
api.interceptors.response.use(
  (response) => response, // Return response directly
  async (error) => {
    const originalRequest = error.config;

    // Retry logic for timeout or network errors
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0; // Initialize retry count
    }

    if (
      originalRequest._retryCount < 2 && // Allow up to 2 retries
      (error.code === 'ECONNABORTED' || !error.response) // Timeout or no response
    ) {
      originalRequest._retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000 * originalRequest._retryCount)); // Exponential backoff: 1s, 2s
      try {
        return await api(originalRequest);
      } catch (retryError) {
        console.error(`Retry ${originalRequest._retryCount} failed:`, retryError);
      }
    }

    // Handle unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

// Function to prefetch API (optional warmup)
export const warmupBackend = async () => {
  try {
    await api.get('/health'); // Replace with your backend's health check endpoint
    console.log('Backend warmed up successfully');
  } catch (error) {
    console.warn('Warmup failed:', error.message);
  }
};

export default api;
