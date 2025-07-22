import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuggestionRequest, SuggestionResponse, HealthResponse, ApiError } from '../types/api';
import { queryKeys, handleQueryError } from '../utils/queryClient';
import apiClient, { withRetry, checkApiHealth } from '../utils/apiClient';

// Hook for movie suggestions
export function useSuggestMovies(request: SuggestionRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.suggestions.byPrompt(request.prompt, request.lang),
    queryFn: async (): Promise<SuggestionResponse> => {
      return withRetry(async () => {
        const response = await apiClient.post<SuggestionResponse>('/suggest', request);
        return response.data;
      });
    },
    enabled: enabled && !!request.prompt.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for client errors (4xx) except 429 (rate limiting)
      if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for sending movie suggestion requests (mutation)
export function useSendSuggestionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SuggestionRequest): Promise<SuggestionResponse> => {
      return withRetry(async () => {
        const response = await apiClient.post<SuggestionResponse>('/suggest', request);
        return response.data;
      });
    },
    onSuccess: (data, variables) => {
      // Cache the result for future queries
      queryClient.setQueryData(
        queryKeys.suggestions.byPrompt(variables.prompt, variables.lang),
        data
      );
    },
    onError: (error: ApiError) => {
      console.error('Movie suggestion request failed:', error);
    },
  });
}

// Hook for API health check
export function useApiHealth(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async (): Promise<HealthResponse> => {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Only 2 retries for health checks
    retryDelay: 1000, // 1 second delay
  });
}

// Hook for checking if API is available
export function useApiStatus() {
  return useQuery({
    queryKey: ['api-status'],
    queryFn: checkApiHealth,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 2000,
  });
}

// Custom hook for managing suggestion request state
export function useSuggestionState() {
  const queryClient = useQueryClient();

  const clearSuggestions = () => {
    queryClient.removeQueries({
      queryKey: queryKeys.suggestions.all,
    });
  };

  const prefetchSuggestion = (request: SuggestionRequest) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.suggestions.byPrompt(request.prompt, request.lang),
      queryFn: async () => {
        return withRetry(async () => {
          const response = await apiClient.post<SuggestionResponse>('/suggest', request);
          return response.data;
        });
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const getSuggestionFromCache = (request: SuggestionRequest): SuggestionResponse | undefined => {
    return queryClient.getQueryData(
      queryKeys.suggestions.byPrompt(request.prompt, request.lang)
    );
  };

  return {
    clearSuggestions,
    prefetchSuggestion,
    getSuggestionFromCache,
  };
}

// Hook for error handling and retry logic
export function useApiError() {
  const handleError = (error: unknown): ApiError => {
    return handleQueryError(error);
  };

  const isNetworkError = (error: ApiError): boolean => {
    return !error.status || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
  };

  const isRetryableError = (error: ApiError): boolean => {
    // Retry on network errors or 5xx server errors or 429 rate limiting
    return isNetworkError(error) || 
           (error.status !== undefined && error.status >= 500) ||
           error.status === 429;
  };

  return {
    handleError,
    isNetworkError,
    isRetryableError,
  };
} 