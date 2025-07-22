/**
 * Image handling utilities for movie posters and fallbacks
 */

// Image loading states
export type ImageLoadingState = 'loading' | 'loaded' | 'error' | 'idle';

// Image dimensions for different poster sizes
export interface ImageDimensions {
  width: number;
  height: number;
}

// Poster size presets
export const POSTER_SIZES = {
  small: { width: 80, height: 120 },
  medium: { width: 100, height: 150 },
  large: { width: 140, height: 210 },
  xlarge: { width: 180, height: 270 }
} as const;

export type PosterSize = keyof typeof POSTER_SIZES;

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Preloads an image and returns a promise
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    img.src = src;
  });
};

/**
 * Gets optimized image dimensions for responsive display
 */
export const getResponsiveDimensions = (
  originalSize: PosterSize,
  containerWidth: number
): ImageDimensions => {
  const baseSize = POSTER_SIZES[originalSize];
  const aspectRatio = baseSize.height / baseSize.width;
  
  // Scale down if container is smaller
  if (containerWidth < baseSize.width) {
    return {
      width: containerWidth,
      height: containerWidth * aspectRatio
    };
  }
  
  return baseSize;
};

/**
 * Generates a placeholder image URL with specified dimensions and text
 */
export const generatePlaceholderUrl = (
  width: number,
  height: number,
  text?: string
): string => {
  const encodedText = encodeURIComponent(text || 'No Image');
  return `https://via.placeholder.com/${width}x${height}/667eea/ffffff?text=${encodedText}`;
};

/**
 * Extracts movie title from IMDB poster URL for better alt text
 */
export const getImageAltText = (
  title: string,
  imdbTitle?: string | null,
  contentType?: 'movie' | 'series' | 'chat'
): string => {
  const displayTitle = imdbTitle || title;
  const contentTypeText = contentType === 'series' ? 'TV Series' : 'Movie';
  
  if (contentType === 'chat') {
    return 'Chat response';
  }
  
  return `${displayTitle} ${contentTypeText} poster`;
};

/**
 * Optimizes IMDB image URL for better loading performance
 */
export const optimizeImdbImageUrl = (
  url: string | null | undefined,
  targetWidth: number = 300
): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  if (!url.includes('media-amazon.com')) {
    return url;
  }
  
  try {
    // IMDB images can be resized by modifying the URL
    // Replace the dimensions in the URL with our target size
    const optimizedUrl = url.replace(
      /\._V1_.*?\.jpg$/,
      `._V1_UX${targetWidth}_CR0,0,${targetWidth},${Math.round(targetWidth * 1.5)}_AL_.jpg`
    );
    
    return optimizedUrl;
  } catch (error) {
    console.warn('Failed to optimize IMDB image URL:', error);
    return url;
  }
};

/**
 * Image cache for preloaded images
 */
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Caches a loaded image for future use
 */
export const cacheImage = (src: string, img: HTMLImageElement): void => {
  if (imageCache.size > 50) {
    // Simple LRU: remove oldest entry
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  
  imageCache.set(src, img);
};

/**
 * Gets a cached image if available
 */
export const getCachedImage = (src: string): HTMLImageElement | null => {
  return imageCache.get(src) || null;
};

/**
 * Preloads multiple images with progress tracking
 */
export const preloadImages = async (
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<(HTMLImageElement | Error)[]> => {
  const results: (HTMLImageElement | Error)[] = [];
  let loaded = 0;
  
  const loadPromises = urls.map(async (url, index) => {
    try {
      const img = await preloadImage(url);
      cacheImage(url, img);
      results[index] = img;
    } catch (error) {
      results[index] = error as Error;
    } finally {
      loaded++;
      onProgress?.(loaded, urls.length);
    }
  });
  
  await Promise.allSettled(loadPromises);
  return results;
};

/**
 * Checks if the browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Image loading hook utilities
 */
export const createImageLoadingState = () => {
  return {
    loading: false,
    loaded: false,
    error: false,
    setLoading: (loading: boolean) => ({ loading, loaded: false, error: false }),
    setLoaded: () => ({ loading: false, loaded: true, error: false }),
    setError: () => ({ loading: false, loaded: false, error: true }),
  };
};

/**
 * Fallback image data URIs for different content types
 */
export const FALLBACK_IMAGES = {
  movie: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfj6c8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vdmllPC90ZXh0Pgo8L3N2Zz4K',
  
  series: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjA5M2ZiIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfk7o8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlcmllczwvdGV4dD4KPC9zdmc+Cg==',
  
  chat: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNGZhY2ZlIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkqw8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoYXQ8L3RleHQ+Cjwvc3ZnPgo='
} as const; 