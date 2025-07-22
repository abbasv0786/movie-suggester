import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface PosterImageProps {
  poster_url?: string | null;
  title: string;
  imdb_title?: string | null;
  width?: number;
  height?: number;
  className?: string;
  showPlaceholder?: boolean;
}

const PosterContainer = styled(motion.div)<{ width?: number; height?: number }>`
  width: ${props => props.width ? `${props.width}px` : '100px'};
  height: ${props => props.height ? `${props.height}px` : '150px'};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    width: ${props => props.width ? `${props.width * 0.8}px` : '80px'};
    height: ${props => props.height ? `${props.height * 0.8}px` : '120px'};
  }
`;

const PosterImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
`;

const PlaceholderContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 12px;
`;

const PlaceholderIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const PlaceholderText = styled.div`
  font-weight: 500;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  
  @media (max-width: 768px) {
    font-size: 10px;
    -webkit-line-clamp: 3;
  }
`;

const LoadingPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const PosterImage: React.FC<PosterImageProps> = ({
  poster_url,
  title,
  imdb_title,
  width = 100,
  height = 150,
  className,
  showPlaceholder = true
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const displayTitle = imdb_title || title;
  const hasValidPosterUrl = poster_url && poster_url.startsWith('http');

  // Debug logging
  console.log('🖼️ PosterImage render:', {
    title,
    poster_url,
    hasValidPosterUrl,
    showPlaceholder,
    imageLoading,
    imageError,
    width,
    height
  });

  // Fallback timeout to show image even if onLoad doesn't fire
  React.useEffect(() => {
    if (hasValidPosterUrl && imageLoading) {
      const timeout = setTimeout(() => {
        console.log('⏰ Image load timeout, forcing visibility:', poster_url);
        setImageLoading(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [hasValidPosterUrl, imageLoading, poster_url]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', poster_url);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.log('❌ Image failed to load:', poster_url);
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <PosterContainer
      width={width}
      height={height}
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {hasValidPosterUrl && !imageError ? (
        <>
          {imageLoading && <LoadingPlaceholder />}
          <PosterImg
            src={poster_url}
            alt={`${displayTitle} poster`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease',
              display: 'block',
              width: '100%',
              height: '100%'
            }}
          />
        </>
      ) : showPlaceholder ? (
        <PlaceholderContainer>
          <PlaceholderIcon>🎬</PlaceholderIcon>
          <PlaceholderText>{displayTitle}</PlaceholderText>
        </PlaceholderContainer>
      ) : null}
    </PosterContainer>
  );
};

export default PosterImage; 