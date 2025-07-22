import React from 'react';
import styled from 'styled-components';
import { RatingDisplayProps } from '../types/movie';

// Rating container
const RatingContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => {
    switch (props.size) {
      case 'small': return '4px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

// Stars container
const StarsContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  }};
`;

// Individual star
const Star = styled.span<{ 
  filled: boolean; 
  partial?: number;
  size: 'small' | 'medium' | 'large';
}>`
  position: relative;
  color: ${props => props.filled ? '#fbbf24' : '#e5e7eb'};
  transition: color 0.2s ease;
  
  ${props => props.partial && props.partial > 0 && `
    &::before {
      content: '★';
      position: absolute;
      left: 0;
      top: 0;
      width: ${props.partial * 100}%;
      overflow: hidden;
      color: #fbbf24;
    }
  `}
`;

// Rating value text
const RatingValue = styled.span<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '11px';
      case 'large': return '15px';
      default: return '13px';
    }
  }};
  font-weight: 600;
  color: #4a5568;
  margin-left: 2px;
`;

// Rating out of text
const RatingOutOf = styled.span<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '10px';
      case 'large': return '13px';
      default: return '11px';
    }
  }};
  font-weight: 400;
  color: #718096;
  margin-left: 1px;
`;

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 10,
  showValue = true,
  size = 'medium',
  className
}) => {
  // If no rating provided, don't render anything
  if (rating === undefined || rating === null) {
    return null;
  }

  // Normalize rating to 0-5 stars scale
  const normalizedRating = (rating / maxRating) * 5;
  const fullStars = Math.floor(normalizedRating);
  const hasPartialStar = normalizedRating % 1 > 0;
  const partialStarFill = normalizedRating % 1;
  const emptyStars = 5 - fullStars - (hasPartialStar ? 1 : 0);

  // Format rating value
  const formatRating = (value: number): string => {
    if (maxRating === 10) {
      return value.toFixed(1);
    }
    return value.toString();
  };

  // Get rating color based on value
  const getRatingColor = (value: number): string => {
    const normalizedValue = (value / maxRating) * 10;
    if (normalizedValue >= 8) return '#22c55e'; // Green
    if (normalizedValue >= 6) return '#eab308'; // Yellow
    if (normalizedValue >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <RatingContainer size={size} className={className}>
      <StarsContainer size={size}>
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={`full-${i}`} filled={true} size={size}>
            ★
          </Star>
        ))}
        
        {/* Partial star */}
        {hasPartialStar && (
          <Star 
            key="partial" 
            filled={false} 
            partial={partialStarFill}
            size={size}
          >
            ★
          </Star>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`empty-${i}`} filled={false} size={size}>
            ★
          </Star>
        ))}
      </StarsContainer>
      
      {showValue && (
        <>
          <RatingValue 
            size={size}
            style={{ color: getRatingColor(rating) }}
          >
            {formatRating(rating)}
          </RatingValue>
          <RatingOutOf size={size}>
            /{maxRating}
          </RatingOutOf>
        </>
      )}
    </RatingContainer>
  );
};

// Simple rating badge without stars
export interface RatingBadgeProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

const BadgeContainer = styled.span<{ ratingColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: white;
  background-color: ${props => props.ratingColor};
  min-width: 28px;
  justify-content: center;
`;

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  maxRating = 10,
  className
}) => {
  if (rating === undefined || rating === null) {
    return null;
  }

  const getRatingColor = (value: number): string => {
    const normalizedValue = (value / maxRating) * 10;
    if (normalizedValue >= 8) return '#22c55e';
    if (normalizedValue >= 6) return '#eab308';
    if (normalizedValue >= 4) return '#f97316';
    return '#ef4444';
  };

  return (
    <BadgeContainer 
      ratingColor={getRatingColor(rating)} 
      className={className}
      title={`Rating: ${rating}/${maxRating}`}
    >
      {rating.toFixed(1)}
    </BadgeContainer>
  );
};

export default RatingDisplay; 