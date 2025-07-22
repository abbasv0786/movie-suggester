"""
Integration tests for Movie Suggester AI API
"""
import pytest
from fastapi.testclient import TestClient
from main import app

class TestMovieSuggesterIntegration:
    """Integration tests for the complete Movie Suggester API workflow"""
    
    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)
    
    def test_basic_suggestion_request(self):
        """Test basic suggestion request returns proper response"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
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
            
            # Verify data types
            assert isinstance(suggestion["title"], str)
            assert isinstance(suggestion["genre"], list)
            assert isinstance(suggestion["year"], int)
            assert isinstance(suggestion["reason"], str)
            assert isinstance(suggestion["description"], str)
            
            # Verify non-empty values
            assert len(suggestion["title"]) > 0
            assert len(suggestion["genre"]) > 0
            assert suggestion["year"] > 1900
            assert len(suggestion["reason"]) > 0
            assert len(suggestion["description"]) > 0

    def test_different_genres_prompts(self):
        """Test that different genre prompts return appropriate suggestions"""
        test_cases = [
            "action movies with explosions",
            "romantic comedies",
            "horror films",
            "animated Disney movies",
            "science fiction space opera"
        ]
        
        for prompt in test_cases:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt}
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3
            
            # Each suggestion should be valid
            for suggestion in data["suggestions"]:
                assert suggestion["title"]
                assert suggestion["reason"]

    def test_keyword_variation_responses(self):
        """Test that keyword variations produce relevant suggestions"""
        similar_prompts = [
            "superhero movies",
            "comic book films", 
            "Marvel and DC movies"
        ]
        
        responses = []
        for prompt in similar_prompts:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt}
            )
            assert response.status_code == 200
            responses.append(response.json())
        
        # All responses should have suggestions
        for response_data in responses:
            assert len(response_data["suggestions"]) >= 3

    def test_end_to_end_workflow(self):
        """Test complete end-to-end workflow for movie suggestion"""
        # Step 1: Make suggestion request
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
        )
        assert response.status_code == 200
        
        # Step 2: Verify response structure
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        assert len(suggestions) >= 3
        
        # Step 3: Verify suggestion quality
        for suggestion in suggestions:
            # Should have all required fields
            required_fields = ["title", "genre", "year", "reason", "description"]
            for field in required_fields:
                assert field in suggestion
                assert suggestion[field]  # Non-empty/falsy
            
            # Specific validations
            assert isinstance(suggestion["genre"], list)
            assert len(suggestion["genre"]) > 0
            assert suggestion["year"] >= 1900
            assert suggestion["year"] <= 2030

    def test_error_handling_integration(self):
        """Test error handling for various invalid inputs"""
        
        # Test missing prompt
        response = self.client.post("/suggest", json={})
        assert response.status_code == 422
        
        # Test empty prompt
        response = self.client.post("/suggest", json={"prompt": ""})
        assert response.status_code == 422
        
        # Test overly long prompt
        long_prompt = "a" * 1501  # Exceeds max_length
        response = self.client.post("/suggest", json={"prompt": long_prompt})
        assert response.status_code == 422

    def test_response_consistency(self):
        """Test that API responses are consistent across multiple calls"""
        response = self.client.post(
            "/suggest", 
            json={"prompt": "action movies"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        
        # Test multiple calls for consistency
        for _ in range(3):
            repeat_response = self.client.post(
                "/suggest",
                json={"prompt": "action movies"}
            )
            assert repeat_response.status_code == 200
            repeat_data = repeat_response.json()
            assert len(repeat_data["suggestions"]) == len(suggestions)

    def test_multilingual_prompt_handling(self):
        """Test that API handles multilingual prompts with automatic detection"""
        # Test Spanish prompt - should work with automatic detection
        response = self.client.post(
            "/suggest",
            json={"prompt": "películas de acción"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 3

    def test_special_characters_handling(self):
        """Test API handling of prompts with special characters"""
        special_prompts = [
            "movies with $ millions budget",
            "films from the 90's era",
            "sci-fi movies with aliens & robots"
        ]
        
        for prompt in special_prompts:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt}
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data["suggestions"]) >= 3

    def test_endpoint_performance(self):
        """Test that suggestion endpoint responds within reasonable time"""
        import time
        
        start_time = time.time()
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
        )
        end_time = time.time()
        
        # Response should be under 10 seconds for basic suggestions
        response_time = end_time - start_time
        assert response_time < 10.0
        assert response.status_code == 200

    def test_content_type_validation(self):
        """Test that API properly validates content types"""
        # Test with correct JSON content type
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
        )
        assert response.status_code == 200
        assert "application/json" in response.headers["content-type"]

    def test_api_documentation_accessibility(self):
        """Test that API documentation endpoints are accessible"""
        # Test OpenAPI docs
        docs_response = self.client.get("/docs")
        assert docs_response.status_code == 200
        
        # Test ReDoc
        redoc_response = self.client.get("/redoc")
        assert redoc_response.status_code == 200

    def test_suggestion_variety(self):
        """Test that API returns varied suggestions for different prompts"""
        prompts = [
            "comedy movies",
            "action films", 
            "animated movies",
            "documentaries"
        ]
        
        all_titles = set()
        for prompt in prompts:
            response = self.client.post(
                "/suggest",
                json={"prompt": prompt}
            )
            assert response.status_code == 200
            data = response.json()
            
            for suggestion in data["suggestions"]:
                all_titles.add(suggestion["title"])
        
        # Should have variety in suggestions across different prompts
        assert len(all_titles) >= 6  # At least 6 unique titles across all prompts

    def test_suggestion_reasoning_quality(self):
        """Test that suggestions include meaningful reasoning"""
        response = self.client.post(
            "/suggest",
            json={"prompt": "action movies"}
        )
        assert response.status_code == 200
        data = response.json()
        
        for suggestion in data["suggestions"]:
            reason = suggestion["reason"]
            # Reason should be substantive (more than just a few words)
            assert len(reason) > 20
            # Should not be generic placeholder text
            assert "great movie" not in reason.lower() or len(reason) > 50 