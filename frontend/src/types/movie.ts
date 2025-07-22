import { MovieSuggestion } from './api';

// Extended movie types for rich display
export interface MovieCardData extends MovieSuggestion {
  posterUrl?: string;
  rating?: number;
  imdbId?: string;
  director?: string;
  cast?: string[];
  runtime?: number;
  budget?: number;
  boxOffice?: number;
}

// Movie card component props
export interface MovieCardProps {
  movie: MovieSuggestion;
  isLoading?: boolean;
  onExpand?: (movieTitle: string) => void;
  onPosterClick?: (movie: MovieSuggestion) => void;
  showExpandButton?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

// Movie card skeleton props
export interface MovieCardSkeletonProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

// Expandable section state
export interface ExpandableState {
  isExpanded: boolean;
  height: number;
}

// Image loading states
export type ImageLoadState = 'loading' | 'loaded' | 'error' | 'idle';

// Movie poster props
export interface MoviePosterProps {
  src?: string;
  alt: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  lazy?: boolean;
}

// Genre tag props
export interface GenreTagProps {
  genre: string;
  variant?: 'default' | 'small' | 'large';
  color?: 'auto' | 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

// Year badge props
export interface YearBadgeProps {
  year: number;
  className?: string;
}

// Rating display props
export interface RatingDisplayProps {
  rating?: number;
  maxRating?: number;
  showValue?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Movie utilities
export const movieUtils = {
  // Get decade from year
  getDecade: (year: number): string => {
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s`;
  },

  // Format runtime
  formatRuntime: (minutes?: number): string => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  },

  // Format budget/box office
  formatMoney: (amount?: number): string => {
    if (!amount) return 'Unknown';
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  },

  // Get genre color
  getGenreColor: (genre: string): string => {
    const colors: Record<string, string> = {
      'Action': '#dc2626',
      'Adventure': '#d97706',
      'Animation': '#7c3aed',
      'Comedy': '#059669',
      'Crime': '#1f2937',
      'Documentary': '#0891b2',
      'Drama': '#be123c',
      'Family': '#16a34a',
      'Fantasy': '#9333ea',
      'History': '#92400e',
      'Horror': '#991b1b',
      'Music': '#c026d3',
      'Mystery': '#374151',
      'Romance': '#e11d48',
      'Science Fiction': '#1e40af',
      'Thriller': '#7f1d1d',
      'War': '#6b7280',
      'Western': '#a16207',
    };
    
    return colors[genre] || '#6b7280';
  },

  // Truncate text
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Generate movie slug for potential URLs
  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
};

export default MovieCardProps; 