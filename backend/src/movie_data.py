"""
Content Database - AI-based movie and TV series recommendation system
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Content:
    """Unified content structure for both movies and TV series"""
    title: str
    genre: List[str]
    description: str
    year: int  # For series: start year
    content_type: str  # "movie" or "series"
    director: Optional[str] = None
    # Series-specific fields
    seasons: Optional[int] = None
    episodes: Optional[int] = None
    end_year: Optional[int] = None
    network: Optional[str] = None
    status: Optional[str] = None  # "ongoing", "completed", "cancelled"
    # IMDB API fields
    imdb_id: Optional[str] = None
    poster_url: Optional[str] = None
    rating: Optional[float] = None
    runtime: Optional[int] = None  # Minutes per episode/movie


# Backward compatibility alias
Movie = Content


class AIContentDatabase:
    """AI-based content recommendation system with keyword mapping for prompt understanding"""
    
    def __init__(self):
        """Initialize with genre keyword mapping for AI prompt understanding"""
        self.genre_keywords = self._build_genre_keyword_map()
    
    # Backward compatibility properties
    @property
    def movies(self):
        """Backward compatibility: return empty list since we use AI recommendations"""
        return []
    
    @property
    def content(self):
        """Backward compatibility: return empty list since we use AI recommendations"""
        return []
    
    def _build_genre_keyword_map(self) -> Dict[str, List[str]]:
        """Build mapping of keywords to genre categories for AI prompt understanding"""
        return {
            'action': ['action', 'thriller', 'adventure', 'fight', 'combat', 'explosive', 'intense', 'superhero'],
            'comedy': ['funny', 'comedy', 'humor', 'laugh', 'hilarious', 'witty', 'amusing', 'sitcom'],
            'animated': ['animated', 'cartoon', 'animation', 'pixar', 'disney', 'anime'],
            'sci-fi': ['sci-fi', 'science', 'space', 'future', 'robot', 'ai', 'technology'],
            'romance': ['love', 'romance', 'romantic', 'date', 'relationship', 'couple'],
            'horror': ['horror', 'scary', 'frightening', 'spooky', 'terrifying', 'creepy'],
            'drama': ['drama', 'emotional', 'serious', 'touching', 'heartbreaking', 'biography'],
            'family': ['family', 'kids', 'children', 'wholesome', 'all ages'],
            'mystery': ['mystery', 'detective', 'puzzle', 'investigation', 'crime'],
            'adventure': ['adventure', 'journey', 'exploration', 'quest', 'travel'],
            'musical': ['musical', 'music', 'songs', 'singing', 'dance'],
            'anthology': ['anthology', 'collection', 'stories']
        }
    
    def get_content_type_keywords(self) -> Dict[str, List[str]]:
        """Get keywords for detecting content type preferences"""
        return {
            'series': ['series', 'show', 'tv show', 'television', 'season', 'episode', 
                      'binge', 'binge-watch', 'streaming series', 'tv series', 'watch series'],
            'movie': ['movie', 'film', 'cinema', 'theatrical', 'feature film', 'motion picture']
        }
    
    def detect_content_preference(self, prompt: str) -> str:
        """Detect if user wants movies-only, series-only, or both"""
        prompt_lower = prompt.lower()
        keywords = self.get_content_type_keywords()
        
        has_movie_keywords = any(keyword in prompt_lower for keyword in keywords['movie'])
        has_series_keywords = any(keyword in prompt_lower for keyword in keywords['series'])
        
        if has_movie_keywords and not has_series_keywords:
            return "movies_only"
        elif has_series_keywords and not has_movie_keywords:
            return "series_only"
        else:
            return "mixed"  # Both movies and series
    
    def get_genre_keywords(self) -> Dict[str, List[str]]:
        """Get the genre keyword mapping for AI prompt understanding"""
        return self.genre_keywords
    
    # AI-based methods (no hardcoded content)
    def get_all_content(self) -> List[Content]:
        """Get all content (empty - use AI recommendations instead)"""
        return []
    
    def get_all_movies(self) -> List[Content]:
        """Get all movies (empty - use AI recommendations instead)"""
        return []
    
    def get_content_by_type(self, content_type: str) -> List[Content]:
        """Get content filtered by type (empty - use AI recommendations instead)"""
        return []
    
    def get_movies_only(self) -> List[Content]:
        """Get only movies (empty - use AI recommendations instead)"""
        return []
    
    def get_series_only(self) -> List[Content]:
        """Get only TV series (empty - use AI recommendations instead)"""
        return []
    
    def get_content_by_genre(self, genres: List[str], content_preference: str = "mixed") -> List[Content]:
        """Get content by genre (empty - use AI recommendations instead)"""
        return []
    
    def get_movies_by_genre(self, genres: List[str]) -> List[Content]:
        """Get movies by genre (empty - use AI recommendations instead)"""
        return []
    
    def get_popular_content(self, count: int = 5, content_preference: str = "mixed") -> List[Content]:
        """Get popular content (empty - use AI recommendations instead)"""
        return []
    
    def get_popular_movies(self, count: int = 5) -> List[Content]:
        """Get popular movies (empty - use AI recommendations instead)"""
        return []


# Backward compatibility aliases
ContentDatabase = AIContentDatabase
MovieDatabase = AIContentDatabase 