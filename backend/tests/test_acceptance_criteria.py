"""
Acceptance Criteria Validation Tests for Story 1.3
Validates that all acceptance criteria are met
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from src.suggestion_engine import MovieSuggestionEngine


class TestStory13AcceptanceCriteria:
    """Validation tests for Story 1.3 acceptance criteria"""
    
    def setup_method(self):
        """Set up test client and engine"""
        self.client = TestClient(app)
        self.engine = MovieSuggestionEngine()
    
    def test_ac1_simple_movie_suggestion_algorithm_implemented(self):
        """AC1: Simple movie suggestion algorithm implemented"""
        # Test that the algorithm exists and works
        results = self.engine.suggest_movies("action movies")
        assert len(results) >= 3
        assert all(hasattr(r, 'movie') and hasattr(r, 'reason') for r in results)
        
        # Test via API endpoint
        response = self.client.post("/suggest", json={"prompt": "action movies"})
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 3
    
    def test_ac2_response_includes_all_required_fields(self):
        """AC2: Response includes movie titles, genres, basic descriptions, and released year"""
        response = self.client.post("/suggest", json={"prompt": "comedy movies"})
        assert response.status_code == 200
        data = response.json()
        
        for suggestion in data["suggestions"]:
            # Verify all required fields are present
            assert "title" in suggestion
            assert "genre" in suggestion  # genres (plural in spec)
            assert "description" in suggestion  # basic descriptions
            assert "year" in suggestion  # released year
            assert "reason" in suggestion  # explanation for recommendation
            
            # Verify field types and content
            assert isinstance(suggestion["title"], str)
            assert len(suggestion["title"]) > 0
            
            assert isinstance(suggestion["genre"], list)
            assert len(suggestion["genre"]) > 0
            
            assert isinstance(suggestion["description"], str)
            assert len(suggestion["description"]) > 10  # Basic but substantive
            
            assert isinstance(suggestion["year"], int)
            assert 1800 <= suggestion["year"] <= 2030  # Reasonable range
            
            assert isinstance(suggestion["reason"], str)
            assert len(suggestion["reason"]) > 10  # Explanation provided
    
    def test_ac3_consistent_response_formatting(self):
        """AC3: Consistent response formatting across requests"""
        test_prompts = [
            "action movies",
            "romantic comedies", 
            "animated films",
            "sci-fi movies"
        ]
        
        response_structures = []
        
        for prompt in test_prompts:
            response = self.client.post("/suggest", json={"prompt": prompt})
            assert response.status_code == 200
            data = response.json()
            
            # Verify consistent top-level structure
            assert isinstance(data, dict)
            assert "suggestions" in data
            assert isinstance(data["suggestions"], list)
            
            # Collect structure for consistency check
            if data["suggestions"]:
                suggestion_keys = set(data["suggestions"][0].keys())
                response_structures.append(suggestion_keys)
        
        # All responses should have the same structure
        assert all(structure == response_structures[0] for structure in response_structures)
        
        # Verify expected keys are present
        expected_keys = {"title", "genre", "year", "reason", "description"}
        assert response_structures[0] == expected_keys
    
    def test_ac4_basic_error_handling_for_invalid_inputs(self):
        """AC4: Basic error handling for invalid inputs"""
        # Test missing prompt (validation error)
        response = self.client.post("/suggest", json={})
        assert response.status_code == 422  # Validation error
        
        # Test very long prompt (should still work)
        long_prompt = "action " * 200
        response = self.client.post("/suggest", json={"prompt": long_prompt})
        assert response.status_code == 200
        
        # Test unknown genre (should return fallback suggestions)
        response = self.client.post("/suggest", json={"prompt": "xyzzyx unknown genre"})
        assert response.status_code == 200
        data = response.json()
        assert len(data["suggestions"]) >= 3
        
        # Test special characters (should handle gracefully)
        response = self.client.post("/suggest", json={"prompt": "action movies!@#$%"})
        assert response.status_code == 200
        
        # Test single character (should work with fallback)
        response = self.client.post("/suggest", json={"prompt": "a"})
        assert response.status_code == 200
    
    def test_ac5_response_structure_extensible_for_future_llm_enhancement(self):
        """AC5: Response structure extensible for future LLM enhancement"""
        response = self.client.post("/suggest", json={"prompt": "action movies"})
        assert response.status_code == 200
        data = response.json()
        
        # Verify current structure supports future enhancement
        for suggestion in data["suggestions"]:
            # Current required fields
            assert "title" in suggestion
            assert "genre" in suggestion
            assert "year" in suggestion  
            assert "reason" in suggestion
            assert "description" in suggestion
            
        # Verify the response format is JSON and extensible
        import json
        json_str = json.dumps(data)
        parsed_back = json.loads(json_str)
        assert parsed_back == data
        
        # Test that the current MovieSuggestion model can be enhanced
        # (This is validated by the structure - new fields can be added without breaking existing clients)
    
    def test_ac6_at_least_3_movie_suggestions_returned(self):
        """AC6: At least 3 movie suggestions returned per request"""
        test_cases = [
            "action movies",
            "comedy films", 
            "animated movies",
            "sci-fi films",
            "romantic movies",
            "horror movies",
            "drama films",
            "movies",  # Generic request
            "xyzzyx unknown genre"  # Unknown genre should still return 3+
        ]
        
        for prompt in test_cases:
            response = self.client.post("/suggest", json={"prompt": prompt})
            assert response.status_code == 200
            data = response.json()
            
            assert len(data["suggestions"]) >= 3, f"Less than 3 suggestions for prompt: {prompt}"
            
            # Also verify each suggestion is complete
            for suggestion in data["suggestions"]:
                assert suggestion["title"]
                assert suggestion["genre"]
                assert suggestion["year"]
                assert suggestion["reason"]
                assert suggestion["description"]
    
    def test_comprehensive_genre_coverage(self):
        """Additional test: Verify algorithm covers multiple genres"""
        genre_prompts = {
            "action": "action movies with fighting",
            "comedy": "funny comedy movies", 
            "animated": "animated cartoons",
            "sci-fi": "science fiction space movies",
            "romance": "romantic love stories",
            "horror": "scary horror movies",
            "drama": "emotional drama films"
        }
        
        genre_results = {}
        
        for genre, prompt in genre_prompts.items():
            response = self.client.post("/suggest", json={"prompt": prompt})
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3
            
            # Track what genres are returned for each prompt
            returned_genres = set()
            for suggestion in data["suggestions"]:
                returned_genres.update(suggestion["genre"])
            
            genre_results[genre] = returned_genres
        
        # Verify we get diverse results across different genre requests
        all_returned_genres = set()
        for genres in genre_results.values():
            all_returned_genres.update(genres)
        
        # Should have reasonable genre diversity
        assert len(all_returned_genres) >= 3  # At least some variety
    
    def test_performance_baseline(self):
        """Additional test: Verify basic performance requirements"""
        import time
        
        start_time = time.time()
        response = self.client.post("/suggest", json={"prompt": "action movies"})
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        
        # Basic algorithm should be reasonably fast
        # Note: May be slower if LLM agents are active, but should still complete
        assert response_time < 15.0  # Generous allowance for full system 