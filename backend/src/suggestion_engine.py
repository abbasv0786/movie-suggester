"""
Movie Suggestion Engine - Core algorithm for basic movie recommendations
"""
import re
import random
from typing import List, Dict, Any, Set
from dataclasses import dataclass

from src.movie_data import MovieDatabase, Movie
from src.constants import (
    DEFAULT_MIN_SUGGESTIONS, DEFAULT_MAX_SUGGESTIONS, MAX_KEYWORD_SCORE,
    GENRE_SCORE_MULTIPLIER, FALLBACK_SCORE, EMERGENCY_FALLBACK_SCORE,
    RECENT_MOVIE_THRESHOLD_YEARS, MODERATE_RECENT_THRESHOLD_YEARS,
    RECENT_MOVIE_BONUS, MODERATE_RECENT_BONUS
)


@dataclass
class SuggestionResult:
    """Result from suggestion algorithm with movie and reasoning"""
    movie: Movie
    reason: str
    relevance_score: float


class MovieSuggestionEngine:
    """Core engine for generating movie suggestions based on user prompts"""
    
    def __init__(self, min_suggestions: int = DEFAULT_MIN_SUGGESTIONS, max_suggestions: int = DEFAULT_MAX_SUGGESTIONS):
        """Initialize suggestion engine with movie database"""
        self.movie_db = MovieDatabase()
        self.min_suggestions = min_suggestions
        self.max_suggestions = max_suggestions
        
    def suggest_movies(self, prompt: str, count: int = None) -> List[SuggestionResult]:
        """
        Generate movie suggestions based on user prompt
        
        Args:
            prompt: User's movie preference description
            count: Number of suggestions to return (defaults to min_suggestions)
            
        Returns:
            List of SuggestionResult objects with movies and reasons
        """
        if count is None:
            count = self.min_suggestions
            
        try:
            # Step 1: Extract keywords and map to genres
            detected_genres = self._extract_genres_from_prompt(prompt)
            
            # Step 2: Get movies matching detected genres
            candidate_movies = self._get_candidate_movies(detected_genres)
            
            # Step 3: Score and rank movies based on relevance
            scored_movies = self._score_movies(candidate_movies, prompt, detected_genres)
            
            # Step 4: Select diverse suggestions with variety
            suggestions = self._select_diverse_suggestions(scored_movies, count)
            
            # Step 5: Ensure minimum count with fallbacks if needed
            if len(suggestions) < self.min_suggestions:
                suggestions = self._add_fallback_suggestions(suggestions, self.min_suggestions)
            
            return suggestions
            
        except Exception as e:
            # Return fallback suggestions if algorithm fails
            return self._get_emergency_fallback(count or self.min_suggestions)
    
    def _extract_genres_from_prompt(self, prompt: str) -> Set[str]:
        """Extract genre keywords from user prompt"""
        prompt_lower = prompt.lower()
        detected_genres = set()
        
        genre_keywords = self.movie_db.get_genre_keywords()
        
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
        # Handle language-specific terms
        if any(term in prompt_lower for term in ['película', 'filme', 'cine']):
            # Spanish terms detected, no specific genre change needed
            pass
            
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
    
    def _get_candidate_movies(self, detected_genres: Set[str]) -> List[Movie]:
        """Get movies that match detected genres"""
        if not detected_genres:
            # No specific genres detected, return popular movies
            return self.movie_db.get_popular_movies(count=10)
        
        # Get movies matching any detected genre
        candidate_movies = self.movie_db.get_movies_by_genre(list(detected_genres))
        
        # If no matches, expand search or use popular movies
        if not candidate_movies:
            candidate_movies = self.movie_db.get_popular_movies(count=8)
            
        return candidate_movies
    
    def _score_movies(self, movies: List[Movie], prompt: str, detected_genres: Set[str]) -> List[SuggestionResult]:
        """Score movies based on relevance to prompt and detected genres"""
        scored_results = []
        prompt_lower = prompt.lower()
        
        for movie in movies:
            # Base score from genre matching
            genre_score = self._calculate_genre_score(movie.genre, detected_genres)
            
            # Keyword relevance in title and description
            keyword_score = self._calculate_keyword_score(movie, prompt_lower)
            
            # Recency bonus (newer movies get slight boost)
            recency_score = self._calculate_recency_score(movie.year)
            
            # Combined relevance score
            total_score = genre_score + keyword_score + recency_score
            
            # Generate contextual reason
            reason = self._generate_reason(movie, detected_genres, prompt_lower)
            
            scored_results.append(SuggestionResult(
                movie=movie,
                reason=reason,
                relevance_score=total_score
            ))
        
        # Sort by relevance score
        return sorted(scored_results, key=lambda x: x.relevance_score, reverse=True)
    
    def _calculate_genre_score(self, movie_genres: List[str], detected_genres: Set[str]) -> float:
        """Calculate score based on genre matching"""
        if not detected_genres:
            return 0.5  # Neutral score for no genre detection
            
        movie_genres_set = set(g.lower() for g in movie_genres)
        matches = len(movie_genres_set.intersection(detected_genres))
        
        # Score based on proportion of matching genres
        return matches / max(len(detected_genres), 1) * GENRE_SCORE_MULTIPLIER
    
    def _calculate_keyword_score(self, movie: Movie, prompt_lower: str) -> float:
        """Calculate score based on keyword relevance in title/description"""
        score = 0.0
        
        # Check title relevance
        if any(word in movie.title.lower() for word in prompt_lower.split()):
            score += 2.0
            
        # Check description relevance
        description_words = movie.description.lower().split()
        prompt_words = set(prompt_lower.split())
        common_words = prompt_words.intersection(set(description_words))
        score += len(common_words) * 0.5
        
        return min(score, MAX_KEYWORD_SCORE)  # Cap keyword score
    
    def _calculate_recency_score(self, year: int) -> float:
        """Calculate slight bonus for more recent movies"""
        current_year = 2024
        age = current_year - year
        
        if age <= RECENT_MOVIE_THRESHOLD_YEARS:
            return RECENT_MOVIE_BONUS  # Recent movies
        elif age <= MODERATE_RECENT_THRESHOLD_YEARS:
            return MODERATE_RECENT_BONUS  # Moderately recent
        else:
            return 0.0  # Older movies (no penalty, just no bonus)
    
    def _generate_reason(self, movie: Movie, detected_genres: Set[str], prompt_lower: str) -> str:
        """Generate contextual reason for movie recommendation"""
        reasons = []
        
        # Genre-based reasoning
        if detected_genres:
            matching_genres = [g for g in movie.genre if g.lower() in detected_genres]
            if matching_genres:
                reasons.append(f"Perfect match for {', '.join(matching_genres)} preferences")
        
        # Highlight key movie strengths
        description_lower = movie.description.lower()
        if 'stunning' in description_lower or 'beautiful' in description_lower:
            reasons.append("features exceptional visuals")
        if 'heart' in description_lower or 'emotional' in description_lower:
            reasons.append("delivers emotional depth")
        if 'innovative' in description_lower or 'revolutionary' in description_lower:
            reasons.append("offers groundbreaking filmmaking")
        
        # Default to description if no specific reasons
        if not reasons:
            return movie.description
        
        return f"{reasons[0]} and {movie.description.split('.')[0].lower()}"
    
    def _select_diverse_suggestions(self, scored_movies: List[SuggestionResult], count: int) -> List[SuggestionResult]:
        """Select diverse suggestions ensuring genre variety"""
        if not scored_movies:
            return []
            
        selected = []
        used_genres = set()
        
        # First pass: select highest-scoring unique genres
        for result in scored_movies:
            if len(selected) >= count:
                break
                
            movie_genres = set(g.lower() for g in result.movie.genre)
            if not movie_genres.intersection(used_genres) or len(selected) < count // 2:
                selected.append(result)
                used_genres.update(movie_genres)
        
        # Second pass: fill remaining slots with highest scores
        remaining_count = count - len(selected)
        if remaining_count > 0:
            remaining_movies = [r for r in scored_movies if r not in selected]
            selected.extend(remaining_movies[:remaining_count])
        
        # Add randomization for variety in equal scores
        if len(selected) > count:
            # Group by similar scores and randomize within groups
            selected = self._randomize_similar_scores(selected)[:count]
        
        return selected
    
    def _randomize_similar_scores(self, results: List[SuggestionResult]) -> List[SuggestionResult]:
        """Add randomization for movies with similar relevance scores"""
        if len(results) <= 1:
            return results
            
        # Group by score ranges
        score_groups = {}
        for result in results:
            score_key = round(result.relevance_score, 1)
            if score_key not in score_groups:
                score_groups[score_key] = []
            score_groups[score_key].append(result)
        
        # Randomize within each score group
        randomized = []
        for score in sorted(score_groups.keys(), reverse=True):
            group = score_groups[score]
            random.shuffle(group)
            randomized.extend(group)
            
        return randomized
    
    def _add_fallback_suggestions(self, current_suggestions: List[SuggestionResult], min_count: int) -> List[SuggestionResult]:
        """Add fallback suggestions to meet minimum count"""
        if len(current_suggestions) >= min_count:
            return current_suggestions
            
        # Get popular movies not already selected
        used_titles = {s.movie.title for s in current_suggestions}
        popular_movies = self.movie_db.get_popular_movies(count=10)
        
        fallback_movies = [m for m in popular_movies if m.title not in used_titles]
        
        # Convert to SuggestionResult format
        for movie in fallback_movies:
            if len(current_suggestions) >= min_count:
                break
                
            reason = f"Highly recommended {', '.join(movie.genre)} film - {movie.description}"
            current_suggestions.append(SuggestionResult(
                movie=movie,
                reason=reason,
                relevance_score=FALLBACK_SCORE
            ))
        
        return current_suggestions
    
    def _get_emergency_fallback(self, count: int) -> List[SuggestionResult]:
        """Emergency fallback when all else fails"""
        popular_movies = self.movie_db.get_popular_movies(count=count)
        
        emergency_suggestions = []
        for movie in popular_movies:
            reason = f"Critically acclaimed {', '.join(movie.genre)} film - {movie.description}"
            emergency_suggestions.append(SuggestionResult(
                movie=movie,
                reason=reason,
                relevance_score=EMERGENCY_FALLBACK_SCORE
            ))
        
        return emergency_suggestions[:count] 