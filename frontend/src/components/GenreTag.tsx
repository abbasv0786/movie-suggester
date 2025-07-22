import React from 'react';
import styled from 'styled-components';
import { GenreTagProps } from '../types/movie';
import { movieUtils } from '../types/movie';

// Genre tag container
const TagContainer = styled.span<{ 
  variant: 'default' | 'small' | 'large';
  customColor?: string;
}>`
  display: inline-flex;
  align-items: center;
  padding: ${props => {
    switch (props.variant) {
      case 'small': return '2px 6px';
      case 'large': return '6px 12px';
      default: return '4px 8px';
    }
  }};
  border-radius: ${props => {
    switch (props.variant) {
      case 'small': return '8px';
      case 'large': return '12px';
      default: return '10px';
    }
  }};
  font-size: ${props => {
    switch (props.variant) {
      case 'small': return '10px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 500;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  
  background-color: ${props => props.customColor ? `${props.customColor}15` : '#edf2f7'};
  color: ${props => props.customColor || '#4a5568'};
  border: 1px solid ${props => props.customColor ? `${props.customColor}30` : '#e2e8f0'};
  
  &:hover {
    background-color: ${props => props.customColor ? `${props.customColor}25` : '#e2e8f0'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: ${props => {
      switch (props.variant) {
        case 'small': return '9px';
        case 'large': return '13px';
        default: return '11px';
      }
    }};
    padding: ${props => {
      switch (props.variant) {
        case 'small': return '1px 4px';
        case 'large': return '5px 10px';
        default: return '3px 6px';
      }
    }};
  }
`;

export const GenreTag: React.FC<GenreTagProps> = ({
  genre,
  variant = 'default',
  color = 'auto',
  className
}) => {
  // Get genre color
  const getGenreColor = () => {
    switch (color) {
      case 'primary':
        return '#3182ce';
      case 'secondary':
        return '#718096';
      case 'auto':
      default:
        return movieUtils.getGenreColor(genre);
    }
  };

  const genreColor = getGenreColor();

  return (
    <TagContainer
      variant={variant}
      customColor={genreColor}
      className={className}
      title={`${genre} genre`}
    >
      {genre}
    </TagContainer>
  );
};

// Genre list component for multiple genres
export interface GenreListProps {
  genres: string[];
  maxDisplay?: number;
  variant?: 'default' | 'small' | 'large';
  color?: 'auto' | 'primary' | 'secondary';
  className?: string;
  onGenreClick?: (genre: string) => void;
}

const GenreListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
`;

const MoreGenresIndicator = styled.span<{ variant: 'default' | 'small' | 'large' }>`
  color: #718096;
  font-size: ${props => {
    switch (props.variant) {
      case 'small': return '10px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 500;
  margin-left: 2px;
`;

const ClickableGenreTag = styled(GenreTag)`
  cursor: pointer;
  
  &:active {
    transform: translateY(0);
  }
`;

export const GenreList: React.FC<GenreListProps> = ({
  genres,
  maxDisplay = 3,
  variant = 'default',
  color = 'auto',
  className,
  onGenreClick
}) => {
  const displayedGenres = genres.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, genres.length - maxDisplay);

  return (
    <GenreListContainer className={className}>
      {displayedGenres.map((genre, index) => {
        const TagComponent = onGenreClick ? ClickableGenreTag : GenreTag;
        
        return (
          <TagComponent
            key={`${genre}-${index}`}
            genre={genre}
            variant={variant}
            color={color}
            onClick={onGenreClick ? () => onGenreClick(genre) : undefined}
          />
        );
      })}
      
      {hiddenCount > 0 && (
        <MoreGenresIndicator variant={variant}>
          +{hiddenCount} more
        </MoreGenresIndicator>
      )}
    </GenreListContainer>
  );
};

// Expandable genre list component
export interface ExpandableGenreListProps extends GenreListProps {
  expandText?: string;
  collapseText?: string;
}

export const ExpandableGenreList: React.FC<ExpandableGenreListProps> = ({
  genres,
  maxDisplay = 3,
  expandText = 'Show all',
  collapseText = 'Show less',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (genres.length <= maxDisplay) {
    return <GenreList genres={genres} {...props} />;
  }

  return (
    <GenreListContainer className={props.className}>
      <GenreList 
        genres={isExpanded ? genres : genres.slice(0, maxDisplay)}
        maxDisplay={isExpanded ? genres.length : maxDisplay}
        {...props}
      />
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3182ce',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e6f3ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isExpanded ? collapseText : expandText}
      </button>
    </GenreListContainer>
  );
};

export default GenreTag; 