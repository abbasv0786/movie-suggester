import React from 'react';
import styled, { keyframes } from 'styled-components';

// Spinning animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Pulse animation
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Bounce animation for dots
const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

// Loading spinner container
const SpinnerContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => 
    props.size === 'small' ? '16px' : 
    props.size === 'medium' ? '24px' : '32px'
  };
  height: ${props => 
    props.size === 'small' ? '16px' : 
    props.size === 'medium' ? '24px' : '32px'
  };
`;

// Spinner circle
const Spinner = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  width: 100%;
  height: 100%;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3182ce;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  
  ${props => props.size === 'small' && `
    border-width: 1px;
  `}
`;

// Dots container for loading dots
const DotsContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

// Individual dot
const Dot = styled.div<{ delay: number }>`
  width: 6px;
  height: 6px;
  background-color: #3182ce;
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.delay}s;
`;

// Full screen loading overlay
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

// Loading text
const LoadingText = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  margin-top: 12px;
  color: #4a5568;
  font-size: ${props => 
    props.size === 'small' ? '12px' : 
    props.size === 'medium' ? '14px' : '16px'
  };
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

// Inline loading container
const InlineContainer = styled.div<{ align?: 'left' | 'center' | 'right' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: ${props => 
    props.align === 'center' ? 'center' : 
    props.align === 'right' ? 'flex-end' : 'flex-start'
  };
`;

export interface LoadingIndicatorProps {
  variant?: 'spinner' | 'dots' | 'overlay';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'spinner',
  size = 'medium',
  text,
  align = 'center',
  className
}) => {
  if (variant === 'overlay') {
    return (
      <OverlayContainer className={className}>
        <SpinnerContainer size={size}>
          <Spinner size={size} />
        </SpinnerContainer>
        {text && <LoadingText size={size}>{text}</LoadingText>}
      </OverlayContainer>
    );
  }

  if (variant === 'dots') {
    return (
      <InlineContainer align={align} className={className}>
        <DotsContainer>
          <Dot delay={0} />
          <Dot delay={0.16} />
          <Dot delay={0.32} />
        </DotsContainer>
        {text && <LoadingText size={size}>{text}</LoadingText>}
      </InlineContainer>
    );
  }

  return (
    <InlineContainer align={align} className={className}>
      <SpinnerContainer size={size}>
        <Spinner size={size} />
      </SpinnerContainer>
      {text && <LoadingText size={size}>{text}</LoadingText>}
    </InlineContainer>
  );
};

// Button loading state component
const ButtonLoadingContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...'
}) => {
  if (isLoading) {
    return (
      <ButtonLoadingContainer>
        <LoadingIndicator variant="spinner" size="small" />
        {loadingText}
      </ButtonLoadingContainer>
    );
  }

  return <>{children}</>;
};

// Skeleton loading component for content placeholders
const SkeletonContainer = styled.div<{ 
  width?: string; 
  height?: string; 
  borderRadius?: string; 
}>`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: ${props => props.borderRadius || '4px'};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
`;

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className
}) => {
  return (
    <SkeletonContainer
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
    />
  );
};

export default LoadingIndicator; 