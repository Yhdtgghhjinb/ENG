import axios from 'axios';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
});

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add request interceptor for caching
api.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached data
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config,
        });
      };
    }
  }
  return config;
});

// Add response interceptor to cache successful responses
api.interceptors.response.use((response) => {
  if (response.config.method === 'get' && response.status === 200) {
    const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
  }
  return response;
});

export default api;
