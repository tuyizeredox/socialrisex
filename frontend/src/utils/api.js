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
    // Optionally, show a loading indicator here
    document.body.classList.add('loading');
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Hide the loading indicator after a successful request
    document.body.classList.remove('loading');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    document.body.classList.remove('loading'); // Remove loading indicator

    // Retry once if timeout or network failure occurs
    if (!originalRequest._retry && (error.code === 'ECONNABORTED' || !error.response)) {
      originalRequest._retry = true;
      try {
        return await api(originalRequest);
      } catch (retryError) {
        alert('Request failed. Please reload the page and try again.');
        // Optionally show a custom modal or notification to the user
        setTimeout(() => window.location.reload(), 3000); // Reload after a brief wait
      }
    }

    // Handle unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.replace('/login'); // Full reload to clear session
    }

    return Promise.reject(error);
  }
);

export default api;
