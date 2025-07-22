import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  LanguageContextType, 
  SUPPORTED_LANGUAGES, 
  DEFAULT_TRANSLATIONS,
  Translation,
  languageUtils 
} from '../types/language';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'movie-suggester-language';

// Create language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

// Translation function
const createTranslationFunction = (
  currentLanguage: string,
  translations: Record<string, Translation>
) => {
  return (key: string, fallback?: string): string => {
    const keyPath = languageUtils.getTranslationKey(key);
    
    // Try to get translation for current language
    const currentTranslations = translations[currentLanguage] || {};
    let value = languageUtils.getNestedValue(currentTranslations, keyPath);
    
    // Fallback to English if not found
    if (!value && currentLanguage !== 'en') {
      const englishTranslations = translations['en'] || DEFAULT_TRANSLATIONS;
      value = languageUtils.getNestedValue(englishTranslations, keyPath);
    }
    
    // Use provided fallback or the key itself
    return value || fallback || key;
  };
};

// Language provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage
}) => {
  // Initialize language state
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Priority order:
    // 1. Provided default language
    // 2. Stored language preference
    // 3. Browser language
    // 4. English fallback
    
    if (defaultLanguage && languageUtils.isLanguageSupported(defaultLanguage)) {
      return defaultLanguage;
    }
    
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && languageUtils.isLanguageSupported(storedLanguage)) {
      return storedLanguage;
    }
    
    const browserLanguage = languageUtils.detectBrowserLanguage();
    return browserLanguage;
  });

  const [translations, setTranslations] = useState<Record<string, Translation>>({
    en: DEFAULT_TRANSLATIONS
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load translations for a language
  const loadTranslations = async (languageCode: string) => {
    if (translations[languageCode]) {
      return; // Already loaded
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would load from translation files
      // For now, we'll use the default English translations
      // and simulate loading other languages
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate loading
      
      let languageTranslations: Translation;
      
      switch (languageCode) {
        case 'es':
          languageTranslations = {
            ...DEFAULT_TRANSLATIONS,
            loading: 'Cargando...',
            error: 'Error',
            retry: 'Intentar de nuevo',
            chat: {
              inputPlaceholder: 'Pídeme sugerencias de películas...',
              sendButton: 'Enviar',
              typing: 'IA está escribiendo...',
              noMessages: '¡Inicia una conversación para obtener recomendaciones de películas!',
              errorSending: 'Error al enviar mensaje',
            },
            language: {
              selector: 'Idioma',
              tooltip: 'Selecciona tu idioma preferido',
              change: 'Idioma cambiado a',
            },
            movies: {
              suggestions: 'Sugerencias de Películas',
              noSuggestions: 'No se encontraron sugerencias de películas',
              loading: 'Buscando sugerencias de películas...',
              showMore: 'Mostrar más',
              showLess: 'Mostrar menos',
              whySuggested: 'Por qué esto fue sugerido',
            },
          };
          break;
        
        case 'fr':
          languageTranslations = {
            ...DEFAULT_TRANSLATIONS,
            loading: 'Chargement...',
            error: 'Erreur',
            retry: 'Réessayer',
            chat: {
              inputPlaceholder: 'Demandez-moi des suggestions de films...',
              sendButton: 'Envoyer',
              typing: 'IA tape...',
              noMessages: 'Commencez une conversation pour obtenir des recommandations de films !',
              errorSending: 'Échec de l\'envoi du message',
            },
            language: {
              selector: 'Langue',
              tooltip: 'Sélectionnez votre langue préférée',
              change: 'Langue changée en',
            },
            movies: {
              suggestions: 'Suggestions de Films',
              noSuggestions: 'Aucune suggestion de film trouvée',
              loading: 'Recherche de suggestions de films...',
              showMore: 'Afficher plus',
              showLess: 'Afficher moins',
              whySuggested: 'Pourquoi cela a été suggéré',
            },
          };
          break;
        
        default:
          languageTranslations = DEFAULT_TRANSLATIONS;
      }
      
      setTranslations(prev => ({
        ...prev,
        [languageCode]: languageTranslations
      }));
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change language
  const setLanguage = async (languageCode: string) => {
    if (!languageUtils.isLanguageSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported`);
      return;
    }

    // Load translations if needed
    await loadTranslations(languageCode);
    
    // Update state
    setCurrentLanguage(languageCode);
    
    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Update document language
    document.documentElement.lang = languageCode;
    
    // Update document direction if needed
    const direction = languageUtils.getDirection(languageCode);
    document.documentElement.dir = direction;
    
    // Dispatch custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: languageCode }
    }));
  };

  // Create translation function
  const t = createTranslationFunction(currentLanguage, translations);

  // Load initial translations
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, []);

  // Update document attributes when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = languageUtils.getDirection(currentLanguage);
  }, [currentLanguage]);

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
    isLoading
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// Hook for language persistence utilities
export const useLanguagePersistence = () => {
  // Get stored language
  const getStoredLanguage = (): string | null => {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  };

  // Clear stored language
  const clearStoredLanguage = (): void => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  };

  // Check if language is stored
  const hasStoredLanguage = (): boolean => {
    return !!localStorage.getItem(LANGUAGE_STORAGE_KEY);
  };

  // Get language preference info
  const getLanguageInfo = () => {
    const stored = getStoredLanguage();
    const browser = languageUtils.detectBrowserLanguage();
    const isStoredSupported = stored ? languageUtils.isLanguageSupported(stored) : false;
    
    return {
      stored,
      browser,
      isStoredSupported,
      effective: isStoredSupported ? stored : browser
    };
  };

  return {
    getStoredLanguage,
    clearStoredLanguage,
    hasStoredLanguage,
    getLanguageInfo
  };
};

// Language event listener hook
export const useLanguageListener = (callback: (language: string) => void) => {
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      callback(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [callback]);
};

export default LanguageContext; 