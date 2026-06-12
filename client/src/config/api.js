import axios from 'axios';
import perfMonitor from '../utils/performanceMonitor';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
});

// Simple in-memory cache with LRU eviction
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Prevent memory leaks

// Add request interceptor for caching and performance monitoring
api.interceptors.request.use((config) => {
  // Start performance timer
  config.metadata = { startTime: performance.now() };
  
  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Log cache hit
      const timer = perfMonitor.start(`API Cache Hit: ${config.url}`);
      if (timer) timer.end();
      console.log(`💾 Frontend Cache HIT: ${config.url}`);
      
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
    } else {
      // Log cache miss
      console.log(`❌ Frontend Cache MISS: ${config.url}`);
    }
  }
  return config;
});

// Add response interceptor to cache successful responses and log performance
api.interceptors.response.use((response) => {
  // Calculate request duration
  const duration = response.config.metadata 
    ? Math.round(performance.now() - response.config.metadata.startTime) 
    : 0;
  
  // Log API performance
  const url = response.config.url;
  const method = response.config.method.toUpperCase();
  const responseTime = response.headers['x-response-time'] || 'unknown';
  
  if (duration > 1000) {
    console.warn(`🐌 SLOW API: ${method} ${url} - Frontend: ${duration}ms, Backend: ${responseTime}`);
  } else if (duration > 500) {
    console.log(`⚠️ ${method} ${url} - Frontend: ${duration}ms, Backend: ${responseTime}`);
  } else {
    console.log(`✅ ${method} ${url} - Frontend: ${duration}ms, Backend: ${responseTime}`);
  }
  
  if (response.config.method === 'get' && response.status === 200) {
    const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
    
    // LRU eviction: remove oldest entry if at capacity
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      console.log(`🗑️ Frontend Cache EVICTION (${cache.size}/${MAX_CACHE_SIZE})`);
    }
    
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
    
    console.log(`✅ Frontend Cache STORED: ${response.config.url} (${cache.size}/${MAX_CACHE_SIZE})`);
  }
  return response;
});

export default api;
