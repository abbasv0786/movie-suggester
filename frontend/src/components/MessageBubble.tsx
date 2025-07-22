import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaRobot, FaCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { MessageBubbleProps } from '@/types/chat';
import { MovieSuggestion } from '@/types/api';
import { formatMessageTime } from '@/utils/messageUtils';
import { MovieCard } from './MovieCard';

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

const MessageWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: flex-end;
  max-width: ${props => props.isUser ? '70%' : '90%'};
  gap: 8px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  
  @media (max-width: 768px) {
    max-width: ${props => props.isUser ? '85%' : '95%'};
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
  gap: 4px;
  flex: 1;
`;

const Bubble = styled.div<{ isUser: boolean; hasMovieSuggestions?: boolean }>`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#f8f9fa'
  };
  color: ${props => props.isUser ? 'white' : '#2d3748'};
  padding: ${props => props.hasMovieSuggestions ? '16px' : '12px 16px'};
  border-radius: 18px;
  border-top-${props => props.isUser ? 'right' : 'left'}-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  position: relative;
  
  // Smooth text rendering
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  @media (max-width: 768px) {
    padding: ${props => props.hasMovieSuggestions ? '12px' : '10px 14px'};
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

const SuggestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 8px;
  }
`;

const SuggestionsHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 6px;
  }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  gap: 12px;
  
  @media (min-width: 769px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    gap: 8px;
  }
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

const StatusIcon = styled.span<{ $status?: string }>`
  display: flex;
  align-items: center;
  color: ${props => {
    switch (props.$status) {
      case 'sending': return '#a0aec0';
      case 'sent': return '#48bb78';
      case 'error': return '#f56565';
      default: return '#a0aec0';
    }
  }};
`;

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

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const MessageTypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
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
                <span>AI is typing</span>
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

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showAvatar = true }) => {
  const isUser = message.type === 'user';
  const suggestions = (message as any).suggestions || [];
  
  const conversationalSuggestions = suggestions.filter((s: MovieSuggestion) => 
    s.content_type === 'chat' || s.genre.includes('conversation')
  );
  const movieSuggestions = suggestions.filter((s: MovieSuggestion) => 
    s.content_type === 'movie' || s.content_type === 'series'
  );

  const hasMovieSuggestions = movieSuggestions.length > 0;
  const hasConversationalContent = conversationalSuggestions.length > 0 || !hasMovieSuggestions;

  // Debug logging for MessageBubble rendering
  console.log('💬 MessageBubble render:', {
    messageType: message.type,
    suggestions: suggestions.length,
    movieSuggestions: movieSuggestions.length,
    hasMovieSuggestions
  });

  const getConversationalContent = () => {
    if (conversationalSuggestions.length > 0) {
      return conversationalSuggestions.map((s: MovieSuggestion) => s.reason).join(' ');
    }
    return message.content;
  };

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
      <MessageWrapper isUser={isUser}>
        {showAvatar && (
          <Avatar isUser={isUser}>
            {isUser ? <FaUser /> : <FaRobot />}
          </Avatar>
        )}
        
        <BubbleContainer isUser={isUser}>
          <Bubble isUser={isUser} hasMovieSuggestions={hasMovieSuggestions}>
            {hasConversationalContent && (
              <MessageContent>
                {getConversationalContent()}
              </MessageContent>
            )}
            
            {hasMovieSuggestions && (
              <SuggestionsContainer>
                <SuggestionsHeader>
                  <span>🎬</span>
                  <span>
                    {movieSuggestions.length === 1 
                      ? 'Here\'s a suggestion for you:' 
                      : `Here are ${movieSuggestions.length} suggestions for you:`
                    }
                  </span>
                </SuggestionsHeader>
                
                <SuggestionsGrid>
                  {movieSuggestions.map((suggestion: MovieSuggestion, index: number) => {
                    console.log(`🎬 Rendering MovieCard ${index + 1}/${movieSuggestions.length}:`, suggestion);
                    return (
                      <MovieCard
                        key={`${suggestion.title}-${index}`}
                        suggestion={suggestion}
                        variant="compact"
                        showPoster={true}
                        showExpandButton={true}
                      />
                    );
                  })}
                </SuggestionsGrid>
              </SuggestionsContainer>
            )}
          </Bubble>
          
          <MessageFooter isUser={isUser}>
            <Timestamp>
              {formatMessageTime(message.timestamp)}
            </Timestamp>
            
            {isUser && message.status && (
              <StatusIcon $status={message.status}>
                {getStatusIcon()}
              </StatusIcon>
            )}
          </MessageFooter>
        </BubbleContainer>
      </MessageWrapper>
    </MessageContainer>
  );
}; 