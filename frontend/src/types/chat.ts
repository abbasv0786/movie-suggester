// Chat system TypeScript interfaces and types
import { MovieSuggestion } from './api';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  suggestions?: MovieSuggestion[]; // New field for movie cards
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  addMessage: (content: string, type: 'user' | 'bot') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  showAvatar?: boolean;
}

export interface ChatInterfaceProps {
  initialMessages?: Message[];
  onMessageSend?: (message: string) => void;
  enableMockResponses?: boolean;
  className?: string;
}

export interface ChatInterfaceRef {
  clearMessages: () => void;
}

// Utility types for responsive design
export type BreakpointSize = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  mobile: string;
  tablet: string;
  desktop: string;
}

// Chat configuration constants
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  AUTO_SCROLL_THRESHOLD: 100,
  TYPING_DELAY: 1000,
  MOCK_RESPONSE_DELAY: 1500,
  BREAKPOINTS: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px'
  }
} as const;

// Mock response types for testing
export interface MockResponse {
  id: string;
  content: string;
  delay?: number;
  triggers?: string[];
}

export const MOCK_RESPONSES: MockResponse[] = [
  {
    id: 'greeting',
    content: 'Hello! I\'m your movie suggestion AI. What kind of movie are you in the mood for today?',
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greetings']
  },
  {
    id: 'action',
    content: 'Awesome! Action movies are thrilling! 🎬 I\'d recommend checking out "John Wick", "Mad Max: Fury Road", or "Mission Impossible". Do you prefer modern action or classic films?',
    triggers: ['action', 'adventure', 'thriller', 'fight', 'car chase', 'explosion', 'superhero']
  },
  {
    id: 'comedy',
    content: 'Great choice for a good laugh! 😄 I suggest "The Grand Budapest Hotel", "Superbad", or "Knives Out". Are you looking for witty dialogue or slapstick humor?',
    triggers: ['comedy', 'funny', 'laugh', 'humor', 'hilarious', 'joke', 'romantic comedy', 'romcom']
  },
  {
    id: 'horror',
    content: 'Ooh, feeling spooky! 🎃 Try "Hereditary", "Get Out", or "A Quiet Place". Do you prefer psychological horror or jump scares?',
    triggers: ['horror', 'scary', 'frightening', 'spooky', 'monster', 'ghost', 'zombie']
  },
  {
    id: 'romance',
    content: 'Looking for some love! 💕 I recommend "The Princess Bride", "When Harry Met Sally", or "La La Land". Classic romance or modern love story?',
    triggers: ['romance', 'romantic', 'love', 'date night', 'relationship', 'couple']
  },
  {
    id: 'scifi',
    content: 'Sci-fi is amazing! 🚀 Check out "Blade Runner 2049", "Interstellar", or "Ex Machina". Are you into space exploration or futuristic tech?',
    triggers: ['sci-fi', 'science fiction', 'space', 'future', 'robot', 'alien', 'technology']
  },
  {
    id: 'drama',
    content: 'Deep emotional stories! 🎭 I suggest "Parasite", "Manchester by the Sea", or "Moonlight". Looking for something heavy or more uplifting?',
    triggers: ['drama', 'emotional', 'deep', 'serious', 'character study', 'oscars']
  },
  {
    id: 'recommendation',
    content: 'I\'d love to help you find the perfect movie! 🎯 To give you the best recommendations, tell me: What genre interests you? Any favorite actors? Mood you\'re in?',
    triggers: ['recommend', 'suggestion', 'what should i watch', 'movie', 'film', 'good movie', 'best movie']
  },
  {
    id: 'default',
    content: 'Interesting! 🤔 I\'m here to help you discover amazing movies! Try asking about specific genres like "action", "comedy", "horror", or just say "recommend me something" and I\'ll help you find the perfect film!',
    triggers: []
  }
]; 