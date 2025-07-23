import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Message, MOCK_RESPONSES } from '@/types/chat';
import { MovieSuggestion } from '@/types/api';

// Generate unique message ID
export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create new message object
export const createMessage = (
  content: string,
  type: 'user' | 'bot',
  status: 'sending' | 'sent' | 'error' = 'sent',
  suggestions?: MovieSuggestion[]
): Message => ({
  id: generateMessageId(),
  type,
  content: content.trim(),
  timestamp: new Date(),
  status,
  suggestions
});

// Format timestamp for display
export const formatMessageTime = (timestamp: Date): string => {
  if (isToday(timestamp)) {
    return format(timestamp, 'HH:mm');
  } else if (isYesterday(timestamp)) {
    return `Yesterday ${format(timestamp, 'HH:mm')}`;
  } else {
    return format(timestamp, 'MMM d, HH:mm');
  }
};

// Format relative time (e.g., "2 minutes ago")
export const formatRelativeTime = (timestamp: Date): string => {
  return formatDistanceToNow(timestamp, { addSuffix: true });
};

// Validate message content
export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 2000) {
    return { isValid: false, error: 'Message is too long (max 2000 characters)' };
  }
  
  return { isValid: true };
};

// Generate mock bot response based on user message
export const generateMockResponse = (userMessage: string): string => {
  const messageLower = userMessage.toLowerCase();
  
  // Find a matching response based on triggers
  const matchingResponse = MOCK_RESPONSES.find(response => 
    response.triggers?.some(trigger => messageLower.includes(trigger))
  );
  
  // Return matching response or default
  return matchingResponse?.content || MOCK_RESPONSES.find(r => r.id === 'default')?.content || 
    'I\'m here to help you find great movies! What are you in the mood for?';
};

// Check if should auto-scroll (user is near bottom)
export const shouldAutoScroll = (
  scrollElement: HTMLElement,
  threshold: number = 100
): boolean => {
  const { scrollTop, scrollHeight, clientHeight } = scrollElement;
  return scrollHeight - scrollTop - clientHeight < threshold;
};

// Smooth scroll to bottom
export const scrollToBottom = (
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void => {
  element.scrollTo({
    top: element.scrollHeight,
    behavior
  });
};

// Extract keywords from message for better mock responses
export const extractKeywords = (message: string): string[] => {
  const keywords = message
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Format message for display (handle line breaks, etc.)
export const formatMessageContent = (content: string): string => {
  return content
    .replace(/\n/g, '<br />')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

// Save chat history to localStorage
export const saveChatHistory = (messages: Message[]): void => {
  try {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  } catch (error) {
    console.warn('Failed to save chat history:', error);
  }
};

// Load chat history from localStorage
export const loadChatHistory = (): Message[] => {
  try {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.warn('Failed to load chat history:', error);
  }
  return [];
};

// Clear chat history
export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem('chatHistory');
  } catch (error) {
    console.warn('Failed to clear chat history:', error);
  }
}; 