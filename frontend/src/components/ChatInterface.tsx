import React, { forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown, FaTimes } from 'react-icons/fa';
import { ChatInterfaceProps, ChatInterfaceRef, CHAT_CONFIG } from '@/types/chat';
import { MessageBubble, MessageTypingIndicator } from './MessageBubble';
import { InputBox } from './InputBox';
import { useChat } from '@/hooks/useChat';
import { shouldAutoScroll } from '@/utils/messageUtils';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 100%;
  }
`;

// Header components removed - handled by parent component

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0 20px 0;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  max-height: 100%;
  
  /* Enable smooth scrolling */
  scroll-behavior: smooth;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  
  @media (max-width: 768px) {
    padding: 16px 0;
    
    /* Show thin scrollbar on mobile */
    &::-webkit-scrollbar {
      width: 3px;
    }
    scrollbar-width: thin;
  }
`;

const MessagesInner = styled.div<{ $hasMany?: boolean }>`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: ${props => props.$hasMany ? 'flex-start' : 'flex-end'};
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  text-align: center;
  color: #718096;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.7;
`;

const ScrollToBottomButton = styled(motion.button)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 10;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

const MessagesEnd = styled.div`
  height: 1px;
  width: 1px;
`;

const ErrorBanner = styled(motion.div)`
  background: #fed7d7;
  color: #c53030;
  padding: 12px 20px;
  font-size: 14px;
  border-bottom: 1px solid #feb2b2;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ErrorText = styled.span`
  flex: 1;
`;

const ErrorCloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scrollButtonVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({
  initialMessages = [],
  onMessageSend,
  enableMockResponses = false, // Changed to use real API by default
  className
}, ref) => {
  const {
    messages,
    isLoading,
    error,
    isTyping,
    sendMessage,
    clearMessages,
    scrollToBottom,
    messagesEndRef,
    messagesContainerRef
  } = useChat({
    enableMockResponses,
    enablePersistence: true,
    initialMessages,
    mockResponseDelay: CHAT_CONFIG.MOCK_RESPONSE_DELAY,
    enableStreaming: false // Disable streaming API - use regular API instead
  });

  // Expose clearMessages function to parent component
  useImperativeHandle(ref, () => ({
    clearMessages
  }), [clearMessages]);

  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Monitor scroll position to show/hide scroll to bottom button
  React.useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const shouldShow = !shouldAutoScroll(container, CHAT_CONFIG.AUTO_SCROLL_THRESHOLD);
      setShowScrollButton(shouldShow);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      onMessageSend?.(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Clear messages handler removed - handled by parent component

  return (
    <ChatContainer className={className}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* ChatHeader removed to prevent overlap with parent page header */}

        <AnimatePresence>
          {error && (
            <ErrorBanner
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <ErrorText>{error}</ErrorText>
              <ErrorCloseButton onClick={() => {}}>
                <FaTimes size={12} />
              </ErrorCloseButton>
            </ErrorBanner>
          )}
        </AnimatePresence>

        <MessagesContainer ref={messagesContainerRef}>
          <MessagesInner $hasMany={messages.length > 3}>
            {messages.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>🎬</EmptyStateIcon>
                <EmptyStateText>Welcome to Movie AI!</EmptyStateText>
                <EmptyStateSubtext>
                  Ask me for movie recommendations and I'll help you find the perfect film to watch.
                </EmptyStateSubtext>
              </EmptyState>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                    showAvatar={true}
                  />
                ))}
                
                <MessageTypingIndicator isVisible={isTyping} />
              </>
            )}
            
            <MessagesEnd ref={messagesEndRef} />
          </MessagesInner>

          <AnimatePresence>
            {showScrollButton && (
              <ScrollToBottomButton
                variants={scrollButtonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={scrollToBottom}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowDown />
              </ScrollToBottomButton>
            )}
          </AnimatePresence>
        </MessagesContainer>

        <InputBox
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask me about movies... (e.g., 'I want a good action movie')"
          maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
        />
      </motion.div>
    </ChatContainer>
  );
}); 