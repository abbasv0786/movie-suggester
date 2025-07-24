// Environment configuration for API endpoints

/// <reference types="vite/client" />

interface ApiConfig {
  baseURL: string;
  timeout: number;
  useProxy: boolean;
  allowedOrigins: string[];
  isDevelopment: boolean;
  isProduction: boolean;
}

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration based on environment
export const apiConfig: ApiConfig = {
  // Base URL for API calls
  baseURL: isDevelopment 
    ? (import.meta.env.VITE_USE_PROXY === 'true' ? '/api' : import.meta.env.VITE_API_URL || 'http://localhost:8000')
    : import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Request timeout (30 seconds)
  timeout: 30000,
  
  // Whether to use Vite dev proxy
  useProxy: isDevelopment && import.meta.env.VITE_USE_PROXY === 'true',
  
  // Allowed origins for CORS
  allowedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
  ],
  
  // Environment flags
  isDevelopment,
  isProduction,
};

// CORS Configuration
export const corsConfig = {
  // Check if origin is allowed
  isAllowedOrigin: (origin: string): boolean => {
    return apiConfig.allowedOrigins.includes(origin) || 
           origin.startsWith('http://localhost:') ||
           origin.startsWith('https://localhost:');
  },
  
  // Get CORS headers for requests
  getHeaders: (additionalHeaders: Record<string, string> = {}) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  }),
  
  // Check if CORS is properly configured
  checkCorsSupport: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${apiConfig.baseURL}/health`, {
        method: 'GET',
        headers: corsConfig.getHeaders(),
        mode: 'cors',
      });
      return response.ok;
    } catch (error) {
      console.warn('CORS check failed:', error);
      return false;
    }
  },
};

// Development utilities
export const devUtils = {
  // Log API configuration in development
  logConfig: () => {
    if (isDevelopment) {
      console.group('🔧 API Configuration');
      console.log('Base URL:', apiConfig.baseURL);
      console.log('Use Proxy:', apiConfig.useProxy);
      console.log('Timeout:', apiConfig.timeout);
      console.log('Environment:', isDevelopment ? 'Development' : 'Production');
      console.groupEnd();
    }
  },
  
  // Test API connectivity
  testConnectivity: async (): Promise<{
    health: boolean;
    cors: boolean;
    latency: number;
  }> => {
    const startTime = Date.now();
    
    try {
      const [healthOk, corsOk] = await Promise.all([
        fetch(`${apiConfig.baseURL}/health`).then(r => r.ok),
        corsConfig.checkCorsSupport(),
      ]);
      
      const latency = Date.now() - startTime;
      
      return {
        health: healthOk,
        cors: corsOk,
        latency,
      };
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return {
        health: false,
        cors: false,
        latency: Date.now() - startTime,
      };
    }
  },
  
  // Enable debug mode for API calls
  enableApiDebugging: () => {
    if (isDevelopment) {
      // Add API request/response logging
      console.log('🔍 API debugging enabled');
      return true;
    }
    return false;
  },
};

// Validate environment configuration
export const validateConfig = (): string[] => {
  const issues: string[] = [];
  
  if (!apiConfig.baseURL) {
    issues.push('API base URL is not configured');
  }
  
  if (apiConfig.timeout < 5000) {
    issues.push('API timeout is too low (minimum 5000ms recommended)');
  }
  
  if (isProduction && apiConfig.baseURL.includes('localhost')) {
    issues.push('Production build using localhost API URL');
  }
  
  if (isDevelopment) {
    console.group('⚠️ Configuration Validation');
    if (issues.length === 0) {
      console.log('✅ All configuration checks passed');
    } else {
      issues.forEach(issue => console.warn('❌', issue));
    }
    console.groupEnd();
  }
  
  return issues;
};

// Initialize configuration
if (isDevelopment) {
  devUtils.logConfig();
  validateConfig();
}

export default apiConfig; 