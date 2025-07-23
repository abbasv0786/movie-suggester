import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Message, ChatState, CHAT_CONFIG } from '@/types/chat';
import { 
  createMessage, 
  generateMockResponse, 
  saveChatHistory, 
  loadChatHistory,
  shouldAutoScroll,
  scrollToBottom 
} from '@/utils/messageUtils';
import { useSendSuggestionRequest } from './useApi';
import { SuggestionRequest, MovieSuggestion } from '../types/api';
import { MovieService } from '../services/movieService';

interface UseChatOptions {
  enableMockResponses?: boolean;
  enablePersistence?: boolean;
  initialMessages?: Message[];
  mockResponseDelay?: number;
  enableStreaming?: boolean; // New option for streaming API
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  scrollToBottom: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export const useChat = ({
  enableMockResponses = false, // Changed default to false - use real API
  enablePersistence = true,
  initialMessages = [],
  mockResponseDelay = CHAT_CONFIG.MOCK_RESPONSE_DELAY,
  enableStreaming = true // Enable streaming by default for better UX
}: UseChatOptions = {}): UseChatReturn => {
  // Load initial state from localStorage if persistence is enabled
  const [chatState, setChatState] = useState<ChatState>(() => {
    const persistedMessages = enablePersistence ? loadChatHistory() : [];
    const messages = persistedMessages.length > 0 ? persistedMessages : initialMessages;
    
    return {
      messages,
      isLoading: false,
      error: null
    };
  });

  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  
  // API mutation for real suggestions (fallback for non-streaming)
  const suggestionMutation = useSendSuggestionRequest();
  
  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Track if user has manually scrolled up
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (enablePersistence && chatState.messages.length > 0) {
      saveChatHistory(chatState.messages);
    }
  }, [chatState.messages, enablePersistence]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (!userHasScrolledUp && messagesContainerRef.current) {
      scrollToBottom(messagesContainerRef.current);
    }
  }, [chatState.messages, userHasScrolledUp]);

  // Handle scroll events to detect if user scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const shouldAutoScrollNow = shouldAutoScroll(container, CHAT_CONFIG.AUTO_SCROLL_THRESHOLD);
      setUserHasScrolledUp(!shouldAutoScrollNow);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Add welcome message if no messages exist
  useEffect(() => {
    if (chatState.messages.length === 0 && enableMockResponses) {
      const welcomeMessage = createMessage(
        "Hello! I'm your movie suggestion AI. What kind of movie are you in the mood for today?",
        'bot'
      );
      
      setChatState(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }
  }, [enableMockResponses]);

  // Helper function to format conversational responses
  const formatConversationalResponse = (suggestion: MovieSuggestion): string => {
    return suggestion.reason;
  };

  // Helper function to format movie/series suggestions
  const formatMovieSuggestions = (suggestions: MovieSuggestion[]): string => {
    const movieSuggestions = suggestions.filter(s => s.content_type !== 'chat');
    
    if (movieSuggestions.length === 0) {
      return "I couldn't find any specific movie suggestions for that request.";
    }

    let response = "Here are some great suggestions for you:\n\n";
    
    movieSuggestions.forEach((movie, index) => {
      const contentTypeIcon = movie.content_type === 'series' ? '📺' : '🎬';
      const rating = movie.imdb_rating ? ` (Rating: ${movie.imdb_rating}/10)` : '';
      
      response += `${index + 1}. ${contentTypeIcon} **${movie.title}** (${movie.year})${rating}\n`;
      response += `   *${movie.genre.filter(g => g !== 'recommendation').join(', ') || 'Various genres'}*\n`;
      response += `   ${movie.reason}\n\n`;
    });

    return response;
  };

  // Helper function to create bot response based on content types
  const createBotResponse = (suggestions: MovieSuggestion[]): string => {
    const conversationalSuggestions = suggestions.filter(s => 
      s.content_type === 'chat' || s.genre.includes('conversation')
    );
    const movieSuggestions = suggestions.filter(s => 
      s.content_type === 'movie' || s.content_type === 'series'
    );

    if (conversationalSuggestions.length > 0 && movieSuggestions.length > 0) {
      // Mixed response: conversation + suggestions
      const conversationalPart = conversationalSuggestions
        .map(s => formatConversationalResponse(s))
        .join(' ');
      const moviePart = formatMovieSuggestions(movieSuggestions);
      
      return `${conversationalPart}\n\n${moviePart}`;
    } else if (conversationalSuggestions.length > 0) {
      // Pure conversational response
      return conversationalSuggestions
        .map(s => formatConversationalResponse(s))
        .join(' ');
    } else {
      // Pure movie suggestions
      return formatMovieSuggestions(movieSuggestions);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage = createMessage(content, 'user', 'sending');
    
    // Add user message immediately
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      error: null
    }));

    try {
      // Mark user message as sent
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      }));

      // Show typing indicator for bot response
      setIsTyping(true);
      setStreamingContent('');
      
      if (enableMockResponses) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, mockResponseDelay));
        
        // Generate mock response
        const botResponseContent = generateMockResponse(content);
        const botMessage = createMessage(botResponseContent, 'bot');
        
        // Add bot message
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage]
        }));
      } else {
        // Use real API - prefer streaming for better UX
        try {
          const request: SuggestionRequest = {
            prompt: content // lang parameter removed
          };
          
          if (enableStreaming) {
            // Use streaming API for real-time response
            let streamingMessageId: string | null = null;
            let streamingMessage: any = null;
            
            const response = await MovieService.getSuggestionsStream(
              request,
              // onChunk callback - update streaming content
              (chunk: string) => {
                if (!streamingMessageId) {
                  // Create new streaming message on first chunk
                  streamingMessage = createMessage('', 'bot', 'sending');
                  streamingMessageId = streamingMessage.id;
                  setChatState(prev => ({
                    ...prev,
                    messages: [...prev.messages, streamingMessage]
                  }));
                }
                
                // Update streaming content
                setStreamingContent(prev => {
                  const newContent = prev + chunk;
                  
                  // Update the message in state
                  setChatState(prevState => ({
                    ...prevState,
                    messages: prevState.messages.map(msg => 
                      msg.id === streamingMessageId 
                        ? { ...msg, content: newContent }
                        : msg
                    )
                  }));
                  
                  return newContent;
                });
              },
              // onStatus callback - show status updates
              (status: string) => {
                console.log('Streaming status:', status);
                
                // Optionally update message content with status
                if (streamingMessageId && status) {
                  setChatState(prevState => ({
                    ...prevState,
                    messages: prevState.messages.map(msg => 
                      msg.id === streamingMessageId 
                        ? { ...msg, content: `${streamingContent}\n\n*${status}*` }
                        : msg
                    )
                  }));
                }
              }
            );
            
            // When streaming completes, replace with final formatted response
            const finalContent = createBotResponse(response.suggestions);
            const finalMessage = createMessage(finalContent, 'bot', 'sent', response.suggestions);
            
            // Debug log the final suggestions
            console.log('🎯 Final message suggestions:', response.suggestions);
            console.log('📝 Final message object:', finalMessage);
            
            setChatState(prev => ({
              ...prev,
              messages: streamingMessageId 
                ? prev.messages.map(msg => 
                    msg.id === streamingMessageId ? finalMessage : msg
                  )
                : [...prev.messages, finalMessage]
            }));
          } else {
            // Use regular API as fallback
            const response = await suggestionMutation.mutateAsync(request);
            
            // Create bot message with formatted response
            const botResponseContent = createBotResponse(response.suggestions);
            const botMessage = createMessage(botResponseContent, 'bot', 'sent', response.suggestions);
            
            // Add bot message
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, botMessage]
            }));
          }
        } catch (error: any) {
          console.error('Failed to get movie suggestions:', error);
          
          // Add error message
          const errorMessage = createMessage(
            "Sorry, I'm having trouble getting suggestions right now. Please try again in a moment!", 
            'bot', 
            'error'
          );
          
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, errorMessage],
            error: error.message || 'Failed to get suggestions'
          }));
        }
      }
      
      setIsTyping(false);
      setStreamingContent('');
    } catch (error) {
      // Mark user message as error
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        ),
        error: 'Failed to send message. Please try again.'
      }));
      
      setIsTyping(false);
      setStreamingContent('');
      throw error;
    }
  }, [enableMockResponses, mockResponseDelay, enableStreaming, suggestionMutation]);

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
    
    if (enablePersistence) {
      try {
        localStorage.removeItem('chatHistory');
      } catch (error) {
        console.warn('Failed to clear chat history:', error);
      }
    }
  }, [enablePersistence]);

  const scrollToBottomManually = useCallback(() => {
    if (messagesContainerRef.current) {
      scrollToBottom(messagesContainerRef.current);
      setUserHasScrolledUp(false);
    }
  }, []);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    isTyping,
    sendMessage,
    clearMessages,
    scrollToBottom: scrollToBottomManually,
    messagesEndRef,
    messagesContainerRef
  };
}; 