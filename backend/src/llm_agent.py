"""
LLM Agent - Gemini 2.5 Flash integration for intelligent movie suggestions
"""
import os
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)

class LLMAgent:
    """Agent responsible for generating intelligent movie suggestions using Gemini 2.5 Flash"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize LLMAgent with Gemini API key"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-001',
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048,
            ),
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        
    async def generate_suggestions(
        self, 
        user_prompt: str, 
        search_context: List[Dict[str, Any]], 
        target_language: str = "en"
    ) -> List[Dict[str, str]]:
        """
        Generate intelligent movie suggestions using Gemini 2.5 Flash
        
        Args:
            user_prompt: User's original movie preference request
            search_context: Real-time movie data from SearchAgent
            target_language: Target language for responses (en, es, etc.)
            
        Returns:
            List of movie suggestions with title and reason
        """
        try:
            # Construct the comprehensive prompt
            system_prompt = self._build_system_prompt(target_language)
            user_context = self._build_user_context(user_prompt, search_context)
            
            logger.info(f"Generating suggestions for language: {target_language}")
            
            # Generate content using Gemini
            response = self.model.generate_content(
                f"{system_prompt}\n\n{user_context}"
            )
            
            # Parse the response into structured suggestions
            suggestions = self._parse_suggestions(response.text)
            
            logger.info(f"Generated {len(suggestions)} suggestions")
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            # Return fallback suggestions if LLM fails
            return self._get_fallback_suggestions(user_prompt, target_language)
    
    def _build_system_prompt(self, target_language: str) -> str:
        """Build system prompt based on target language"""
        language_instructions = {
            "en": "Respond in English with clear, engaging explanations.",
            "es": "Responde en español con explicaciones claras y atractivas.",
            "fr": "Répondez en français avec des explications claires et engageantes.",
            "de": "Antworten Sie auf Deutsch mit klaren, ansprechenden Erklärungen.",
            "it": "Rispondi in italiano con spiegazioni chiare e coinvolgenti.",
            "pt": "Responda em português com explicações claras e envolventes.",
            "ja": "明確で魅力的な説明で日本語で回答してください。",
            "ko": "명확하고 매력적인 설명으로 한국어로 답변하세요.",
            "zh": "用中文回答，提供清晰、引人入胜的解释。"
        }
        
        lang_instruction = language_instructions.get(target_language, language_instructions["en"])
        
        return f"""You are an expert movie recommendation AI with deep knowledge of cinema from all eras and cultures. 
Your task is to provide personalized movie suggestions based on user preferences and real-time movie data.

INSTRUCTIONS:
1. Analyze the user's request and the provided real-time movie context
2. Suggest 3-4 movies that closely match their preferences
3. For each suggestion, provide the exact movie title and a compelling 2-3 sentence explanation
4. Use the real-time data to ensure recommendations are current and relevant
5. {lang_instruction}

OUTPUT FORMAT:
Return exactly in this JSON format:
[
  {{"title": "Movie Title", "reason": "Compelling explanation..."}},
  {{"title": "Another Movie", "reason": "Another explanation..."}}
]

IMPORTANT: Only return the JSON array, no additional text or formatting."""
    
    def _build_user_context(self, user_prompt: str, search_context: List[Dict[str, Any]]) -> str:
        """Build user context with search data"""
        context_text = f"USER REQUEST: {user_prompt}\n\n"
        context_text += "REAL-TIME MOVIE DATA:\n"
        
        for i, movie in enumerate(search_context[:5], 1):
            context_text += f"{i}. {movie['title']}\n"
            context_text += f"   Summary: {movie['summary'][:200]}...\n"
            context_text += f"   Source: {movie['url']}\n\n"
        
        context_text += "Based on this real-time data and the user's request, provide personalized movie recommendations:"
        
        return context_text
    
    def _parse_suggestions(self, response_text: str) -> List[Dict[str, str]]:
        """Parse LLM response into structured movie suggestions"""
        try:
            import json
            
            # Clean the response text
            cleaned_text = response_text.strip()
            
            # Find JSON array in the response
            start_idx = cleaned_text.find('[')
            end_idx = cleaned_text.rfind(']') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_text = cleaned_text[start_idx:end_idx]
                suggestions = json.loads(json_text)
                
                # Validate structure
                valid_suggestions = []
                for suggestion in suggestions:
                    if isinstance(suggestion, dict) and 'title' in suggestion and 'reason' in suggestion:
                        valid_suggestions.append({
                            'title': str(suggestion['title']),
                            'reason': str(suggestion['reason'])
                        })
                
                return valid_suggestions
            
        except Exception as e:
            logger.warning(f"Error parsing LLM response: {e}")
        
        # Fallback parsing for non-JSON responses
        return self._parse_fallback_format(response_text)
    
    def _parse_fallback_format(self, response_text: str) -> List[Dict[str, str]]:
        """Fallback parsing for non-JSON formatted responses"""
        suggestions = []
        lines = response_text.split('\n')
        
        current_title = None
        current_reason = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for patterns like "1. Movie Title" or "Title:"
            if any(indicator in line.lower() for indicator in ['title:', '1.', '2.', '3.', '4.']):
                if current_title and current_reason:
                    suggestions.append({
                        'title': current_title,
                        'reason': current_reason.strip()
                    })
                
                # Extract title
                current_title = line.split(':', 1)[-1].strip()
                if current_title.startswith(('1.', '2.', '3.', '4.')):
                    current_title = current_title[2:].strip()
                current_reason = ""
            else:
                current_reason += f" {line}"
        
        # Add the last suggestion
        if current_title and current_reason:
            suggestions.append({
                'title': current_title,
                'reason': current_reason.strip()
            })
        
        return suggestions[:4]  # Limit to 4 suggestions
    
    def _get_fallback_suggestions(self, user_prompt: str, target_language: str) -> List[Dict[str, str]]:
        """Provide fallback suggestions if LLM fails"""
        logger.warning("Using fallback suggestions due to LLM failure")
        
        fallback_data = {
            "en": [
                {
                    "title": "The Shawshank Redemption",
                    "reason": "A timeless classic about hope and friendship that resonates with most movie preferences."
                },
                {
                    "title": "Inception",
                    "reason": "A mind-bending thriller that offers complex storytelling and stunning visuals."
                },
                {
                    "title": "Parasite",
                    "reason": "An acclaimed international film that blends social commentary with thrilling storytelling."
                }
            ],
            "es": [
                {
                    "title": "El Libro de la Vida",
                    "reason": "Una hermosa película animada que celebra la cultura mexicana y las tradiciones familiares."
                },
                {
                    "title": "Roma",
                    "reason": "Una obra maestra cinematográfica que retrata la vida doméstica en México con sensibilidad."
                },
                {
                    "title": "El Laberinto del Fauno",
                    "reason": "Un cuento de hadas oscuro que combina fantasía y realidad de manera magistral."
                }
            ]
        }
        
        return fallback_data.get(target_language, fallback_data["en"]) 