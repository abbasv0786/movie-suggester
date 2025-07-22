import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieSuggestion } from '../types/api';
import { movieUtils } from '../services/movieService';
import { PosterImage } from './PosterImage';
import { ContentTypeBadge } from './ContentTypeBadge';
import { GenreList } from './GenreTag';
import YearBadge from './YearBadge';
import { Skeleton } from './LoadingIndicator';

// Updated MovieCard props interface
interface MovieCardProps {
  suggestion: MovieSuggestion;
  isLoading?: boolean;
  onExpand?: (title: string) => void;
  onPosterClick?: (suggestion: MovieSuggestion) => void;
  showExpandButton?: boolean;
  showPoster?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

interface ExpandableState {
  isExpanded: boolean;
  height: number;
}

// Card container
const CardContainer = styled.div<{ 
  variant: 'default' | 'compact' | 'detailed';
  isClickable?: boolean;
  $isChat?: boolean;
}>`
  display: flex;
  gap: ${props => {
    switch (props.variant) {
      case 'compact': return '8px';
      case 'detailed': return '16px';
      default: return '12px';
    }
  }};
  padding: ${props => {
    switch (props.variant) {
      case 'compact': return '12px';
      case 'detailed': return '20px';
      default: return '16px';
    }
  }};
  background: ${props => {
    if (props.$isChat) {
      return 'linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%)';
    }
    return 'white';
  }};
  border-radius: ${props => {
    switch (props.variant) {
      case 'compact': return '8px';
      case 'detailed': return '16px';
      default: return '12px';
    }
  }};
  border: 1px solid ${props => props.$isChat ? '#81e6d9' : '#e2e8f0'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  
  ${props => props.isClickable && `
    &:hover {
      border-color: ${props.$isChat ? '#4fd1c7' : '#cbd5e0'};
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
  `}
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;

// Movie content (everything except poster)
const MovieContent = styled.div<{ variant: 'default' | 'compact' | 'detailed' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => {
    switch (props.variant) {
      case 'compact': return '6px';
      case 'detailed': return '12px';
      default: return '8px';
    }
  }};
  min-width: 0; // Prevent flex item from overflowing
`;

// Movie header (title and metadata)
const MovieHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// Movie title
const MovieTitle = styled.h3<{ variant: 'default' | 'compact' | 'detailed' }>`
  font-size: ${props => {
    switch (props.variant) {
      case 'compact': return '16px';
      case 'detailed': return '20px';
      default: return '18px';
    }
  }};
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: ${props => {
      switch (props.variant) {
        case 'compact': return '15px';
        case 'detailed': return '18px';
        default: return '16px';
      }
    }};
  }
`;

// Movie metadata row
const MetadataRow = styled.div<{ variant: 'default' | 'compact' | 'detailed' }>`
  display: flex;
  align-items: center;
  gap: ${props => {
    switch (props.variant) {
      case 'compact': return '6px';
      case 'detailed': return '12px';
      default: return '8px';
    }
  }};
  flex-wrap: wrap;
`;

// IMDB Rating display
const RatingBadge = styled.span<{ compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${props => props.compact ? '2px 6px' : '4px 8px'};
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
  border-radius: 12px;
  font-size: ${props => props.compact ? '10px' : '12px'};
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: ${props => props.compact ? '9px' : '10px'};
    padding: ${props => props.compact ? '1px 4px' : '3px 6px'};
  }
`;

// Movie description
const MovieDescription = styled.p<{ variant: 'default' | 'compact' | 'detailed' }>`
  font-size: ${props => {
    switch (props.variant) {
      case 'compact': return '13px';
      case 'detailed': return '15px';
      default: return '14px';
    }
  }};
  line-height: 1.5;
  color: #4a5568;
  margin: 0;
`;

// Expandable content
const ExpandableContent = styled(motion.div)`
  overflow: hidden;
`;

// Reason section
const ReasonSection = styled.div<{ variant: 'default' | 'compact' | 'detailed' }>`
  margin-top: ${props => {
    switch (props.variant) {
      case 'compact': return '8px';
      case 'detailed': return '12px';
      default: return '10px';
    }
  }};
  padding: ${props => {
    switch (props.variant) {
      case 'compact': return '8px';
      case 'detailed': return '12px';
      default: return '10px';
    }
  }};
  background-color: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3182ce;
`;

const ReasonLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #3182ce;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const ReasonText = styled.p<{ variant: 'default' | 'compact' | 'detailed' }>`
  font-size: ${props => {
    switch (props.variant) {
      case 'compact': return '12px';
      case 'detailed': return '14px';
      default: return '13px';
    }
  }};
  line-height: 1.4;
  color: #2d3748;
  margin: 0;
  font-style: italic;
`;

// Expand button
const ExpandButton = styled.button<{ variant: 'default' | 'compact' | 'detailed' }>`
  background: none;
  border: none;
  color: #3182ce;
  font-size: ${props => {
    switch (props.variant) {
      case 'compact': return '11px';
      case 'detailed': return '13px';
      default: return '12px';
    }
  }};
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  align-self: flex-start;
  transition: color 0.2s ease;
  
  &:hover {
    color: #2c5282;
    text-decoration: underline;
  }
  
  &:focus {
    outline: none;
    color: #2c5282;
  }
`;

// Loading skeleton for movie card
export const MovieCardSkeleton: React.FC<{ variant?: 'default' | 'compact' | 'detailed' }> = ({ 
  variant = 'default' 
}) => (
  <CardContainer variant={variant}>
    <Skeleton 
      width={variant === 'compact' ? '80px' : '120px'} 
      height={variant === 'compact' ? '120px' : '180px'} 
      borderRadius="8px"
    />
    <MovieContent variant={variant}>
      <MovieHeader>
        <Skeleton height="20px" width="70%" />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Skeleton height="16px" width="60px" />
          <Skeleton height="16px" width="40px" />
          <Skeleton height="16px" width="80px" />
        </div>
      </MovieHeader>
      <Skeleton height="14px" width="100%" />
      <Skeleton height="14px" width="85%" />
      <Skeleton height="12px" width="60%" />
    </MovieContent>
  </CardContainer>
);

export const MovieCard: React.FC<MovieCardProps> = ({
  suggestion,
  isLoading = false,
  onExpand,
  onPosterClick,
  showExpandButton = true,
  showPoster = true,
  className,
  variant = 'default'
}) => {
  const [expandableState, setExpandableState] = useState<ExpandableState>({
    isExpanded: false,
    height: 0
  });
  const contentRef = useRef<HTMLDivElement>(null);

  const isChat = suggestion.content_type === 'chat';
  const displayTitle = suggestion.imdb_title || suggestion.title;

  // Debug logging for poster rendering
  console.log('🎭 MovieCard render:', {
    title: suggestion.title,
    content_type: suggestion.content_type,
    isChat,
    showPoster,
    poster_url: suggestion.poster_url,
    shouldRenderPoster: showPoster && !isChat
  });

  // Handle expand/collapse
  const handleToggleExpand = () => {
    const newExpanded = !expandableState.isExpanded;
    setExpandableState(prev => ({
      ...prev,
      isExpanded: newExpanded
    }));
    
    if (onExpand) {
      onExpand(suggestion.title);
    }
  };

  // Measure content height
  useEffect(() => {
    if (contentRef.current) {
      setExpandableState(prev => ({
        ...prev,
        height: contentRef.current!.scrollHeight
      }));
    }
  }, [suggestion, expandableState.isExpanded]);

  // Show skeleton while loading
  if (isLoading) {
    return <MovieCardSkeleton variant={variant} />;
  }

  // Truncate description based on variant
  const getDescriptionLength = () => {
    switch (variant) {
      case 'compact': return 80;
      case 'detailed': return 300;
      default: return 150;
    }
  };

  const shouldShowExpandButton = showExpandButton && 
    (suggestion.description.length > getDescriptionLength() || suggestion.reason.length > 100);

  const displayDescription = expandableState.isExpanded 
    ? suggestion.description 
    : movieUtils.truncateDescription(suggestion.description, getDescriptionLength());

  // Get poster dimensions based on variant
  const getPosterDimensions = () => {
    switch (variant) {
      case 'compact': return { width: 80, height: 120 };
      case 'detailed': return { width: 140, height: 210 };
      default: return { width: 100, height: 150 };
    }
  };

  const { width: posterWidth, height: posterHeight } = getPosterDimensions();

  return (
    <CardContainer 
      variant={variant}
      className={className}
      isClickable={!!onPosterClick}
      $isChat={isChat}
    >
      {showPoster && !isChat && (
        <PosterImage
          poster_url={suggestion.poster_url}
          title={suggestion.title}
          imdb_title={suggestion.imdb_title}
          width={posterWidth}
          height={posterHeight}
          showPlaceholder={true}
        />
      )}
      
      <MovieContent variant={variant}>
        <MovieHeader>
          <MovieTitle variant={variant}>
            {displayTitle}
          </MovieTitle>
          
          <MetadataRow variant={variant}>
            <ContentTypeBadge 
              contentType={suggestion.content_type} 
              compact={variant === 'compact'}
            />
            
            {!isChat && (
              <>
                <YearBadge year={suggestion.year} />
                
                {suggestion.imdb_rating && (
                  <RatingBadge compact={variant === 'compact'}>
                    ⭐ {suggestion.imdb_rating.toFixed(1)}
                  </RatingBadge>
                )}
                
                <GenreList 
                  genres={suggestion.genre.filter(g => g !== 'recommendation' && g !== 'conversation')} 
                  maxDisplay={variant === 'compact' ? 2 : 3}
                  variant={variant === 'compact' ? 'small' : 'default'}
                />
              </>
            )}
          </MetadataRow>
        </MovieHeader>
        
        <MovieDescription variant={variant}>
          {displayDescription}
        </MovieDescription>
        
        <AnimatePresence>
          {expandableState.isExpanded && (
            <ExpandableContent
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div ref={contentRef}>
                <ReasonSection variant={variant}>
                  <ReasonLabel>
                    {isChat ? 'Response' : 'Why this was suggested'}
                  </ReasonLabel>
                  <ReasonText variant={variant}>
                    {suggestion.reason}
                  </ReasonText>
                </ReasonSection>
              </div>
            </ExpandableContent>
          )}
        </AnimatePresence>
        
        {shouldShowExpandButton && (
          <ExpandButton 
            variant={variant}
            onClick={handleToggleExpand}
          >
            {expandableState.isExpanded ? 'Show less' : 'Show more'}
          </ExpandButton>
        )}
      </MovieContent>
    </CardContainer>
  );
};

export default MovieCard; 