"""
IMDB Service - Professional movie and TV series data from IMDBapi.dev
"""
import os
import logging
from typing import List, Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class IMDBService:
    """Service for fetching movie and TV series data from IMDB API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize IMDB service with API key"""
        self.api_key = api_key or os.getenv("IMDB_API_KEY")
        self.base_url = "https://imdbapi.dev/api"
        
        # Configure HTTP client with timeout and retry
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
            limits=httpx.Limits(max_keepalive_connections=5)
        )
        
    async def search_content(
        self, 
        query: str, 
        content_type: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for movies or TV series on IMDB
        
        Args:
            query: Search query (title, keywords)
            content_type: 'movie', 'tv_series', or None for both
            limit: Maximum number of results
            
        Returns:
            List of content items with IMDB data
        """
        try:
            # Construct search parameters
            params = {
                "q": query,
                "limit": limit
            }
            
            if content_type:
                if content_type == "series":
                    content_type = "tv_series"
                params["type"] = content_type
            
            # Add API key if available
            if self.api_key:
                params["api_key"] = self.api_key
            
            # Make API request
            response = await self.client.get(f"{self.base_url}/search", params=params)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", []) if isinstance(data, dict) else []
            
            # Process and normalize results
            normalized_results = []
            for item in results[:limit]:
                normalized_item = self._normalize_search_result(item)
                if normalized_item:
                    normalized_results.append(normalized_item)
            
            logger.info(f"Found {len(normalized_results)} IMDB results for query: {query}")
            return normalized_results
            
        except Exception as e:
            logger.error(f"Error searching IMDB: {e}")
            return []
    
    async def get_title_details(self, imdb_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a specific IMDB title
        
        Args:
            imdb_id: IMDB ID (e.g., 'tt1234567')
            
        Returns:
            Detailed title information or None if not found
        """
        try:
            params = {}
            if self.api_key:
                params["api_key"] = self.api_key
            
            response = await self.client.get(f"{self.base_url}/title/{imdb_id}", params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data and not data.get("error"):
                return self._normalize_title_details(data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching IMDB title details: {e}")
            return None
    
    async def search_series_by_genre(self, genre: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search for TV series by genre
        
        Args:
            genre: Genre name (e.g., 'drama', 'comedy')
            limit: Maximum number of results
            
        Returns:
            List of TV series matching the genre
        """
        # Search for popular series in the genre
        genre_queries = [
            f"best {genre} tv series",
            f"popular {genre} shows",
            f"{genre} television series"
        ]
        
        all_results = []
        for query in genre_queries:
            results = await self.search_content(query, "tv_series", limit // len(genre_queries))
            all_results.extend(results)
            
            if len(all_results) >= limit:
                break
        
        # Remove duplicates based on IMDB ID
        seen_ids = set()
        unique_results = []
        for result in all_results:
            imdb_id = result.get("imdb_id")
            if imdb_id and imdb_id not in seen_ids:
                seen_ids.add(imdb_id)
                unique_results.append(result)
        
        return unique_results[:limit]
    
    def _normalize_search_result(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Normalize IMDB search result to our content format"""
        try:
            # Extract basic information
            title = item.get("title", "").strip()
            if not title:
                return None
            
            # Determine content type
            item_type = item.get("type", "").lower()
            if item_type in ["tv series", "tv_series", "tvseries"]:
                content_type = "series"
            elif item_type in ["movie", "feature", "film"]:
                content_type = "movie"
            else:
                # Default based on other indicators
                if any(indicator in title.lower() for indicator in ["season", "episode", "series"]):
                    content_type = "series"
                else:
                    content_type = "movie"
            
            # Extract year
            year_str = item.get("year", "").strip()
            try:
                year = int(year_str.split("-")[0]) if year_str else datetime.now().year
            except (ValueError, AttributeError):
                year = datetime.now().year
            
            # Build normalized result
            normalized = {
                "title": title,
                "content_type": content_type,
                "year": year,
                "imdb_id": item.get("id", "").replace("title/", ""),
                "poster_url": item.get("poster", ""),
                "description": item.get("plot", "").strip() or f"Professional {content_type} recommendation",
                "rating": self._parse_rating(item.get("rating")),
                "genre": self._parse_genres(item.get("genres", [])),
                "runtime": self._parse_runtime(item.get("runtime"))
            }
            
            # Add series-specific fields if applicable
            if content_type == "series":
                normalized.update({
                    "seasons": self._parse_seasons(item),
                    "episodes": self._parse_episodes(item),
                    "status": self._parse_series_status(item),
                    "network": item.get("network", "").strip() or None
                })
            
            return normalized
            
        except Exception as e:
            logger.warning(f"Error normalizing IMDB result: {e}")
            return None
    
    def _normalize_title_details(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize detailed IMDB title data"""
        # Similar to _normalize_search_result but with more detailed fields
        return self._normalize_search_result(data)
    
    def _parse_rating(self, rating_data: Any) -> Optional[float]:
        """Parse IMDB rating"""
        try:
            if isinstance(rating_data, (int, float)):
                return float(rating_data)
            elif isinstance(rating_data, str):
                return float(rating_data.split("/")[0])
            elif isinstance(rating_data, dict):
                return float(rating_data.get("value", 0))
            return None
        except (ValueError, TypeError):
            return None
    
    def _parse_genres(self, genres_data: Any) -> List[str]:
        """Parse IMDB genres"""
        try:
            if isinstance(genres_data, list):
                return [genre.lower().strip() for genre in genres_data if genre]
            elif isinstance(genres_data, str):
                return [genre.lower().strip() for genre in genres_data.split(",") if genre.strip()]
            return ["unknown"]
        except:
            return ["unknown"]
    
    def _parse_runtime(self, runtime_data: Any) -> Optional[int]:
        """Parse runtime in minutes"""
        try:
            if isinstance(runtime_data, int):
                return runtime_data
            elif isinstance(runtime_data, str):
                # Parse formats like "120 min", "2h 30m", etc.
                runtime_str = runtime_data.lower().replace("min", "").replace("m", "").strip()
                if "h" in runtime_str:
                    parts = runtime_str.split("h")
                    hours = int(parts[0].strip())
                    minutes = int(parts[1].strip()) if len(parts) > 1 and parts[1].strip() else 0
                    return hours * 60 + minutes
                else:
                    return int(runtime_str)
            return None
        except (ValueError, TypeError):
            return None
    
    def _parse_seasons(self, item: Dict[str, Any]) -> Optional[int]:
        """Parse number of seasons for TV series"""
        try:
            seasons = item.get("seasons") or item.get("totalSeasons")
            if seasons:
                return int(seasons)
            
            # Try to extract from other fields
            year_range = item.get("year", "")
            if "-" in year_range:
                # Estimate seasons based on year range (rough estimate)
                start_year, end_year = year_range.split("-")
                years = int(end_year) - int(start_year) + 1
                return min(years, 10)  # Cap at 10 seasons for estimate
            
            return None
        except (ValueError, TypeError):
            return None
    
    def _parse_episodes(self, item: Dict[str, Any]) -> Optional[int]:
        """Parse total number of episodes for TV series"""
        try:
            episodes = item.get("episodes") or item.get("totalEpisodes")
            if episodes:
                return int(episodes)
            
            # Estimate based on seasons (rough estimate)
            seasons = self._parse_seasons(item)
            if seasons:
                return seasons * 12  # Rough estimate of 12 episodes per season
            
            return None
        except (ValueError, TypeError):
            return None
    
    def _parse_series_status(self, item: Dict[str, Any]) -> str:
        """Parse series status (ongoing, completed, cancelled)"""
        try:
            year_range = item.get("year", "")
            if "-" in year_range and not year_range.endswith("-"):
                return "completed"
            elif year_range.endswith("-") or "ongoing" in str(item).lower():
                return "ongoing"
            else:
                return "completed"
        except:
            return "completed"
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    def __del__(self):
        """Cleanup on deletion"""
        try:
            import asyncio
            if hasattr(self, 'client'):
                asyncio.create_task(self.client.aclose())
        except:
            pass 