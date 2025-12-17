import axios from 'axios';

// Configuration
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance with defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: Sleep for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Check if request should be retried
const shouldRetry = (error) => {
  // Retry on network errors
  if (!error.response) return true;
  
  // Retry on 5xx server errors
  if (error.response.status >= 500) return true;
  
  // Retry on 429 Too Many Requests
  if (error.response.status === 429) return true;
  
  // Don't retry on client errors (4xx except 429)
  return false;
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and retries
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.debug(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    config.retryCount = config.retryCount || 0;
    
    // Handle token expiry (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
      return Promise.reject({
        ...error,
        message: 'Session expired. Please login again.',
        isAuthError: true,
      });
    }
    
    // Retry logic
    if (shouldRetry(error) && config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;
      
      console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}): ${config.url}`);
      
      // Exponential backoff
      await sleep(RETRY_DELAY * config.retryCount);
      
      return api(config);
    }
    
    // Format error message
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'An unexpected error occurred';
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: config?.url,
        method: config?.method,
        status: error.response?.status,
        message: errorMessage,
      });
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

// Export configured instance
export default api;

// Export helper for manual retry
export const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
};