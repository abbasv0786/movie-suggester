import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaRobot, FaCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { MessageBubbleProps } from '@/types/chat';
import { formatMessageTime } from '@/utils/messageUtils';
import { MovieCard, MovieCardSkeleton } from './MovieCard';
import { MovieSuggestion } from '../types/api';

const MessageContainer = styled(motion.div)<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 0 12px;
    margin-bottom: 12px;
  }
`;

const MessageWrapper = styled.div<{ isUser: boolean; hasMovies?: boolean }>`
  display: flex;
  align-items: flex-end;
  max-width: ${props => props.hasMovies ? '90%' : '70%'};
  gap: 8px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  
  @media (max-width: 768px) {
    max-width: ${props => props.hasMovies ? '95%' : '85%'};
    gap: 6px;
  }
`;

const Avatar = styled.div<{ isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: white;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
  };
  margin-top: auto; // Align to bottom when movies are present
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const BubbleContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  gap: 8px;
  flex: 1;
`;

const Bubble = styled.div<{ isUser: boolean }>`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#f8f9fa'
  };
  color: ${props => props.isUser ? 'white' : '#2d3748'};
  padding: 12px 16px;
  border-radius: 18px;
  border-top-${props => props.isUser ? 'right' : 'left'}-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  position: relative;
  
  // Smooth text rendering
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    border-radius: 16px;
    border-top-${props => props.isUser ? 'right' : 'left'}-radius: 4px;
  }
`;

const MessageContent = styled.div`
  font-size: 15px;
  line-height: 1.4;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const MoviesContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const MoviesHeader = styled.div<{ isUser: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.isUser && `
    justify-content: flex-end;
  `}
`;

const MovieIcon = styled.span`
  font-size: 16px;
`;

const MessageFooter = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
  padding: 0 4px;
  
  ${props => props.isUser && `
    flex-direction: row-reverse;
  `}
`;

const Timestamp = styled.span`
  color: inherit;
`;

const StatusIcon = styled.span<{ status?: string }>`
  display: flex;
  align-items: center;
  color: ${props => {
    switch (props.status) {
      case 'sending': return '#a0aec0';
      case 'sent': return '#48bb78';
      case 'error': return '#f56565';
      default: return '#a0aec0';
    }
  }};
`;

// Animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  }
};

const movieContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const movieItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

// Enhanced MessageBubble with movie support
export interface MovieMessageBubbleProps extends MessageBubbleProps {
  onMovieExpand?: (movieTitle: string) => void;
  onPosterClick?: (movie: MovieSuggestion) => void;
  isLoadingSuggestions?: boolean;
}

export const MovieMessageBubble: React.FC<MovieMessageBubbleProps> = ({ 
  message, 
  showAvatar = true,
  onMovieExpand,
  onPosterClick,
  isLoadingSuggestions = false
}) => {
  const isUser = message.type === 'user';
  const hasMovies = !isUser && !!(message.suggestions?.length || isLoadingSuggestions);

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <FaClock />;
      case 'sent':
        return <FaCheck />;
      case 'error':
        return <FaExclamationTriangle />;
      default:
        return null;
    }
  };

  return (
    <MessageContainer
      isUser={isUser}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <MessageWrapper isUser={isUser} hasMovies={hasMovies}>
        {showAvatar && (
          <Avatar isUser={isUser}>
            {isUser ? <FaUser /> : <FaRobot />}
          </Avatar>
        )}
        
        <BubbleContainer isUser={isUser}>
          {/* Text Message */}
          {message.content && (
            <Bubble isUser={isUser}>
              <MessageContent>
                {message.content}
              </MessageContent>
            </Bubble>
          )}
          
          {/* Movie Suggestions */}
          {hasMovies && (
            <motion.div
              variants={movieContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <MoviesContainer isUser={isUser}>
                <MoviesHeader isUser={isUser}>
                  <MovieIcon>🎬</MovieIcon>
                  <span>
                    {isLoadingSuggestions 
                      ? 'Finding movie suggestions...' 
                      : `${message.suggestions?.length || 0} movie suggestions`
                    }
                  </span>
                </MoviesHeader>
                
                {isLoadingSuggestions ? (
                  // Loading skeletons
                  <>
                    {[1, 2, 3].map(i => (
                      <motion.div key={i} variants={movieItemVariants}>
                        <MovieCardSkeleton variant="compact" />
                      </motion.div>
                    ))}
                  </>
                ) : (
                  // Actual movie cards
                  message.suggestions?.map((movie, index) => (
                    <motion.div key={`${movie.title}-${index}`} variants={movieItemVariants}>
                      <MovieCard
                        suggestion={movie}
                        variant="compact"
                        onExpand={onMovieExpand}
                        onPosterClick={onPosterClick}
                        showExpandButton={true}
                      />
                    </motion.div>
                  ))
                )}
              </MoviesContainer>
            </motion.div>
          )}
          
          <MessageFooter isUser={isUser}>
            <Timestamp>
              {formatMessageTime(message.timestamp)}
            </Timestamp>
            
            {isUser && message.status && (
              <StatusIcon status={message.status}>
                {getStatusIcon()}
              </StatusIcon>
            )}
          </MessageFooter>
        </BubbleContainer>
      </MessageWrapper>
    </MessageContainer>
  );
};

// Typing indicator for movie suggestions
export interface MovieTypingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const TypingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: #718096;
  font-style: italic;
  font-size: 14px;
`;

const TypingDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #a0aec0;
`;

const typingVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 0, -4],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

export const MovieTypingIndicator: React.FC<MovieTypingIndicatorProps> = ({ 
  isVisible, 
  message = "AI is finding movie suggestions" 
}) => {
  if (!isVisible) return null;

  return (
    <MessageContainer isUser={false}>
      <MessageWrapper isUser={false}>
        <Avatar isUser={false}>
          <FaRobot />
        </Avatar>
        <BubbleContainer isUser={false}>
          <Bubble isUser={false}>
            <motion.div
              variants={typingVariants}
              initial="hidden"
              animate="visible"
            >
              <TypingIndicator>
                <MovieIcon>🎬</MovieIcon>
                <span>{message}</span>
                {[0, 1, 2].map((index) => (
                  <TypingDot
                    key={index}
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                ))}
              </TypingIndicator>
            </motion.div>
          </Bubble>
        </BubbleContainer>
      </MessageWrapper>
    </MessageContainer>
  );
};

export default MovieMessageBubble; 