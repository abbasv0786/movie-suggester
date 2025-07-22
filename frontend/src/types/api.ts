// API TypeScript interfaces for movie suggestion service

export interface SuggestionRequest {
  prompt: string;
  // lang parameter removed as per backend API changes
}

export interface MovieSuggestion {
  title: string;
  genre: string[];
  year: number;
  reason: string;
  description: string;
  // Enhanced fields from backend API v0.2.0
  content_type: 'movie' | 'series' | 'chat';
  // IMDB Integration fields (all nullable for chat responses)
  imdb_id?: string | null;
  imdb_rating?: number | null;
  imdb_title?: string | null;
  // Image fields
  poster_url?: string | null;
  // Series-specific fields
  seasons?: number;
  episodes?: number;
  end_year?: number;
  network?: string;
  status?: 'ongoing' | 'completed' | 'cancelled';
  // Runtime
  runtime?: number; // in minutes
}

export interface SuggestionResponse {
  suggestions: MovieSuggestion[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Request configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// Auth structure for future use
export interface AuthHeaders {
  Authorization?: string;
  'X-API-Key'?: string;
} 