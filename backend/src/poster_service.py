"""
Poster Service - Simple movie/series poster fetching using IMDB API
"""
import os
import logging
from typing import Dict, Any, Optional
import httpx
import asyncio

logger = logging.getLogger(__name__)

class PosterService:
    """Simple service for fetching movie and series posters from IMDB API"""
    
    def __init__(self):
        """Initialize poster service"""
        self.base_url = "https://api.imdbapi.dev/search/titles"
        
        # Configure HTTP client with timeout
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(8.0),
            limits=httpx.Limits(max_keepalive_connections=3)
        )
        
    async def get_poster_data(self, title: str) -> Optional[Dict[str, Any]]:
        """
        Get poster URL and basic data for a movie/series title
        
        Args:
            title: Movie or series title to search for
            
        Returns:
            Dictionary with poster_url, rating, year, type, etc. or None if not found
        """
        try:
            # Clean the title for better search results
            search_title = self._clean_title(title)
            
            # Make API request
            params = {
                "query": search_title,
                "limit": 1
            }
            
            logger.info(f"Searching for poster: {search_title}")
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            titles = data.get("titles", [])
            
            if titles and len(titles) > 0:
                title_data = titles[0]
                
                # Extract poster and metadata
                poster_info = {
                    "poster_url": self._extract_poster_url(title_data),
                    "imdb_id": title_data.get("id", ""),
                    "year": title_data.get("startYear"),
                    "rating": self._extract_rating(title_data),
                    "type": title_data.get("type", "movie"),
                    "imdb_title": title_data.get("primaryTitle", title)
                }
                
                logger.info(f"Found poster for '{title}': {poster_info.get('poster_url', 'No URL')}")
                return poster_info
            
            logger.warning(f"No poster found for title: {title}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching poster for '{title}': {e}")
            return None
    
    async def get_multiple_posters(self, titles: list[str]) -> Dict[str, Optional[Dict[str, Any]]]:
        """
        Get posters for multiple titles concurrently
        
        Args:
            titles: List of movie/series titles
            
        Returns:
            Dictionary mapping title to poster data
        """
        try:
            # Create concurrent tasks for all titles
            tasks = [self.get_poster_data(title) for title in titles]
            
            # Wait for all tasks to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Map results back to titles
            poster_data = {}
            for title, result in zip(titles, results):
                if isinstance(result, Exception):
                    logger.error(f"Error fetching poster for '{title}': {result}")
                    poster_data[title] = None
                else:
                    poster_data[title] = result
            
            logger.info(f"Fetched posters for {len([r for r in poster_data.values() if r])} out of {len(titles)} titles")
            return poster_data
            
        except Exception as e:
            logger.error(f"Error in batch poster fetching: {e}")
            return {title: None for title in titles}
    
    def _clean_title(self, title: str) -> str:
        """Clean title for better search results"""
        try:
            # Remove common prefixes/suffixes that might interfere with search
            title = title.strip()
            
            # Remove year information if present (e.g., "Movie Title (2023)")
            if "(" in title and ")" in title:
                title = title.split("(")[0].strip()
            
            # Remove series indicators that might confuse search
            title = title.replace(" - Season", "").replace(" Season", "")
            
            # Remove episode information
            if " - Episode" in title:
                title = title.split(" - Episode")[0].strip()
            
            return title
            
        except Exception:
            return title
    
    def _extract_poster_url(self, title_data: Dict[str, Any]) -> Optional[str]:
        """Extract poster URL from IMDB API response"""
        try:
            primary_image = title_data.get("primaryImage", {})
            if primary_image and isinstance(primary_image, dict):
                poster_url = primary_image.get("url", "")
                if poster_url and poster_url.startswith("http"):
                    return poster_url
            
            return None
            
        except Exception:
            return None
    
    def _extract_rating(self, title_data: Dict[str, Any]) -> Optional[float]:
        """Extract IMDB rating from API response"""
        try:
            rating_data = title_data.get("rating", {})
            if rating_data and isinstance(rating_data, dict):
                aggregate_rating = rating_data.get("aggregateRating")
                if aggregate_rating:
                    return float(aggregate_rating)
            
            return None
            
        except Exception:
            return None
    
    async def close(self):
        """Close the HTTP client"""
        try:
            await self.client.aclose()
        except Exception:
            pass
    
    def __del__(self):
        """Cleanup on deletion"""
        try:
            if hasattr(self, 'client') and self.client:
                asyncio.create_task(self.client.aclose())
        except Exception:
            pass 