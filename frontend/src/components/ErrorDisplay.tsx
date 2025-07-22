import React from 'react';
import styled from 'styled-components';
import { ApiError } from '../types/api';

// Error container
const ErrorContainer = styled.div<{ variant: 'inline' | 'card' | 'banner' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => 
    props.variant === 'banner' ? '16px 20px' : 
    props.variant === 'card' ? '20px' : '12px'
  };
  border-radius: ${props => 
    props.variant === 'banner' ? '8px' : 
    props.variant === 'card' ? '12px' : '6px'
  };
  background-color: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  font-size: 14px;
  line-height: 1.5;
  
  ${props => props.variant === 'banner' && `
    margin: 16px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `}
  
  ${props => props.variant === 'card' && `
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `}
`;

// Warning variant
const WarningContainer = styled(ErrorContainer)`
  background-color: #fefcbf;
  border-color: #f6e05e;
  color: #b7791f;
`;

// Info variant
const InfoContainer = styled(ErrorContainer)`
  background-color: #bee3f8;
  border-color: #90cdf4;
  color: #2c5282;
`;

// Error icon
const ErrorIcon = styled.div`
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
`;

// Error content
const ErrorContent = styled.div<{ hasActions?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  ${props => props.hasActions && `
    margin-bottom: 8px;
  `}
`;

// Error title
const ErrorTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

// Error message
const ErrorMessage = styled.div`
  font-weight: 400;
  opacity: 0.9;
`;

// Error details (collapsible)
const ErrorDetails = styled.details`
  margin-top: 8px;
  
  summary {
    cursor: pointer;
    font-weight: 500;
    opacity: 0.8;
    font-size: 13px;
    
    &:hover {
      opacity: 1;
    }
  }
  
  pre {
    margin-top: 8px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

// Action buttons container
const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
`;

// Action button
const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background-color: #3182ce;
    border-color: #3182ce;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #2c5282;
      border-color: #2c5282;
    }
  ` : `
    background-color: transparent;
    border-color: currentColor;
    color: inherit;
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.3);
  }
`;

// Dismiss button
const DismissButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 16px;
  line-height: 1;
  margin-left: auto;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    opacity: 1;
  }
`;

export interface ErrorDisplayProps {
  error: ApiError | Error | string;
  variant?: 'inline' | 'card' | 'banner';
  type?: 'error' | 'warning' | 'info';
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissible?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  variant = 'inline',
  type = 'error',
  title,
  showDetails = false,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissible = false,
  className
}) => {
  // Parse error
  const errorData = React.useMemo(() => {
    if (typeof error === 'string') {
      return { message: error, status: undefined, code: undefined };
    }
    
    if (error instanceof Error) {
      return { message: error.message, status: undefined, code: undefined };
    }
    
    return error as ApiError;
  }, [error]);

  // Get appropriate icon
  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  // Get user-friendly error message
  const getUserFriendlyMessage = (errorData: ApiError): string => {
    // Network errors
    if (!errorData.status || errorData.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (errorData.code === 'ECONNABORTED') {
      return 'Request timed out. The server took too long to respond.';
    }
    
    // HTTP status errors
    switch (errorData.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested service was not found. Please try again later.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Our team has been notified. Please try again later.';
      default:
        return errorData.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Determine if error is retryable
  const isRetryable = () => {
    return !errorData.status || 
           errorData.status >= 500 || 
           errorData.status === 429 ||
           errorData.code === 'ERR_NETWORK' ||
           errorData.code === 'ECONNABORTED';
  };

  // Select container component
  const Container = type === 'warning' ? WarningContainer : 
                   type === 'info' ? InfoContainer : ErrorContainer;

  return (
    <Container variant={variant} className={className}>
      <ErrorIcon>{getIcon()}</ErrorIcon>
      
      <ErrorContent hasActions={!!(onRetry || dismissible)}>
        {title && <ErrorTitle>{title}</ErrorTitle>}
        <ErrorMessage>{getUserFriendlyMessage(errorData)}</ErrorMessage>
        
        {showDetails && (errorData.status || errorData.code) && (
          <ErrorDetails>
            <summary>Technical Details</summary>
            <pre>
              {JSON.stringify({
                status: errorData.status,
                code: errorData.code,
                message: errorData.message
              }, null, 2)}
            </pre>
          </ErrorDetails>
        )}
        
        {(onRetry || dismissible) && (
          <ActionsContainer>
            {onRetry && isRetryable() && (
              <ActionButton variant="primary" onClick={onRetry}>
                {retryText}
              </ActionButton>
            )}
            {dismissible && onDismiss && (
              <ActionButton variant="secondary" onClick={onDismiss}>
                Dismiss
              </ActionButton>
            )}
          </ActionsContainer>
        )}
      </ErrorContent>
      
      {dismissible && onDismiss && (
        <DismissButton onClick={onDismiss} title="Dismiss">
          ×
        </DismissButton>
      )}
    </Container>
  );
};

// Network status component
const NetworkStatusContainer = styled.div<{ isOnline: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  z-index: 1001;
  transition: all 0.3s;
  
  ${props => props.isOnline ? `
    background-color: #38a169;
    border: 1px solid #2f855a;
  ` : `
    background-color: #e53e3e;
    border: 1px solid #c53030;
  `}
`;

export interface NetworkStatusProps {
  show?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ show = true }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showStatus, setShowStatus] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show || !showStatus) return null;

  return (
    <NetworkStatusContainer isOnline={isOnline}>
      {isOnline ? '🌐 Back online' : '📡 No internet connection'}
    </NetworkStatusContainer>
  );
};

export default ErrorDisplay; 