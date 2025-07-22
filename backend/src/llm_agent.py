"""
LLM Agent - OpenRouter integration with DeepSeek for intelligent movie suggestions
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class LLMAgent:
    """Agent responsible for generating intelligent movie suggestions using DeepSeek via OpenRouter"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize LLMAgent with OpenRouter API key"""
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")
        
        # Initialize OpenAI client with OpenRouter base URL
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        # Model configuration
        self.model = "deepseek/deepseek-r1:free"
        self.temperature = 0.7
        self.max_tokens = 1500
        
        # Initialize httpx client for streaming (better SSE handling)
        self.http_client = httpx.AsyncClient(timeout=30.0)
        
    async def generate_suggestions(
        self, 
        user_prompt: str, 
        search_context: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, str]]:
        """
        Generate intelligent movie suggestions using DeepSeek
        
        Args:
            user_prompt: User's movie preference request
            search_context: Optional search results (currently not used)
            
        Returns:
            List of movie suggestions with title and reason
        """
        try:
            # Create simple, effective prompt
            system_prompt = self._build_simple_prompt()
            
            logger.info(f"Generating suggestions with DeepSeek model: {self.model}")
            
            # Generate content using DeepSeek via OpenRouter
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                stream=False
            )
            
            # Extract and parse the response
            content = response.choices[0].message.content
            suggestions = self._parse_suggestions(content)
            
            logger.info(f"Generated {len(suggestions)} suggestions successfully")
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions with DeepSeek: {e}")
            return self._get_fallback_suggestions(user_prompt)
    
    async def generate_suggestions_stream(
        self, 
        user_prompt: str, 
        search_context: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming movie suggestions using DeepSeek with proper SSE handling
        
        Args:
            user_prompt: User's movie preference request
            search_context: Optional search results (currently not used)
            
        Yields:
            Streaming response chunks
        """
        try:
            # Create simple, effective prompt
            system_prompt = self._build_simple_prompt()
            
            logger.info(f"Starting streaming suggestions with DeepSeek model: {self.model}")
            
            # Prepare request payload
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
                "stream": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Make streaming request using httpx for better SSE handling
            async with self.http_client.stream(
                "POST",
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers
            ) as response:
                
                if response.status_code != 200:
                    logger.error(f"OpenRouter API error: {response.status_code}")
                    fallback_content = json.dumps(self._get_fallback_suggestions(user_prompt), indent=2)
                    yield fallback_content
                    return
                
                buffer = ""
                async for chunk in response.aiter_text(chunk_size=1024):
                    buffer += chunk
                    
                    # Process complete SSE lines
                    while True:
                        line_end = buffer.find('\n')
                        if line_end == -1:
                            break
                        
                        line = buffer[:line_end].strip()
                        buffer = buffer[line_end + 1:]
                        
                        if line.startswith('data: '):
                            data = line[6:]
                            if data == '[DONE]':
                                return
                            
                            try:
                                data_obj = json.loads(data)
                                content = data_obj["choices"][0]["delta"].get("content")
                                if content:
                                    yield content
                            except (json.JSONDecodeError, KeyError, IndexError):
                                # Skip malformed chunks
                                continue
                    
        except Exception as e:
            logger.error(f"Error streaming suggestions with DeepSeek: {e}")
            # Yield fallback response
            fallback_content = json.dumps(self._get_fallback_suggestions(user_prompt), indent=2)
            yield fallback_content
    
    def _build_simple_prompt(self) -> str:
        """Build simple, effective system prompt for movie recommendations"""
        return """You are a movie and TV show recommendation expert. When users ask for suggestions, provide 3-4 specific recommendations in JSON format.

IMPORTANT RULES:
1. Detect the language of the user's input and respond in the SAME language
2. If they greet you or ask casual questions, respond conversationally 
3. For movie/show requests, provide specific titles with compelling reasons
4. Always return valid JSON format

RESPONSE FORMAT:
For greetings/chat: [{"title": "Chat Response", "reason": "Your friendly response in their language"}]

For movie requests: [
  {"title": "Movie Title", "reason": "Why this matches their preferences"},
  {"title": "Another Movie", "reason": "Another compelling reason"},
  {"title": "Third Movie", "reason": "Third recommendation reason"}
]

Be helpful, accurate, and respond in the user's language. Focus on popular, accessible content unless they specifically ask for niche recommendations."""
    
    def parse_suggestions(self, response_text: str) -> List[Dict[str, str]]:
        """Parse LLM response into structured movie suggestions (public method)"""
        return self._parse_suggestions(response_text)
    
    def _parse_suggestions(self, response_text: str) -> List[Dict[str, str]]:
        """Parse LLM response into structured movie suggestions"""
        try:
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
            logger.warning(f"Error parsing DeepSeek response: {e}")
        
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
                
            # Look for patterns like "1. Movie Title" or numbered lists
            if any(indicator in line for indicator in ['1.', '2.', '3.', '4.']):
                if current_title and current_reason:
                    suggestions.append({
                        'title': current_title,
                        'reason': current_reason.strip()
                    })
                
                # Extract title
                current_title = line.split('.', 1)[-1].strip()
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
    
    def _get_fallback_suggestions(self, user_prompt: str) -> List[Dict[str, str]]:
        """Provide simple fallback suggestions when DeepSeek fails"""
        logger.warning("Using simple fallback suggestions due to DeepSeek failure")
        
        return [
            {
                "title": "The Shawshank Redemption",
                "reason": f"A highly acclaimed drama that's widely considered one of the best films ever made. Based on your request: '{user_prompt}'"
            },
            {
                "title": "Inception", 
                "reason": "A mind-bending sci-fi thriller with excellent storytelling and visual effects that appeals to most audiences."
            },
            {
                "title": "Spirited Away",
                "reason": "A beautiful animated film that's perfect for all ages and showcases incredible storytelling and artistry."
            }
        ]
    
    async def close(self):
        """Close HTTP clients"""
        try:
            await self.http_client.aclose()
        except Exception:
            pass
    
    def __del__(self):
        """Cleanup on deletion"""
        try:
            if hasattr(self, 'http_client') and self.http_client:
                import asyncio
                asyncio.create_task(self.http_client.aclose())
        except Exception:
            pass 