import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { ChatInputProps, CHAT_CONFIG } from '@/types/chat';
import { validateMessage } from '@/utils/messageUtils';

const InputContainer = styled.div`
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px;
  position: sticky;
  bottom: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  min-height: 80px;
  max-height: 120px;
  
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 70px;
    max-height: 100px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 100%;
  position: relative;
`;

const TextAreaContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StyledTextArea = styled.textarea<{ $hasError: boolean }>`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 2px solid ${props => props.$hasError ? '#f56565' : '#e2e8f0'};
  border-radius: 22px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  line-height: 1.4;
  
  background: #f8f9fa;
  
  &:focus {
    border-color: ${props => props.$hasError ? '#f56565' : '#667eea'};
    background: white;
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(245, 101, 101, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &::placeholder {
    color: #a0aec0;
  }
  
  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }
  
  // Hide scrollbar on mobile for cleaner look
  @media (max-width: 768px) {
    font-size: 16px; // Prevent zoom on iOS
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
  }
`;

const SendButton = styled(motion.button)<{ disabled: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${props => props.disabled 
    ? '#e2e8f0' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: ${props => props.disabled ? '#a0aec0' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    `}
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #f56565;
  font-size: 12px;
  margin-top: 4px;
  padding: 0 16px;
`;

const CharacterCount = styled.div<{ $isNearLimit: boolean; $isOverLimit: boolean }>`
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 11px;
  color: ${props => {
    if (props.$isOverLimit) return '#f56565';
    if (props.$isNearLimit) return '#f6ad55';
    return '#a0aec0';
  }};
  
  @media (max-width: 768px) {
    bottom: -18px;
    font-size: 10px;
  }
`;

const Suggestions = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  overflow: hidden;
  z-index: 20;
`;

const SuggestionItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  font-size: 14px;
  color: #2d3748;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
`;

// Pre-defined suggestions for better UX
const QUICK_SUGGESTIONS = [
  "I'm looking for a good action movie",
  "What's a great comedy to watch?",
  "Recommend me a thriller",
  "I want something romantic",
  "Show me some sci-fi movies"
];

// Animation variants
const buttonVariants = {
  idle: { scale: 1 },
  sending: { 
    scale: [1, 0.95, 1],
    transition: { duration: 0.3 }
  }
};

const suggestionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05
    }
  }
};

const suggestionItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const InputBox: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message here...",
  maxLength = CHAT_CONFIG.MAX_MESSAGE_LENGTH
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Character count states
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && message.trim()) {
      setError(null);
    }
  }, [message, error]);

  const handleSend = async () => {
    const validation = validateMessage(message);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await onSendMessage(message);
      setMessage('');
      setShowSuggestions(false);
      
      // Focus back to input after sending
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isSending && message.trim()) {
        handleSend();
      }
    }
    
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Show suggestions when input is empty and focused
    setShowSuggestions(value.trim() === '');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textAreaRef.current?.focus();
  };

  const canSend = message.trim() && !disabled && !isSending && !isOverLimit;

  return (
    <InputContainer>
      <InputWrapper>
        <TextAreaContainer>
          <StyledTextArea
            ref={textAreaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(message.trim() === '')}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={placeholder}
            disabled={disabled || isSending}
            $hasError={!!error || isOverLimit}
            maxLength={maxLength + 100} // Allow slight overflow for better UX
          />
          
          {maxLength && (
            <CharacterCount 
              $isNearLimit={isNearLimit} 
              $isOverLimit={isOverLimit}
            >
              {characterCount}/{maxLength}
            </CharacterCount>
          )}
          
          <AnimatePresence>
            {showSuggestions && (
              <Suggestions
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <motion.div
                    key={suggestion}
                    variants={suggestionItemVariants}
                  >
                    <SuggestionItem
                      onClick={() => handleSuggestionClick(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </SuggestionItem>
                  </motion.div>
                ))}
              </Suggestions>
            )}
          </AnimatePresence>
        </TextAreaContainer>

        <SendButton
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          variants={buttonVariants}
          animate={isSending ? 'sending' : 'idle'}
          whileTap={canSend ? { scale: 0.95 } : {}}
        >
          {isSending ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaPaperPlane />
          )}
        </SendButton>
      </InputWrapper>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </InputContainer>
  );
}; 