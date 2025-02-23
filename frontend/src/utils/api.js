import axios from 'axios';

const api = axios.create({
  baseURL: 'https://socialrisexbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 30000, // Increase timeout to 30 seconds
  // Enable request caching
  adapter: require('axios-cache-adapter').cache({
    maxAge: 15 * 60 * 1000 // Cache for 15 minutes
  })
});

// Add request interceptor for performance monitoring
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for performance monitoring
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
