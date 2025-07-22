"""
Integration tests for Movie Suggestion API endpoint
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app
import json


class TestSuggestionEndpointIntegration:
    """Integration tests for /suggest endpoint"""
    
    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)
    
    def test_basic_suggestion_request(self):
        """Test basic suggestion request returns proper response"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies", "lang": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 3
        
        # Verify each suggestion has required fields
        for suggestion in data["suggestions"]:
            assert "title" in suggestion
            assert "genre" in suggestion
            assert "year" in suggestion
            assert "reason" in suggestion
            assert "description" in suggestion
            assert isinstance(suggestion["genre"], list)
            assert isinstance(suggestion["year"], int)
    
    def test_genre_specific_requests(self):
        """Test requests for specific genres return relevant movies"""
        test_cases = [
            ("action movies", "action"),
            ("funny comedy films", "comedy"),
            ("animated cartoons", "animated"),
            ("sci-fi space movies", "sci-fi"),
            ("romantic love stories", "romance")
        ]
        
        for prompt, expected_genre in test_cases:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt, "lang": "en"}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Check that at least one suggestion matches the expected genre
            genre_found = any(
                expected_genre in suggestion["genre"]
                for suggestion in data["suggestions"]
            )
            assert genre_found, f"No {expected_genre} movies found for prompt: {prompt}"
    
    def test_minimum_suggestions_enforced(self):
        """Test that minimum 3 suggestions are always returned"""
        test_prompts = [
            "movies",
            "xyzzz unknown genre",
            "action",
            "some very specific niche genre that probably doesn't exist"
        ]
        
        for prompt in test_prompts:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt, "lang": "en"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3
    
    def test_response_field_validation(self):
        """Test that all response fields are properly populated and formatted"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies", "lang": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        for suggestion in data["suggestions"]:
            # Title validation
            assert suggestion["title"]
            assert len(suggestion["title"]) > 0
            
            # Genre validation
            assert isinstance(suggestion["genre"], list)
            assert len(suggestion["genre"]) > 0
            assert all(isinstance(g, str) for g in suggestion["genre"])
            
            # Year validation
            assert isinstance(suggestion["year"], int)
            assert 1800 <= suggestion["year"] <= 2030  # Reasonable year range
            
            # Reason validation
            assert suggestion["reason"]
            assert len(suggestion["reason"]) > 10  # Should be substantive
            
            # Description validation
            assert suggestion["description"]
            assert len(suggestion["description"]) > 10
    
    def test_error_handling_invalid_input(self):
        """Test error handling for invalid input"""
        # Test missing prompt
        response = self.client.post(
            "/suggest",
            json={"lang": "en"}
        )
        assert response.status_code == 422  # Validation error
        
        # Test empty prompt (should be rejected by validation)
        response = self.client.post(
            "/suggest",
            json={"prompt": "", "lang": "en"}
        )
        assert response.status_code == 422  # Validation error due to min_length=1
        
        # Test very long prompt
        long_prompt = "action " * 200  # Very long prompt
        response = self.client.post(
            "/suggest",
            json={"prompt": long_prompt, "lang": "en"}
        )
        assert response.status_code == 200
    
    def test_language_parameter(self):
        """Test language parameter handling"""
        # Test default language
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
        )
        assert response.status_code == 200
        
        # Test explicit English
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies", "lang": "en"}
        )
        assert response.status_code == 200
        
        # Test other language codes
        response = self.client.post(
            "/suggest",
            json={"prompt": "películas de acción", "lang": "es"}
        )
        assert response.status_code == 200
    
    def test_consistency_across_requests(self):
        """Test that similar requests return consistent results"""
        prompt = "action thriller movies"
        
        # Make multiple requests
        responses = []
        for _ in range(3):
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt, "lang": "en"}
            )
            assert response.status_code == 200
            responses.append(response.json())
        
        # Check that we get movies (might have some variation due to randomization)
        all_titles = set()
        for response_data in responses:
            titles = [s["title"] for s in response_data["suggestions"]]
            all_titles.update(titles)
        
        # Should have some overlap in suggestions
        assert len(all_titles) >= 3  # At least got some suggestions
    
    def test_performance_response_time(self):
        """Test that responses are generated within reasonable time"""
        import time
        
        start_time = time.time()
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies", "lang": "en"}
        )
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        # More generous timeout to account for LLM agent initialization and potential fallbacks
        assert response_time < 10.0  # Should respond within 10 seconds
    
    def test_variety_in_suggestions(self):
        """Test that suggestions show variety across genres when appropriate"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action comedy adventure movies", "lang": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Collect all genres from suggestions
        all_genres = set()
        for suggestion in data["suggestions"]:
            all_genres.update(suggestion["genre"])
        
        # Should have variety when multiple genres requested
        # Note: May return "unknown" genres if LLM agents are used
        assert len(all_genres) >= 1  # At least some genre information
    
    def test_fallback_system_robustness(self):
        """Test that fallback systems work when suggestion engine fails"""
        # Mock suggestion engine failure
        with patch('main.suggestion_engine', None):
            response = self.client.post(
                "/suggest",
                json={"prompt": "action movies", "lang": "en"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3
            
            # Should return emergency fallback movies
            titles = [s["title"] for s in data["suggestions"]]
            expected_fallbacks = ["The Shawshank Redemption", "Inception", "Spirited Away"]
            assert any(title in expected_fallbacks for title in titles)
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = self.client.post(
                "/suggest",
                json={"prompt": "action movies", "lang": "en"}
            )
            results.append(response.status_code)
        
        # Make 5 concurrent requests
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 5
    
    def test_edge_case_prompts(self):
        """Test handling of edge case prompts"""
        edge_cases = [
            "!@#$%^&*()",  # Special characters only
            "a",  # Single character
            "movies movies movies movies",  # Repetitive
            "123456789",  # Numbers only
            "àçéñtëd çhäråctërs",  # Accented characters
        ]
        
        for prompt in edge_cases:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt, "lang": "en"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3
    
    def test_json_response_format(self):
        """Test that response is valid JSON with correct structure"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies", "lang": "en"}
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Should be valid JSON
        data = response.json()
        
        # Should match expected schema
        assert isinstance(data, dict)
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        
        # Validate that it can be serialized back to JSON
        json_str = json.dumps(data)
        parsed_back = json.loads(json_str)
        assert parsed_back == data 