"""
Tests for Movie Suggestion Engine
"""
import pytest
from unittest.mock import Mock, patch
from src.suggestion_engine import MovieSuggestionEngine, SuggestionResult
from src.movie_data import MovieDatabase, Movie


class TestMovieSuggestionEngine:
    """Test suite for MovieSuggestionEngine"""
    
    def setup_method(self):
        """Set up test instance"""
        self.engine = MovieSuggestionEngine(min_suggestions=3)
    
    def test_initialization(self):
        """Test engine initializes correctly"""
        assert self.engine.min_suggestions == 3
        assert self.engine.max_suggestions == 4
        assert isinstance(self.engine.movie_db, MovieDatabase)
    
    def test_genre_detection_action(self):
        """Test genre detection works correctly for action keywords"""
        genres = self.engine._extract_genres_from_prompt("I want some action movies with fighting")
        assert "action" in genres
    
    def test_genre_detection_comedy(self):
        """Test genre detection works correctly for comedy keywords"""
        genres = self.engine._extract_genres_from_prompt("Looking for something funny and hilarious")
        assert "comedy" in genres
    
    def test_genre_detection_animated(self):
        """Test genre detection works correctly for animated keywords"""
        genres = self.engine._extract_genres_from_prompt("I love animated movies like Pixar films")
        assert "animated" in genres
    
    def test_genre_detection_sci_fi(self):
        """Test genre detection works correctly for sci-fi keywords"""
        genres = self.engine._extract_genres_from_prompt("Science fiction movies about space and robots")
        assert "sci-fi" in genres
    
    def test_genre_detection_romance(self):
        """Test genre detection works correctly for romance keywords"""
        genres = self.engine._extract_genres_from_prompt("Romantic movies about love and relationships")
        assert "romance" in genres
    
    def test_genre_detection_multiple(self):
        """Test genre detection works for multiple genres"""
        genres = self.engine._extract_genres_from_prompt("Funny action movies with comedy and adventure")
        assert "comedy" in genres
        assert "action" in genres
        assert "adventure" in genres
    
    def test_special_genre_cases_superhero(self):
        """Test special case handling for superhero terms"""
        genres = self.engine._extract_genres_from_prompt("I love Marvel superhero movies")
        assert "action" in genres
    
    def test_special_genre_cases_rom_com(self):
        """Test special case handling for romantic comedy"""
        genres = self.engine._extract_genres_from_prompt("Looking for a good rom-com")
        assert "romance" in genres
        assert "comedy" in genres
    
    def test_minimum_suggestions_returned(self):
        """Test that at least 3 suggestions are always returned"""
        results = self.engine.suggest_movies("movies")
        assert len(results) >= 3
        
        # Test with specific genre
        results = self.engine.suggest_movies("action movies")
        assert len(results) >= 3
    
    def test_movie_matching_by_genre(self):
        """Test that relevant movies are returned for each genre"""
        # Test action genre
        results = self.engine.suggest_movies("action movies")
        action_found = any("action" in result.movie.genre for result in results)
        assert action_found
        
        # Test comedy genre
        results = self.engine.suggest_movies("funny comedy movies")
        comedy_found = any("comedy" in result.movie.genre for result in results)
        assert comedy_found
        
        # Test animated genre
        results = self.engine.suggest_movies("animated cartoons")
        animated_found = any("animated" in result.movie.genre for result in results)
        assert animated_found
    
    def test_response_format_complete(self):
        """Test all required fields are populated in response"""
        results = self.engine.suggest_movies("action movies")
        
        for result in results:
            assert isinstance(result, SuggestionResult)
            assert result.movie.title
            assert result.movie.genre
            assert isinstance(result.movie.year, int)
            assert result.reason
            assert result.movie.description
            assert isinstance(result.relevance_score, (int, float))
    
    def test_genre_variety_in_results(self):
        """Test that different genres are represented in multi-genre prompts"""
        results = self.engine.suggest_movies("action comedy animated movies", count=4)
        
        all_genres = set()
        for result in results:
            all_genres.update(result.movie.genre)
        
        # Should have variety across different genres
        assert len(all_genres) > 1
    
    def test_fallback_for_no_matches(self):
        """Test fallback logic when no genre matches are found"""
        results = self.engine.suggest_movies("xyzzyx nonexistent genre")
        assert len(results) >= 3
        # Should return popular movies as fallback
        titles = [r.movie.title for r in results]
        assert any(title in ["The Shawshank Redemption", "Parasite", "Spirited Away"] for title in titles)
    
    def test_empty_prompt_handling(self):
        """Test handling of empty or minimal prompts"""
        results = self.engine.suggest_movies("")
        assert len(results) >= 3
        
        results = self.engine.suggest_movies("movie")
        assert len(results) >= 3
    
    def test_long_prompt_handling(self):
        """Test handling of very long prompts"""
        long_prompt = "I'm looking for " + "amazing " * 50 + "action movies with great fight scenes"
        results = self.engine.suggest_movies(long_prompt)
        assert len(results) >= 3
        action_found = any("action" in result.movie.genre for result in results)
        assert action_found
    
    def test_special_characters_handling(self):
        """Test handling of special characters in prompts"""
        results = self.engine.suggest_movies("action movies!!! @#$%^&*()")
        assert len(results) >= 3
        action_found = any("action" in result.movie.genre for result in results)
        assert action_found
    
    def test_scoring_system(self):
        """Test that scoring system works correctly"""
        results = self.engine.suggest_movies("action movies with fighting")
        
        # Results should be sorted by relevance score
        scores = [r.relevance_score for r in results]
        assert scores == sorted(scores, reverse=True)
        
        # Top result should have higher score than bottom
        if len(results) > 1:
            assert results[0].relevance_score >= results[-1].relevance_score
    
    def test_consistency_across_requests(self):
        """Test that same prompt returns consistent results"""
        prompt = "action thriller movies"
        results1 = self.engine.suggest_movies(prompt)
        results2 = self.engine.suggest_movies(prompt)
        
        # Should have same movies (though order might vary due to randomization)
        titles1 = set(r.movie.title for r in results1)
        titles2 = set(r.movie.title for r in results2)
        
        # At least some overlap expected
        overlap = len(titles1.intersection(titles2))
        assert overlap >= 2
    
    def test_custom_suggestion_count(self):
        """Test custom suggestion count parameter"""
        results = self.engine.suggest_movies("action movies", count=5)
        assert len(results) >= 3  # Minimum enforced
        
        results = self.engine.suggest_movies("action movies", count=2)
        assert len(results) >= 3  # Minimum enforced even when requesting less
    
    def test_error_handling_in_suggest_movies(self):
        """Test error handling in main suggest_movies method"""
        # Mock an error in genre extraction
        with patch.object(self.engine, '_extract_genres_from_prompt', side_effect=Exception("Test error")):
            results = self.engine.suggest_movies("action movies")
            assert len(results) >= 3  # Should return emergency fallback
    
    def test_genre_scoring_accuracy(self):
        """Test that genre scoring gives higher scores to better matches"""
        action_results = self.engine.suggest_movies("intense action movies with explosions")
        comedy_results = self.engine.suggest_movies("hilarious comedy movies")
        
        # Action results should contain action movies
        action_found = any("action" in result.movie.genre for result in action_results)
        assert action_found
        
        # Comedy results should contain comedy movies  
        comedy_found = any("comedy" in result.movie.genre for result in comedy_results)
        assert comedy_found
    
    def test_recency_bonus_calculation(self):
        """Test that recency bonus is calculated correctly"""
        recent_score = self.engine._calculate_recency_score(2020)
        old_score = self.engine._calculate_recency_score(1990)
        
        assert recent_score >= old_score
    
    def test_keyword_score_calculation(self):
        """Test keyword scoring in titles and descriptions"""
        movie = Movie(
            title="Action Hero",
            genre=["action"],
            description="Explosive action with great fight scenes",
            year=2020
        )
        
        score = self.engine._calculate_keyword_score(movie, "action fight explosive")
        assert score > 0
    
    def test_reason_generation_quality(self):
        """Test that generated reasons are contextual and informative"""
        results = self.engine.suggest_movies("action movies")
        
        for result in results:
            reason = result.reason
            assert len(reason) > 10  # Should be substantive
            assert reason != result.movie.description  # Should be contextual, not just description 