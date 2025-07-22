"""
Movie Suggestion Engine - AI-based recommendation system
"""
import re
import random
from typing import List, Dict, Any, Set
from dataclasses import dataclass

from src.movie_data import AIContentDatabase, Movie
from src.constants import (
    DEFAULT_MIN_SUGGESTIONS, DEFAULT_MAX_SUGGESTIONS, MAX_KEYWORD_SCORE,
    GENRE_SCORE_MULTIPLIER, FALLBACK_SCORE, EMERGENCY_FALLBACK_SCORE,
    RECENT_MOVIE_THRESHOLD_YEARS, MODERATE_RECENT_THRESHOLD_YEARS,
    RECENT_MOVIE_BONUS, MODERATE_RECENT_BONUS, AI_FALLBACK_ENABLED,
    AI_FALLBACK_MIN_SUGGESTIONS, AI_FALLBACK_PROMPT
)


@dataclass
class SuggestionResult:
    """Result from suggestion algorithm with movie and reasoning"""
    movie: Movie
    reason: str
    relevance_score: float


class AIMovieSuggestionEngine:
    """AI-based engine for generating movie suggestions using LLM and external APIs"""
    
    def __init__(self, min_suggestions: int = DEFAULT_MIN_SUGGESTIONS, max_suggestions: int = DEFAULT_MAX_SUGGESTIONS):
        """Initialize AI-based suggestion engine"""
        self.ai_content_db = AIContentDatabase()
        self.min_suggestions = min_suggestions
        self.max_suggestions = max_suggestions
        
    def suggest_movies(self, prompt: str, count: int = None) -> List[SuggestionResult]:
        """
        Generate AI-based movie/series suggestions
        
        NOTE: This method is kept for backward compatibility but now returns empty list.
        The system should use LLM-based recommendations through the main API flow.
        
        Args:
            prompt: User's content preference description
            count: Number of suggestions to return (defaults to min_suggestions)
            
        Returns:
            Empty list - use AI-based recommendations via LLM instead
        """
        # Return empty list to force usage of AI-based recommendations
        # This ensures the system doesn't fallback to hardcoded content
        return []
    
    def extract_user_preferences(self, prompt: str) -> Dict[str, Any]:
        """Extract user preferences for AI prompt construction"""
        prompt_lower = prompt.lower()
        
        # Detect content type preference
        content_preference = self.ai_content_db.detect_content_preference(prompt)
        
        # Extract genre preferences using keyword mapping
        detected_genres = self._extract_genres_from_prompt(prompt)
        
        # Detect conversation vs movie request
        is_conversational = self._is_conversational_input(prompt)
        
        return {
            "content_preference": content_preference,
            "detected_genres": list(detected_genres),
            "is_conversational": is_conversational,
            "original_prompt": prompt
        }
    
    def _extract_genres_from_prompt(self, prompt: str) -> Set[str]:
        """Extract genre keywords from user prompt using AI content database"""
        prompt_lower = prompt.lower()
        detected_genres = set()
        
        genre_keywords = self.ai_content_db.get_genre_keywords()
        
        for genre, keywords in genre_keywords.items():
            for keyword in keywords:
                if keyword in prompt_lower:
                    detected_genres.add(genre)
                    break  # Don't double-count same genre
        
        # Handle special cases and synonyms
        detected_genres = self._handle_special_genre_cases(prompt_lower, detected_genres)
        
        return detected_genres
    
    def _handle_special_genre_cases(self, prompt_lower: str, genres: Set[str]) -> Set[str]:
        """Handle special cases and synonyms in genre detection"""
        # Handle compound concepts
        if 'superhero' in prompt_lower or 'marvel' in prompt_lower or 'dc' in prompt_lower:
            genres.add('action')
            
        if 'rom-com' in prompt_lower or 'romantic comedy' in prompt_lower:
            genres.add('romance')
            genres.add('comedy')
            
        if 'psychological' in prompt_lower:
            genres.add('thriller')
            
        if 'feel-good' in prompt_lower or 'uplifting' in prompt_lower:
            genres.add('comedy')
            genres.add('family')
            
        return genres
    
    def _is_conversational_input(self, prompt: str) -> bool:
        """Detect if input is conversational rather than a movie request"""
        prompt_lower = prompt.lower().strip()
        
        # Common conversational greetings and inputs
        conversational_patterns = [
            # Greetings
            r'^(hi|hello|hey|hii|hai|hiya|howdy|sup)\.?$',
            r'^(good morning|good afternoon|good evening)\.?$',
            
            # Help requests
            r'^(help|what can you do|how do you work|what are you).*',
            
            # General questions
            r'^(who are you|what is this|explain).*',
            
            # Single word greetings
            r'^(hi|hello|hey|hii|hai)$'
        ]
        
        # Check for conversational patterns
        for pattern in conversational_patterns:
            if re.match(pattern, prompt_lower):
                return True
        
        # Check for movie/series keywords that indicate a request
        content_keywords = [
            'movie', 'film', 'watch', 'recommend', 'suggest', 'series', 'show',
            'tv', 'cinema', 'action', 'comedy', 'drama', 'horror', 'romance'
        ]
        
        has_content_keywords = any(keyword in prompt_lower for keyword in content_keywords)
        
        # If it's a short message without content keywords, likely conversational
        if len(prompt.split()) <= 3 and not has_content_keywords:
            return True
            
        return False
    
    def get_ai_fallback_prompt(self) -> str:
        """Get the AI fallback prompt for emergency scenarios"""
        if AI_FALLBACK_ENABLED:
            return AI_FALLBACK_PROMPT
        else:
            return "Recommend popular movies or TV series"


# Backward compatibility alias
MovieSuggestionEngine = AIMovieSuggestionEngine 