"""
Prompt Engine - LLM prompt construction and context injection
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PromptEngine:
    """Engine responsible for constructing structured LLM prompts with search context"""
    
    def __init__(self):
        """Initialize PromptEngine"""
        self.prompt_templates = {
            "movie_recommendation": self._get_movie_recommendation_template(),
            "system_instructions": self._get_system_instructions()
        }
    
    def construct_movie_prompt(
        self, 
        user_request: str, 
        search_context: List[Dict[str, Any]], 
        target_language: str = "en"
    ) -> str:
        """
        Construct conversation-aware prompt for movie recommendations and chat
        
        Args:
            user_request: Original user's request (movie preferences or conversational)
            search_context: Real-time movie data from SearchAgent (may be empty for LLM knowledge use)
            target_language: Target language for responses
            
        Returns:
            Structured prompt for LLM with conversation intelligence
        """
        try:
            # Determine if we have real-time context or should use LLM knowledge
            has_realtime_data = bool(search_context)
            
            # Build context sections
            context_section = self._build_context_section(search_context)
            language_instruction = self._get_language_instruction(target_language)
            
            # Construct conversation-aware prompt
            prompt = f"""You are an expert movie and TV series recommendation AI with deep knowledge of cinema and television from all eras and cultures. You are also a friendly conversational assistant.

{language_instruction}

USER INPUT:
{user_request}

{context_section}

INSTRUCTIONS:
1. CONVERSATION DETECTION: First determine if this is a conversational input (greeting, help request, casual chat) or a movie/series request
2. CONVERSATION HANDLING: If conversational, respond naturally and warmly, inviting them to describe their preferences
3. MOVIE/SERIES RECOMMENDATIONS: If requesting recommendations, provide 3-4 personalized suggestions
4. MIXED INPUTS: If combining greeting + request, acknowledge greeting briefly then focus on suggestions

RESPONSE GUIDELINES:
- For greetings/casual: Use {{"title": "Chat Response", "reason": "Your warm conversational response"}}
- For help requests: Use {{"title": "Help Response", "reason": "Explanation of your capabilities with examples"}}
- For movie/series requests: Use specific titles and compelling explanations
- Always be warm, helpful, and engaging

OUTPUT FORMAT:
Return exactly in this JSON format:
[
  {{"title": "Title", "reason": "Response or explanation..."}},
  {{"title": "Another Title", "reason": "Another explanation..."}}
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting."""

            logger.info(f"Constructed conversation-aware prompt for language: {target_language}, realtime_data: {has_realtime_data}")
            return prompt
            
        except Exception as e:
            logger.error(f"Error constructing prompt: {e}")
            return self._get_fallback_prompt(user_request, target_language)
    
    def _build_context_section(self, search_context: List[Dict[str, Any]]) -> str:
        """Build context section for conversation-aware prompts"""
        if not search_context:
            return """KNOWLEDGE SOURCE:
Use your extensive built-in knowledge of movies and TV series. The system has determined that real-time search is not needed for this request, so rely on your training data for recommendations."""
        
        context_text = "REAL-TIME MOVIE DATA:\n"
        for i, movie in enumerate(search_context[:5], 1):
            context_text += f"\n{i}. TITLE: {movie.get('title', 'Unknown')}\n"
            context_text += f"   SUMMARY: {movie.get('summary', 'No summary available')[:300]}...\n"
            
            if movie.get('published_date'):
                context_text += f"   DATE: {movie['published_date']}\n"
            if movie.get('score'):
                context_text += f"   RELEVANCE: {movie['score']:.2f}\n"
            if movie.get('url'):
                context_text += f"   SOURCE: {movie['url']}\n"
            context_text += "\n"
        
        context_text += "\nUSE this real-time data to ensure your recommendations are current and relevant."
        return context_text
    
    def _get_language_instruction(self, target_language: str) -> str:
        """Get language-specific instructions"""
        instructions = {
            "en": "LANGUAGE: Respond in English with clear, engaging explanations.",
            "es": "IDIOMA: Responde en español con explicaciones claras y atractivas.",
            "fr": "LANGUE: Répondez en français avec des explications claires et engageantes.",
            "de": "SPRACHE: Antworten Sie auf Deutsch mit klaren, ansprechenden Erklärungen.",
            "it": "LINGUA: Rispondi in italiano con spiegazioni chiare e coinvolgenti.",
            "pt": "IDIOMA: Responda em português com explicações claras e envolventes.",
            "ja": "言語：明確で魅力的な説明で日本語で回答してください。",
            "ko": "언어: 명확하고 매력적인 설명으로 한국어로 답변하세요.",
            "zh": "语言：用中文回答，提供清晰、引人入胜的解释。",
            "ru": "ЯЗЫК: Отвечайте на русском языке с четкими, увлекательными объяснениями.",
            "ar": "اللغة: أجب باللغة العربية مع تفسيرات واضحة وجذابة.",
            "hi": "भाषा: स्पष्ट, आकर्षक स्पष्टीकरण के साथ हिंदी में उत्तर दें।"
        }
        return instructions.get(target_language, instructions["en"])
    
    def construct_translation_prompt(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Construct prompt for translation tasks
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translation prompt
        """
        return f"""Translate the following text from {source_lang} to {target_lang}.
        
Maintain the original meaning, tone, and context. For movie-related content, preserve movie titles and technical terms appropriately.

TEXT TO TRANSLATE:
{text}

TRANSLATION:"""
    
    def construct_language_detection_prompt(self, text: str) -> str:
        """
        Construct prompt for language detection
        
        Args:
            text: Text to analyze
            
        Returns:
            Language detection prompt
        """
        return f"""Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de').

TEXT:
{text}

LANGUAGE CODE:"""
    
    def enhance_search_query(self, user_request: str) -> str:
        """
        Enhance user request for better search results
        
        Args:
            user_request: Original user request
            
        Returns:
            Enhanced search query
        """
        movie_keywords = [
            "movies", "films", "cinema", "movie", "film", 
            "watch", "recommend", "suggestion", "best", "latest"
        ]
        
        request_lower = user_request.lower()
        has_movie_context = any(keyword in request_lower for keyword in movie_keywords)
        
        if not has_movie_context:
            enhanced = f"movie recommendations {user_request} films cinema reviews"
        else:
            enhanced = f"{user_request} movie reviews film recommendations"
        
        logger.info(f"Enhanced search query: {enhanced}")
        return enhanced
    
    def _get_movie_recommendation_template(self) -> str:
        """Get the base template for movie recommendations"""
        return """Based on the user request and available movie data, provide personalized recommendations."""
    
    def _get_system_instructions(self) -> str:
        """Get system instructions for the LLM"""
        return """You are an expert movie recommendation system with knowledge of global cinema."""
    
    def _get_fallback_prompt(self, user_request: str, target_language: str) -> str:
        """Provide fallback prompt if construction fails"""
        logger.warning("Using fallback prompt due to construction error")
        
        lang_instruction = self._get_language_instruction(target_language)
        
        return f"""{lang_instruction}

USER REQUEST: {user_request}

Please provide 3 movie recommendations based on this request. Return your response as a JSON array:
[
  {{"title": "Movie Title", "reason": "Why this movie matches the request"}}
]"""
    
    def format_context_for_logging(self, context: List[Dict[str, Any]]) -> str:
        """Format context data for logging purposes"""
        if not context:
            return "No context available"
        
        summary = f"Context summary: {len(context)} items\n"
        for i, item in enumerate(context[:3], 1):
            title = item.get('title', 'Unknown')[:50]
            summary += f"{i}. {title}...\n"
        
        if len(context) > 3:
            summary += f"... and {len(context) - 3} more items"
        
        return summary 