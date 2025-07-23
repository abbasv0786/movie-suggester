import { SuggestionRequest, SuggestionResponse, HealthResponse } from '../types/api';
import apiClient, { withRetry } from '../utils/apiClient';

// Movie Suggestion Service
export class MovieService {
  // Get movie suggestions (regular API)
  static async getSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
    // Validate request
    this.validateSuggestionRequest(request);

    return withRetry(async () => {
      const response = await apiClient.post<SuggestionResponse>('/suggest', request);
      
      // Validate response structure
      this.validateSuggestionResponse(response.data);
      
      return response.data;
    });
  }

  // Get movie suggestions with streaming (recommended for better UX)
  static async getSuggestionsStream(
    request: SuggestionRequest,
    onChunk?: (chunk: string) => void,
    onStatus?: (status: string) => void
  ): Promise<SuggestionResponse> {
    // Validate request
    this.validateSuggestionRequest(request);

    return new Promise((resolve, reject) => {
      // We'll use fetch with streaming instead of EventSource for POST
      this.handleStreamingRequest(request, onChunk, onStatus)
        .then(resolve)
        .catch(reject);
    });
  }

  // Handle streaming request with fetch
  private static async handleStreamingRequest(
    request: SuggestionRequest,
    onChunk?: (chunk: string) => void,
    onStatus?: (status: string) => void
  ): Promise<SuggestionResponse> {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000';
    const url = `${baseURL}/suggest/stream`;
    
    console.log('🚀 Starting streaming request to:', url);
    console.log('📝 Request payload:', request);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalResult: SuggestionResponse | null = null;
      let buffer = '';

      console.log('🎬 Starting to read streaming response...');

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ Streaming completed');
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6); // Remove 'data: ' prefix
                console.log('📦 Received SSE data:', jsonData);
                
                const data = JSON.parse(jsonData);
                
                // Handle different types of SSE data
                if (data.chunk && onChunk) {
                  onChunk(data.chunk);
                }
                
                if (data.status && onStatus) {
                  onStatus(data.status);
                }
                
                if (data.final_result) {
                  console.log('🎯 Received final result:', data.final_result);
                  finalResult = data.final_result;
                }
                
                if (data.complete && finalResult) {
                  console.log('✅ Streaming complete with final result');
                  this.validateSuggestionResponse(finalResult);
                  return finalResult;
                }
                
              } catch (parseError) {
                console.warn('❌ Failed to parse SSE data:', line, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (finalResult) {
        this.validateSuggestionResponse(finalResult);
        return finalResult;
      }

      throw new Error('Streaming completed without final result');
      
    } catch (error) {
      console.error('❌ Streaming request failed:', error);
      throw error;
    }
  }

  // Check API health
  static async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  }

  // Validate suggestion request payload (lang parameter removed)
  private static validateSuggestionRequest(request: SuggestionRequest): void {
    if (!request.prompt || typeof request.prompt !== 'string') {
      throw new Error('Prompt is required and must be a string');
    }

    if (request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (request.prompt.length > 2000) {
      throw new Error('Prompt must be less than 2000 characters');
    }
  }

  // Validate suggestion response structure (updated for new fields)
  private static validateSuggestionResponse(response: any): void {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format');
    }

    if (!Array.isArray(response.suggestions)) {
      throw new Error('Response must contain suggestions array');
    }

    // Validate each suggestion
    response.suggestions.forEach((suggestion: any, index: number) => {
      if (!suggestion || typeof suggestion !== 'object') {
        throw new Error(`Invalid suggestion at index ${index}`);
      }

      if (!suggestion.title || typeof suggestion.title !== 'string') {
        throw new Error(`Suggestion at index ${index} missing valid title`);
      }

      if (!Array.isArray(suggestion.genre)) {
        throw new Error(`Suggestion at index ${index} missing valid genre array`);
      }

      if (typeof suggestion.year !== 'number' || suggestion.year < 1800 || suggestion.year > new Date().getFullYear() + 10) {
        throw new Error(`Suggestion at index ${index} has invalid year`);
      }

      if (!suggestion.reason || typeof suggestion.reason !== 'string') {
        throw new Error(`Suggestion at index ${index} missing valid reason`);
      }

      if (!suggestion.description || typeof suggestion.description !== 'string') {
        throw new Error(`Suggestion at index ${index} missing valid description`);
      }

      // Validate content_type (required field)
      if (!suggestion.content_type || !['movie', 'series', 'chat'].includes(suggestion.content_type)) {
        throw new Error(`Suggestion at index ${index} has invalid content_type`);
      }

      // IMDB fields are optional and can be null
      if (suggestion.imdb_rating !== null && suggestion.imdb_rating !== undefined) {
        if (typeof suggestion.imdb_rating !== 'number' || suggestion.imdb_rating < 0 || suggestion.imdb_rating > 10) {
          throw new Error(`Suggestion at index ${index} has invalid IMDB rating`);
        }
      }
    });
  }

  // Format suggestion request (simplified - no language parameter)
  static formatSuggestionRequest(prompt: string): SuggestionRequest {
    return {
      prompt: prompt.trim(),
    };
  }

  // Check if response contains conversational content
  static isConversationalResponse(response: SuggestionResponse): boolean {
    return response.suggestions.some(suggestion => 
      suggestion.genre.includes('conversation') || 
      suggestion.content_type === 'chat' ||
      suggestion.title === 'Chat Response'
    );
  }

  // Check if response contains movie/series suggestions
  static hasMovieSuggestions(response: SuggestionResponse): boolean {
    return response.suggestions.some(suggestion => 
      suggestion.content_type === 'movie' || suggestion.content_type === 'series'
    );
  }

  // Extract movie titles from suggestions (excluding chat responses)
  static extractMovieTitles(response: SuggestionResponse): string[] {
    return response.suggestions
      .filter(suggestion => suggestion.content_type !== 'chat')
      .map(suggestion => suggestion.title);
  }

  // Filter suggestions by content type
  static filterByContentType(response: SuggestionResponse, contentType: 'movie' | 'series' | 'chat'): SuggestionResponse {
    const filteredSuggestions = response.suggestions.filter(suggestion =>
      suggestion.content_type === contentType
    );

    return {
      suggestions: filteredSuggestions,
    };
  }

  // Filter suggestions by genre
  static filterByGenre(response: SuggestionResponse, targetGenre: string): SuggestionResponse {
    const filteredSuggestions = response.suggestions.filter(suggestion =>
      suggestion.genre.some(genre => 
        genre.toLowerCase().includes(targetGenre.toLowerCase())
      )
    );

    return {
      suggestions: filteredSuggestions,
    };
  }

  // Sort suggestions by year
  static sortByYear(response: SuggestionResponse, ascending: boolean = false): SuggestionResponse {
    const sortedSuggestions = [...response.suggestions].sort((a, b) =>
      ascending ? a.year - b.year : b.year - a.year
    );

    return {
      suggestions: sortedSuggestions,
    };
  }

  // Sort suggestions by IMDB rating (excluding chat responses)
  static sortByRating(response: SuggestionResponse, ascending: boolean = false): SuggestionResponse {
    const sortedSuggestions = [...response.suggestions].sort((a, b) => {
      // Chat responses go to end
      if (a.content_type === 'chat' && b.content_type !== 'chat') return 1;
      if (b.content_type === 'chat' && a.content_type !== 'chat') return -1;
      if (a.content_type === 'chat' && b.content_type === 'chat') return 0;

      const ratingA = a.imdb_rating || 0;
      const ratingB = b.imdb_rating || 0;
      
      return ascending ? ratingA - ratingB : ratingB - ratingA;
    });

    return {
      suggestions: sortedSuggestions,
    };
  }

  // Get unique genres from suggestions
  static getUniqueGenres(response: SuggestionResponse): string[] {
    const allGenres = response.suggestions.flatMap(suggestion => suggestion.genre);
    return [...new Set(allGenres)].sort();
  }

  // Check if suggestions contain a specific movie
  static containsMovie(response: SuggestionResponse, movieTitle: string): boolean {
    return response.suggestions.some(suggestion =>
      suggestion.title.toLowerCase().includes(movieTitle.toLowerCase())
    );
  }

  // Get suggestion summary (updated for mixed content types)
  static getSummary(response: SuggestionResponse): string {
    const count = response.suggestions.length;
    const movieCount = response.suggestions.filter(s => s.content_type === 'movie').length;
    const seriesCount = response.suggestions.filter(s => s.content_type === 'series').length;
    const chatCount = response.suggestions.filter(s => s.content_type === 'chat').length;

    if (chatCount > 0 && (movieCount > 0 || seriesCount > 0)) {
      return `Mixed response: ${chatCount} conversation + ${movieCount + seriesCount} suggestions`;
    } else if (chatCount > 0) {
      return `Conversational response`;
    } else {
      const genres = this.getUniqueGenres(response);
      const years = response.suggestions.map(s => s.year);
      const yearRange = years.length > 1 ? `${Math.min(...years)}-${Math.max(...years)}` : years[0]?.toString();
      
      return `${count} suggestions (${movieCount} movies, ${seriesCount} series) across ${genres.length} genres (${yearRange})`;
    }
  }
}

// Utility functions for working with movie data
export const movieUtils = {
  // Truncate movie description
  truncateDescription: (description: string, maxLength: number = 150): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  },

  // Format genre list
  formatGenres: (genres: string[]): string => {
    if (genres.length === 0) return 'Unknown';
    if (genres.length === 1) return genres[0];
    if (genres.length === 2) return genres.join(' & ');
    return `${genres.slice(0, -1).join(', ')} & ${genres[genres.length - 1]}`;
  },

  // Get decade from year
  getDecade: (year: number): string => {
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s`;
  },

  // Format movie rating (if available in future)
  formatRating: (rating: number): string => {
    return `${rating.toFixed(1)}/10`;
  },

  // Generate movie URL slug
  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
};

export default MovieService; 