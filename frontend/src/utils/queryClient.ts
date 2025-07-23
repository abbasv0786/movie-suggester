import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../types/api';

// TanStack Query Client Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for movie suggestions
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 30 minutes 
      gcTime: 30 * 60 * 1000,
      
      // Retry logic: 3 attempts with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry for client errors (4xx) except 429 (rate limiting)
        if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          return false;
        }
        
        // Maximum 3 retries
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (useful for real-time updates)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Background refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations on network errors only
      retry: (failureCount, error: any) => {
        // Only retry network errors, not API errors
        if (error?.status) {
          return false; // Don't retry API errors
        }
        return failureCount < 2; // Max 2 retries for network errors
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Health check
  health: ['health'] as const,
  
  // Movie suggestions
  suggestions: {
    all: ['suggestions'] as const,
    byPrompt: (prompt: string) => 
      ['suggestions', 'byPrompt', { prompt }] as const,
  },
  
  // User preferences (future use)
  user: {
    all: ['user'] as const,
    preferences: () => ['user', 'preferences'] as const,
  },
} as const;

// Error handler for queries
export function handleQueryError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }
  
  return {
    message: 'An unexpected error occurred',
    status: undefined,
    code: undefined,
  };
}

// Invalidate related queries helper
export function invalidateMovieQueries() {
  queryClient.invalidateQueries({
    queryKey: queryKeys.suggestions.all,
  });
}

// Clear all cached data
export function clearAllQueries() {
  queryClient.clear();
}

// Prefetch health check
export function prefetchHealthCheck() {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const { checkApiHealth } = await import('./apiClient');
      return checkApiHealth();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for health checks
  });
} 