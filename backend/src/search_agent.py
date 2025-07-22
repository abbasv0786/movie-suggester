"""
Search Agent - Exa API interface for real-time movie data
"""
import os
import logging
from typing import List, Dict, Any, Optional
from exa_py import Exa
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SearchAgent:
    """Agent responsible for searching real-time movie data using Exa API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize SearchAgent with Exa API key"""
        self.api_key = api_key or os.getenv("EXA_API_KEY")
        if not self.api_key:
            raise ValueError("EXA_API_KEY not found in environment variables")
        
        self.exa = Exa(api_key=self.api_key)
        
    async def search_movies(self, user_prompt: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for movie-related content based on user prompt
        
        Args:
            user_prompt: User's movie preference request
            num_results: Number of search results to return
            
        Returns:
            List of search results with movie information
        """
        try:
            # Enhance search query for movie-specific content
            search_query = self._enhance_movie_query(user_prompt)
            logger.info(f"Searching with enhanced query: {search_query}")
            
            # Get recent results (last 2 years for current movie data)
            two_years_ago = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")
            
            # Search with content extraction
            response = self.exa.search_and_contents(
                query=search_query,
                use_autoprompt=True,
                num_results=num_results,
                start_published_date=two_years_ago,
                include_domains=[
                    "imdb.com", "rottentomatoes.com", "metacritic.com", 
                    "themoviedb.org", "letterboxd.com", "variety.com",
                    "hollywoodreporter.com", "entertainment.com"
                ]
            )
            
            # Process results into structured movie data
            movie_data = []
            for result in response.results:
                # Safely extract content - Exa API uses 'text' attribute for content
                content = ""
                if hasattr(result, 'text') and result.text:
                    content = result.text[:500]
                elif hasattr(result, 'content') and result.content:
                    content = result.content[:500]
                else:
                    content = result.title
                
                movie_info = {
                    "title": result.title,
                    "url": result.url,
                    "summary": content,
                    "published_date": getattr(result, 'published_date', None),
                    "score": getattr(result, 'score', 0.0)
                }
                movie_data.append(movie_info)
                
            logger.info(f"Found {len(movie_data)} movie-related results")
            return movie_data
            
        except Exception as e:
            logger.error(f"Error searching movies: {e}")
            # Return fallback data if search fails
            return self._get_fallback_results(user_prompt)
    
    def _enhance_movie_query(self, user_prompt: str) -> str:
        """Enhance user prompt for better movie search results"""
        movie_keywords = [
            "movies", "films", "cinema", "movie recommendations",
            "film suggestions", "best movies", "latest movies"
        ]
        
        # Add movie context if not already present
        prompt_lower = user_prompt.lower()
        has_movie_context = any(keyword in prompt_lower for keyword in movie_keywords)
        
        if not has_movie_context:
            enhanced_query = f"movie recommendations {user_prompt} films cinema"
        else:
            enhanced_query = user_prompt
            
        return enhanced_query
    
    def _get_fallback_results(self, user_prompt: str) -> List[Dict[str, Any]]:
        """Provide fallback movie data if API search fails"""
        logger.warning("Using fallback movie data due to search failure")
        
        # Basic fallback based on prompt keywords
        fallback_movies = [
            {
                "title": "Popular Movie Recommendation",
                "url": "https://example.com/movies",
                "summary": f"Based on your request for '{user_prompt}', here are some popular movie suggestions.",
                "published_date": datetime.now().strftime("%Y-%m-%d"),
                "score": 0.8
            }
        ]
        return fallback_movies 