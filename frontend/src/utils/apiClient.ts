import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiError, AuthHeaders } from '../types/api';
import { apiConfig } from './config';

// Use dynamic configuration from config utility
const API_CONFIG = {
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  retries: 3
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth headers and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication headers if available (future use)
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers.Authorization = authHeaders.Authorization;
    }
    if (authHeaders['X-API-Key']) {
      config.headers['X-API-Key'] = authHeaders['X-API-Key'];
    }

    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
        status: response.status
      });
    }

    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code
    };

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          apiError.message = data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          apiError.message = 'Authentication required. Please login.';
          break;
        case 403:
          apiError.message = 'Access forbidden. You don\'t have permission.';
          break;
        case 404:
          apiError.message = 'Service not found. Please try again later.';
          break;
        case 429:
          apiError.message = 'Too many requests. Please wait before trying again.';
          break;
        case 500:
          apiError.message = 'Server error. Please try again later.';
          break;
        case 503:
          apiError.message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          apiError.message = data?.message || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Network error - no response received
      if (error.code === 'ECONNABORTED') {
        apiError.message = 'Request timeout. Please check your connection and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        apiError.message = 'Network error. Please check your internet connection.';
      } else {
        apiError.message = 'Unable to connect to the server. Please try again.';
      }
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        url: error.config?.url,
        originalError: error
      });
    }

    // Return structured error
    return Promise.reject(apiError);
  }
);

// Authentication headers getter (future use)
function getAuthHeaders(): AuthHeaders {
  const authHeaders: AuthHeaders = {};
  
  // Get auth token from localStorage (future implementation)
  const token = localStorage.getItem('auth_token');
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  // Get API key from environment or localStorage (future implementation)
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) {
    authHeaders['X-API-Key'] = apiKey;
  }

  return authHeaders;
}

// Retry logic wrapper for failed requests
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = API_CONFIG.retries
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Don't retry for client errors (4xx) except 429 (rate limiting)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200 && response.data.status === 'healthy';
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}

export default apiClient;
export { API_CONFIG }; 