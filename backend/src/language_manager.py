"""
Language Manager - LLM translation handling and language detection
"""
import os
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)

class LanguageManager:
    """Agent responsible for handling multilingual translation using LLM"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize LanguageManager with Gemini API key"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize the model for translation
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-001',
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,  # Lower temperature for more consistent translations
                top_p=0.9,
                top_k=20,
                max_output_tokens=1024,
            ),
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        
        # Language code mappings
        self.language_names = {
            "en": "English",
            "es": "Spanish",
            "fr": "French", 
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese",
            "ru": "Russian",
            "ar": "Arabic",
            "hi": "Hindi"
        }
    
    async def detect_language(self, text: str) -> str:
        """
        Detect the language of input text
        
        Args:
            text: Text to analyze
            
        Returns:
            ISO 639-1 language code (e.g., 'en', 'es')
        """
        try:
            prompt = f"""Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de').

Examples:
- "Hello world" → en
- "Hola mundo" → es
- "Bonjour le monde" → fr

TEXT: {text[:200]}

LANGUAGE CODE:"""

            response = self.model.generate_content(prompt)
            detected_lang = response.text.strip().lower()
            
            # Validate the detected language code
            if detected_lang in self.language_names:
                logger.info(f"Detected language: {detected_lang}")
                return detected_lang
            else:
                logger.warning(f"Invalid language code detected: {detected_lang}, defaulting to 'en'")
                return "en"
                
        except Exception as e:
            logger.error(f"Error detecting language: {e}")
            return "en"  # Default to English
    
    async def translate_from_english(self, text: str, target_language: str) -> str:
        """
        Translate text from English to target language
        
        Args:
            text: English text to translate
            target_language: Target language code
            
        Returns:
            Translated text in target language
        """
        try:
            # Skip translation if target is English
            if target_language == "en":
                return text
            
            target_lang_name = self.language_names.get(target_language, target_language)
            
            prompt = f"""Translate the following English text to {target_lang_name}.

IMPORTANT INSTRUCTIONS:
- Maintain the original meaning and tone
- For movie recommendations, adapt cultural context appropriately
- Keep movie titles in their commonly known form in the target language
- Use natural, fluent language that sounds native
- Return ONLY the translation, no additional text

ENGLISH TEXT:
{text}

{target_lang_name.upper()} TRANSLATION:"""

            response = self.model.generate_content(prompt)
            translation = response.text.strip()
            
            logger.info(f"Translated from English to {target_language}")
            return translation
            
        except Exception as e:
            logger.error(f"Error translating to {target_language}: {e}")
            return text  # Return original text if translation fails
    
    async def process_multilingual_request(self, text: str, target_language: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a multilingual request with automatic language detection
        
        Args:
            text: Input text in any supported language
            target_language: Desired output language (if None, uses detected language)
            
        Returns:
            Dictionary with processed text and language information
        """
        try:
            # Detect input language automatically
            detected_language = await self.detect_language(text)
            logger.info(f"Auto-detected language: {detected_language}")
            
            # Use detected language as target if not specified, fallback to English
            if target_language is None:
                target_language = detected_language if detected_language in self.language_names else "en"
            
            # For now, use the input text as English text (can be enhanced with translation)
            english_text = text
            
            # Prepare result
            result = {
                "original_text": text,
                "detected_language": detected_language,
                "english_text": english_text,
                "target_language": target_language,
                "requires_output_translation": target_language != "en"
            }
            
            logger.info(f"Processed multilingual request: {detected_language} → en → {target_language}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing multilingual request: {e}")
            # Fallback to English when detection fails
            return {
                "original_text": text,
                "detected_language": "en",
                "english_text": text,
                "target_language": "en",
                "requires_output_translation": False,
                "error": str(e)
            } 