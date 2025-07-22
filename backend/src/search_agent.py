"""
Search Agent - Exa API interface for real-time movie data (COMMENTED OUT FOR FUTURE USE)
"""
import os
import logging
from typing import List, Dict, Any, Optional
# from exa_py import Exa  # COMMENTED OUT - keeping for future implementation
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SearchAgent:
    """Agent responsible for searching real-time movie data using Exa API (CURRENTLY DISABLED)"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize SearchAgent (currently disabled)"""
        # COMMENTED OUT EXA INTEGRATION - keeping for future use
        # self.api_key = api_key or os.getenv("EXA_API_KEY")
        # if not self.api_key:
        #     raise ValueError("EXA_API_KEY not found in environment variables")
        # self.exa = Exa(api_key=self.api_key)
        
        logger.info("SearchAgent initialized but Exa integration is disabled")
        
        # Keywords for future reference when re-enabling Exa
        self.realtime_keywords = [
            # Recent releases
            "2024", "2023", "latest", "new release", "just released", "recently released",
            "newest", "brand new", "came out", "just came out", "this year", "last year",
            
            # Real-time availability
            "currently streaming", "available now", "watch now", "streaming on",
            "on netflix", "on disney+", "on hulu", "on amazon", "where to watch",
            
            # Trending/current
            "trending", "popular now", "box office", "currently popular", "hot right now",
            "what's popular", "current hits", "today's", "this week", "this month",
            
            # Obscure/niche that might need verification
            "obscure", "indie", "independent", "arthouse", "foreign", "international",
            "lesser known", "hidden gem", "underrated"
        ]
        
        # Keywords that indicate LLM knowledge is sufficient
        self.knowledge_base_keywords = [
            # Classic/established
            "classic", "old", "vintage", "retro", "timeless", "legendary", "iconic",
            "80s", "90s", "1980s", "1990s", "2000s", "early 2000s",
            
            # Popular/well-known
            "popular", "famous", "well-known", "blockbuster", "mainstream", "hits",
            "best of all time", "greatest", "top rated", "award winning",
            
            # General genres (LLM has good knowledge)
            "action movies", "comedy films", "romantic comedies", "horror movies", 
            "sci-fi", "fantasy", "drama", "thriller", "animated", "disney", "pixar"
        ]
        
    def should_use_exa_search(self, user_prompt: str) -> bool:
        """
        Determine whether to use Exa API search or rely on LLM knowledge base
        CURRENTLY ALWAYS RETURNS FALSE - EXA IS DISABLED
        
        Args:
            user_prompt: User's movie preference request
            
        Returns:
            False (Exa search is currently disabled)
        """
        # DISABLED FOR NOW - always return False to use LLM knowledge
        logger.info("Exa search is disabled - using LLM knowledge base only")
        return False
        
        # COMMENTED OUT - Original logic for when Exa is re-enabled:
        # prompt_lower = user_prompt.lower()
        # needs_realtime = any(keyword in prompt_lower for keyword in self.realtime_keywords)
        # knowledge_sufficient = any(keyword in prompt_lower for keyword in self.knowledge_base_keywords)
        # 
        # if needs_realtime:
        #     logger.info(f"Would use Exa search: detected real-time keywords in '{user_prompt[:50]}...'")
        #     return True
        # elif knowledge_sufficient:
        #     logger.info(f"Using LLM knowledge: detected established content keywords in '{user_prompt[:50]}...'")
        #     return False
        # else:
        #     logger.info(f"Default to Exa search for ambiguous prompt: '{user_prompt[:50]}...'")
        #     return True
    
    async def search_movies(self, user_prompt: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for movie-related content (CURRENTLY DISABLED - returns empty list)
        
        Args:
            user_prompt: User's movie preference request
            num_results: Number of search results to return
            
        Returns:
            Empty list (Exa search is disabled)
        """
        logger.info("Exa search is disabled - returning empty results to use LLM knowledge only")
        return []  # Always return empty to force LLM knowledge usage
        
        # COMMENTED OUT - Original Exa implementation for future use:
        # try:
        #     if not self.should_use_exa_search(user_prompt):
        #         logger.info("Skipping Exa search - LLM knowledge base is sufficient")
        #         return []
        #     
        #     search_query = self._enhance_movie_query(user_prompt)
        #     logger.info(f"Searching with enhanced query: {search_query}")
        #     
        #     two_years_ago = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")
        #     
        #     response = self.exa.search_and_contents(
        #         query=search_query,
        #         use_autoprompt=True,
        #         num_results=num_results,
        #         start_published_date=two_years_ago,
        #         include_domains=[
        #             "imdb.com", "rottentomatoes.com", "metacritic.com", 
        #             "themoviedb.org", "letterboxd.com", "variety.com",
        #             "hollywoodreporter.com", "entertainment.com"
        #         ]
        #     )
        #     
        #     movie_data = []
        #     for result in response.results:
        #         content = ""
        #         if hasattr(result, 'text') and result.text:
        #             content = result.text[:500]
        #         elif hasattr(result, 'content') and result.content:
        #             content = result.content[:500]
        #         else:
        #             content = result.title
        #         
        #         movie_info = {
        #             "title": result.title,
        #             "url": result.url,
        #             "summary": content,
        #             "published_date": getattr(result, 'published_date', None),
        #             "score": getattr(result, 'score', 0.0)
        #         }
        #         movie_data.append(movie_info)
        #         
        #     logger.info(f"Found {len(movie_data)} movie-related results via Exa API")
        #     return movie_data
        #     
        # except Exception as e:
        #     logger.error(f"Error searching movies: {e}")
        #     return self._get_fallback_results(user_prompt)
    
    def _enhance_movie_query(self, user_prompt: str) -> str:
        """Enhance user prompt for better movie search results (for future Exa use)"""
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
        """Provide fallback movie data if API search fails (for future use)"""
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