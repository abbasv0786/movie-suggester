// Language types and interfaces for multilingual support

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: Language[];
  isLoading?: boolean;
}

export interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: Language[];
  variant?: 'dropdown' | 'buttons' | 'compact';
  showNames?: boolean;
  className?: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [languageCode: string]: Translation;
}

// Supported languages configuration
export const SUPPORTED_LANGUAGES: Language[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English', 
    flag: '🇺🇸',
    direction: 'ltr'
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    nativeName: 'Español', 
    flag: '🇪🇸',
    direction: 'ltr'
  },
  { 
    code: 'fr', 
    name: 'French', 
    nativeName: 'Français', 
    flag: '🇫🇷',
    direction: 'ltr'
  },
  { 
    code: 'de', 
    name: 'German', 
    nativeName: 'Deutsch', 
    flag: '🇩🇪',
    direction: 'ltr'
  },
  { 
    code: 'it', 
    name: 'Italian', 
    nativeName: 'Italiano', 
    flag: '🇮🇹',
    direction: 'ltr'
  }
];

// Default translations structure
export const DEFAULT_TRANSLATIONS: Translation = {
  // Common UI elements
  loading: 'Loading...',
  error: 'Error',
  retry: 'Try Again',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',
  
  // Chat interface
  chat: {
    inputPlaceholder: 'Ask me for movie suggestions...',
    sendButton: 'Send',
    typing: 'AI is typing...',
    noMessages: 'Start a conversation to get movie recommendations!',
    errorSending: 'Failed to send message',
  },
  
  // Language selector
  language: {
    selector: 'Language',
    tooltip: 'Select your preferred language',
    change: 'Language changed to',
  },
  
  // Movie suggestions
  movies: {
    suggestions: 'Movie Suggestions',
    noSuggestions: 'No movie suggestions found',
    loading: 'Finding movie suggestions...',
    showMore: 'Show more',
    showLess: 'Show less',
    whySuggested: 'Why this was suggested',
    genre: 'Genre',
    year: 'Year',
    rating: 'Rating',
  },
  
  // Error messages
  errors: {
    networkError: 'Network error. Please check your connection.',
    apiError: 'Server error. Please try again later.',
    timeout: 'Request timed out. Please try again.',
    rateLimited: 'Too many requests. Please wait before trying again.',
    invalidInput: 'Invalid input. Please check your message.',
    sessionExpired: 'Session expired. Please refresh the page.',
  },
  
  // API Demo
  demo: {
    title: 'Movie Suggestion API Demo',
    subtitle: 'Test the complete API integration flow',
    apiStatus: 'API Status',
    connectivity: 'Connectivity',
    connected: 'Connected',
    disconnected: 'Disconnected',
    healthy: 'Healthy',
    testHealth: 'Test Health Endpoint',
    moviePrompt: 'Movie Prompt',
    getMovieSuggestions: 'Get Movie Suggestions',
    gettingSuggestions: 'Getting suggestions...',
    clearResults: 'Clear Results',
    quickTests: 'Quick Tests',
    testHistory: 'Test History',
    requestFailed: 'API Request Failed',
  }
};

// Language utility functions
export const languageUtils = {
  // Get language by code
  getLanguageByCode: (code: string): Language | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  },

  // Check if language is supported
  isLanguageSupported: (code: string): boolean => {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
  },

  // Get language display name
  getDisplayName: (code: string, showNative: boolean = true): string => {
    const language = languageUtils.getLanguageByCode(code);
    if (!language) return code.toUpperCase();
    
    if (showNative && language.nativeName !== language.name) {
      return `${language.name} (${language.nativeName})`;
    }
    return language.name;
  },

  // Detect browser language
  detectBrowserLanguage: (): string => {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    return languageUtils.isLanguageSupported(browserLang) ? browserLang : 'en';
  },

  // Get direction for language
  getDirection: (code: string): 'ltr' | 'rtl' => {
    const language = languageUtils.getLanguageByCode(code);
    return language?.direction || 'ltr';
  },

  // Format language for display
  formatLanguageOption: (language: Language): string => {
    return `${language.flag} ${language.nativeName}`;
  },

  // Get translation key path
  getTranslationKey: (keyPath: string): string[] => {
    return keyPath.split('.');
  },

  // Get nested translation value
  getNestedValue: (obj: Translation, keyPath: string[]): string | undefined => {
    return keyPath.reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  },
};

export default SUPPORTED_LANGUAGES; 