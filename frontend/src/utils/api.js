import axios from 'axios';

const api = axios.create({
  baseURL: 'https://socialrisexbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  // Add caching headers
  headers: {
    'Cache-Control': 'max-age=3600',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add response caching
const cache = new Map();

api.interceptors.request.use(
  async config => {
    const cacheKey = `${config.method}:${config.url}`;
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse && config.method === 'get') {
      return Promise.resolve(cachedResponse);
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => {
    const cacheKey = `${response.config.method}:${response.config.url}`;
    if (response.config.method === 'get') {
      cache.set(cacheKey, response);
    }
    return response;
  },
  error => Promise.reject(error)
);

export default api;
