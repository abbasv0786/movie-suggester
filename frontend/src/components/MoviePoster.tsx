import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MoviePosterProps, ImageLoadState } from '../types/movie';
import { getBestPosterUrl, ERROR_POSTER_URL, DEFAULT_POSTER_URL } from '../utils/imageUtils';

// Poster container
const PosterContainer = styled.div<{ 
  width?: string; 
  height?: string; 
  aspectRatio?: string;
  isClickable?: boolean;
}>`
  position: relative;
  width: ${props => props.width || '120px'};
  height: ${props => props.height || '180px'};
  aspect-ratio: ${props => props.aspectRatio || '2/3'};
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => props.isClickable && `
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  `}
  
  @media (max-width: 768px) {
    width: ${props => props.width ? `calc(${props.width} * 0.8)` : '96px'};
    height: ${props => props.height ? `calc(${props.height} * 0.8)` : '144px'};
  }
`;

// Movie poster image
const PosterImage = styled.img<{ loadState: ImageLoadState }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  transition: opacity 0.3s ease;
  
  opacity: ${props => props.loadState === 'loaded' ? 1 : 0};
  
  ${props => props.loadState === 'loading' && `
    opacity: 0;
  `}
  
  ${props => props.loadState === 'error' && `
    opacity: 0.7;
  `}
`;

// Loading overlay
const LoadingOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(247, 250, 252, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

// Loading spinner
const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error overlay
const ErrorOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(254, 215, 215, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  padding: 8px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 18px;
  margin-bottom: 4px;
  color: #c53030;
`;

const ErrorText = styled.div`
  font-size: 10px;
  color: #c53030;
  font-weight: 500;
`;

// Fallback content when no image is available
const FallbackContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  height: 100%;
  color: #718096;
`;

const FallbackIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
`;

const FallbackText = styled.div`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const FallbackSubtext = styled.div`
  font-size: 10px;
  opacity: 0.8;
`;

export const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  alt,
  title,
  className,
  onLoad,
  onError,
  onClick,
  lazy = true
}) => {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup lazy loading
  useEffect(() => {
    if (!lazy || !imageRef.current) return;

    // Create intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.current) {
            setCurrentSrc(src);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current && imageRef.current) {
      observerRef.current.observe(imageRef.current);
    }

    return () => {
      if (observerRef.current && imageRef.current) {
        observerRef.current.unobserve(imageRef.current);
      }
    };
  }, [lazy]);

  // Handle src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      if (src) {
        setLoadState('loading');
      }
    }
  }, [src, currentSrc]);

  // Handle image loading
  const handleImageLoad = () => {
    setLoadState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setLoadState('error');
    onError?.();
    
    // Try fallback images
    if (currentSrc && currentSrc !== ERROR_POSTER_URL && currentSrc !== DEFAULT_POSTER_URL) {
      setCurrentSrc(DEFAULT_POSTER_URL);
      setLoadState('loading');
    }
  };

  // Handle poster click
  const handleClick = () => {
    if (onClick && loadState !== 'loading') {
      onClick();
    }
  };

  // Determine what to display
  const shouldShowImage = currentSrc && currentSrc !== DEFAULT_POSTER_URL;
  const shouldShowFallback = !currentSrc || loadState === 'error' || currentSrc === DEFAULT_POSTER_URL;
  const shouldShowLoading = loadState === 'loading' && shouldShowImage;
  const shouldShowError = loadState === 'error' && shouldShowImage;

  return (
    <PosterContainer 
      className={className}
      isClickable={!!onClick}
      onClick={handleClick}
    >
      {shouldShowImage && (
        <PosterImage
          ref={imageRef}
          src={lazy ? undefined : currentSrc}
          data-src={lazy ? currentSrc : undefined}
          alt={alt}
          title={title}
          loadState={loadState}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}
      
      {shouldShowFallback && (
        <FallbackContent>
          <FallbackIcon>🎬</FallbackIcon>
          <FallbackText>No Poster</FallbackText>
          <FallbackSubtext>Available</FallbackSubtext>
        </FallbackContent>
      )}
      
      <LoadingOverlay show={!!shouldShowLoading}>
        <LoadingSpinner />
      </LoadingOverlay>
      
      <ErrorOverlay show={!!shouldShowError}>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>Image Error</ErrorText>
      </ErrorOverlay>
    </PosterContainer>
  );
};

// Responsive movie poster with automatic sizing
export interface ResponsiveMoviePosterProps extends Omit<MoviePosterProps, 'src' | 'alt' | 'title'> {
  movie: { title: string; year?: number; genre?: string[] };
  posterUrl?: string;
  size?: 'small' | 'medium' | 'large';
}

const responsiveSizes = {
  small: { width: '80px', height: '120px' },
  medium: { width: '120px', height: '180px' },
  large: { width: '160px', height: '240px' },
};

export const ResponsiveMoviePoster: React.FC<ResponsiveMoviePosterProps> = ({
  movie,
  posterUrl,
  size = 'medium',
  style,
  ...props
}) => {
  const bestPosterUrl = getBestPosterUrl(
    posterUrl,
    movie.title,
    'movie',
    150
  );
  const dimensions = responsiveSizes[size];

  return (
    <MoviePoster
      {...props}
      src={bestPosterUrl}
      alt={`${movie.title} poster`}
      title={movie.title}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        ...style,
      }}
    />
  );
};

export default MoviePoster; 