"""
Movie Database - Hardcoded movie collection for MVP suggestion algorithm
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Movie:
    """Movie data structure with all required fields for suggestions"""
    title: str
    genre: List[str]
    description: str
    year: int
    director: Optional[str] = None


class MovieDatabase:
    """MVP movie database with hardcoded collection organized by genre"""
    
    def __init__(self):
        """Initialize with curated movie collection"""
        self.movies = self._load_movie_collection()
        self.genre_keywords = self._build_genre_keyword_map()
    
    def _load_movie_collection(self) -> List[Movie]:
        """Load hardcoded movie collection with diverse genres"""
        return [
            # Action Movies
            Movie(
                title="Mad Max: Fury Road",
                genre=["action", "adventure", "thriller"],
                description="Post-apocalyptic action with incredible stunts and non-stop excitement",
                year=2015,
                director="George Miller"
            ),
            Movie(
                title="John Wick",
                genre=["action", "thriller"],
                description="Stylish action thriller with exceptional choreography and compelling revenge story",
                year=2014,
                director="Chad Stahelski"
            ),
            Movie(
                title="Mission: Impossible - Fallout",
                genre=["action", "adventure", "thriller"],
                description="High-octane spy action with death-defying stunts and globe-trotting adventure",
                year=2018,
                director="Christopher McQuarrie"
            ),
            
            # Comedy Movies
            Movie(
                title="The Grand Budapest Hotel",
                genre=["comedy", "adventure"],
                description="Quirky comedy with stunning visuals and whimsical storytelling",
                year=2014,
                director="Wes Anderson"
            ),
            Movie(
                title="Superbad",
                genre=["comedy"],
                description="Coming-of-age comedy with heart and hilarious teenage misadventures",
                year=2007,
                director="Greg Mottola"
            ),
            Movie(
                title="Knives Out",
                genre=["comedy", "mystery", "thriller"],
                description="Clever mystery comedy with brilliant writing and ensemble cast",
                year=2019,
                director="Rian Johnson"
            ),
            
            # Animated Movies
            Movie(
                title="Spirited Away",
                genre=["animated", "adventure", "family"],
                description="Magical adventure from Studio Ghibli with breathtaking animation",
                year=2001,
                director="Hayao Miyazaki"
            ),
            Movie(
                title="Coco",
                genre=["animated", "family", "musical"],
                description="Heartwarming story about family, music, and Mexican culture",
                year=2017,
                director="Lee Unkrich"
            ),
            Movie(
                title="Spider-Man: Into the Spider-Verse",
                genre=["animated", "action", "adventure"],
                description="Revolutionary animation style with innovative superhero storytelling",
                year=2018,
                director="Bob Persichetti"
            ),
            
            # Sci-Fi Movies
            Movie(
                title="Blade Runner 2049",
                genre=["sci-fi", "thriller"],
                description="Stunning visuals and philosophical themes in futuristic dystopia",
                year=2017,
                director="Denis Villeneuve"
            ),
            Movie(
                title="Interstellar",
                genre=["sci-fi", "adventure", "drama"],
                description="Space epic with emotional depth and mind-bending concepts",
                year=2014,
                director="Christopher Nolan"
            ),
            Movie(
                title="Ex Machina",
                genre=["sci-fi", "thriller"],
                description="Thoughtful AI thriller with psychological depth and stunning visuals",
                year=2014,
                director="Alex Garland"
            ),
            
            # Romance Movies
            Movie(
                title="The Princess Bride",
                genre=["romance", "adventure", "comedy"],
                description="Perfect blend of romance, adventure, and comedy in a timeless fairy tale",
                year=1987,
                director="Rob Reiner"
            ),
            Movie(
                title="La La Land",
                genre=["romance", "musical", "drama"],
                description="Modern musical romance with stunning cinematography and memorable songs",
                year=2016,
                director="Damien Chazelle"
            ),
            Movie(
                title="About Time",
                genre=["romance", "comedy", "drama"],
                description="Touching romantic comedy about love, family, and making the most of life",
                year=2013,
                director="Richard Curtis"
            ),
            
            # Horror Movies
            Movie(
                title="Get Out",
                genre=["horror", "thriller"],
                description="Masterful psychological horror with sharp social commentary",
                year=2017,
                director="Jordan Peele"
            ),
            Movie(
                title="A Quiet Place",
                genre=["horror", "thriller"],
                description="Innovative horror with minimal dialogue and maximum tension",
                year=2018,
                director="John Krasinski"
            ),
            Movie(
                title="Hereditary",
                genre=["horror", "thriller"],
                description="Deeply unsettling family horror with exceptional performances",
                year=2018,
                director="Ari Aster"
            ),
            
            # Drama Movies
            Movie(
                title="Parasite",
                genre=["drama", "thriller"],
                description="Brilliant social thriller that blends dark comedy with sharp class commentary",
                year=2019,
                director="Bong Joon-ho"
            ),
            Movie(
                title="The Shawshank Redemption",
                genre=["drama"],
                description="Timeless tale of hope, friendship, and redemption in prison setting",
                year=1994,
                director="Frank Darabont"
            ),
            Movie(
                title="Moonlight",
                genre=["drama"],
                description="Powerful coming-of-age story with beautiful cinematography and performances",
                year=2016,
                director="Barry Jenkins"
            )
        ]
    
    def _build_genre_keyword_map(self) -> Dict[str, List[str]]:
        """Build mapping of keywords to genre categories for user prompt parsing"""
        return {
            'action': ['action', 'thriller', 'adventure', 'fight', 'combat', 'explosive', 'intense'],
            'comedy': ['funny', 'comedy', 'humor', 'laugh', 'hilarious', 'witty', 'amusing'],
            'animated': ['animated', 'cartoon', 'animation', 'pixar', 'disney', 'anime'],
            'sci-fi': ['sci-fi', 'science', 'space', 'future', 'robot', 'ai', 'technology'],
            'romance': ['love', 'romance', 'romantic', 'date', 'relationship', 'couple'],
            'horror': ['horror', 'scary', 'frightening', 'spooky', 'terrifying', 'creepy'],
            'drama': ['drama', 'emotional', 'serious', 'touching', 'heartbreaking'],
            'family': ['family', 'kids', 'children', 'wholesome', 'all ages'],
            'mystery': ['mystery', 'detective', 'puzzle', 'investigation', 'crime'],
            'adventure': ['adventure', 'journey', 'exploration', 'quest', 'travel'],
            'musical': ['musical', 'music', 'songs', 'singing', 'dance']
        }
    
    def get_all_movies(self) -> List[Movie]:
        """Get all movies in the database"""
        return self.movies
    
    def get_movies_by_genre(self, genres: List[str]) -> List[Movie]:
        """Get movies that match any of the specified genres"""
        matching_movies = []
        for movie in self.movies:
            if any(genre.lower() in [g.lower() for g in movie.genre] for genre in genres):
                matching_movies.append(movie)
        return matching_movies
    
    def get_genre_keywords(self) -> Dict[str, List[str]]:
        """Get the genre keyword mapping"""
        return self.genre_keywords
    
    def get_popular_movies(self, count: int = 5) -> List[Movie]:
        """Get popular movies for fallback suggestions"""
        # Return a mix of highly-rated movies across genres
        popular = [
            next(m for m in self.movies if m.title == "The Shawshank Redemption"),
            next(m for m in self.movies if m.title == "Parasite"),
            next(m for m in self.movies if m.title == "Spirited Away"),
            next(m for m in self.movies if m.title == "Mad Max: Fury Road"),
            next(m for m in self.movies if m.title == "Knives Out"),
        ]
        return popular[:count] 