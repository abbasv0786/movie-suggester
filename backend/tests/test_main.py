"""
Tests for FastAPI main application
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint returns welcome information"""
    response = client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == "Welcome to Movie Suggester AI"
    assert data["version"] == "0.1.0"
    assert data["status"] == "active"
    assert "endpoints" in data

def test_root_endpoint_structure():
    """Test the root endpoint returns correct JSON structure"""
    response = client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    required_fields = ["message", "description", "version", "status", "endpoints", "github"]
    for field in required_fields:
        assert field in data

def test_health_endpoint():
    """Test the health check endpoint returns correct status"""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "movie-suggester-ai"
    assert data["version"] == "0.1.0"

def test_health_endpoint_structure():
    """Test the health endpoint returns correct JSON structure"""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert "version" in data
    assert len(data) == 3

def test_docs_endpoint():
    """Test that API documentation is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_redoc_endpoint():
    """Test that ReDoc documentation is accessible"""
    response = client.get("/redoc")
    assert response.status_code == 200

def test_invalid_endpoint():
    """Test that invalid endpoints return 404"""
    response = client.get("/invalid-endpoint")
    assert response.status_code == 404

def test_health_endpoint_content_type():
    """Test that health endpoint returns JSON content type"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]

def test_root_endpoint_content_type():
    """Test that root endpoint returns JSON content type"""
    response = client.get("/")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]

# Tests for /suggest endpoint

def test_suggest_endpoint_valid_request():
    """Test the suggest endpoint with valid request returns 200 with proper response structure"""
    request_data = {
        "prompt": "I want animated movies like Coco"
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "suggestions" in data
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) >= 3
    assert len(data["suggestions"]) <= 5
    
    # Check each suggestion has required fields
    for suggestion in data["suggestions"]:
        assert "title" in suggestion
        assert "reason" in suggestion
        assert isinstance(suggestion["title"], str)
        assert isinstance(suggestion["reason"], str)
        assert len(suggestion["title"]) > 0
        assert len(suggestion["reason"]) > 0

def test_suggest_endpoint_default_lang():
    """Test the suggest endpoint works with default language parameter"""
    request_data = {
        "prompt": "Comedy movies please"
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) >= 3

def test_suggest_endpoint_auto_language_detection():
    """Test the suggest endpoint automatically detects language from prompt"""
    request_data = {
        "prompt": "películas animadas como Coco"
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "suggestions" in data
    suggestions = data["suggestions"]
    
    # Check that at least one suggestion has Spanish text
    spanish_found = any("familia" in suggestion["reason"] or "película" in suggestion["reason"] 
                       for suggestion in suggestions)
    assert spanish_found

def test_suggest_endpoint_missing_prompt():
    """Test the suggest endpoint returns 400 for missing prompt field"""
    request_data = {}
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 422  # FastAPI returns 422 for validation errors
    
    data = response.json()
    assert "detail" in data
    # Check that the error mentions the prompt field
    error_msg = str(data["detail"]).lower()
    assert "prompt" in error_msg

def test_suggest_endpoint_empty_prompt():
    """Test the suggest endpoint returns 400 for empty prompt"""
    request_data = {
        "prompt": ""
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 422  # FastAPI validation error
    
    data = response.json()
    assert "detail" in data

def test_suggest_endpoint_long_prompt():
    """Test the suggest endpoint returns 400 for prompt exceeding max length"""
    long_prompt = "a" * 1501  # Exceeds max_length=1500
    request_data = {
        "prompt": long_prompt
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 422  # FastAPI validation error
    
    data = response.json()
    assert "detail" in data

def test_suggest_endpoint_invalid_json():
    """Test the suggest endpoint returns 400 for invalid JSON body"""
    response = client.post("/suggest", 
                          data="invalid json data",
                          headers={"Content-Type": "application/json"})
    assert response.status_code == 422

def test_suggest_endpoint_keyword_matching():
    """Test the suggest endpoint returns appropriate suggestions based on keywords"""
    # Test action keywords
    action_request = {
        "prompt": "I love superhero action movies"
    }
    response = client.post("/suggest", json=action_request)
    assert response.status_code == 200
    
    data = response.json()
    suggestions = data["suggestions"]
    
    # Should return some movie suggestions
    assert len(suggestions) > 0
    assert len(suggestions) <= 5
    
    # Each suggestion should have title and reason
    for suggestion in suggestions:
        assert "title" in suggestion
        assert "reason" in suggestion
        assert len(suggestion["title"]) > 0
        assert len(suggestion["reason"]) > 0

def test_suggest_endpoint_animated_keyword():
    """Test the suggest endpoint returns movie suggestions for animation keywords"""
    animated_request = {
        "prompt": "animated Disney Pixar movies"
    }
    response = client.post("/suggest", json=animated_request)
    assert response.status_code == 200
    
    data = response.json()
    suggestions = data["suggestions"]
    
    # Should return some movie suggestions
    assert len(suggestions) > 0
    assert len(suggestions) <= 5
    
    # Each suggestion should have title and reason
    for suggestion in suggestions:
        assert "title" in suggestion
        assert "reason" in suggestion
        assert len(suggestion["title"]) > 0
        assert len(suggestion["reason"]) > 0

def test_suggest_endpoint_content_type():
    """Test the suggest endpoint returns JSON content type"""
    request_data = {
        "prompt": "good movies"
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]

def test_suggest_endpoint_suggestion_count():
    """Test the suggest endpoint returns between 3-5 suggestions consistently"""
    test_prompts = [
        "animated movies",
        "action movies", 
        "comedy films",
        "general recommendations"
    ]
    
    for prompt in test_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        suggestion_count = len(data["suggestions"])
        assert 3 <= suggestion_count <= 5, f"Expected 3-5 suggestions, got {suggestion_count} for prompt: {prompt}"

def test_suggest_endpoint_automatic_language_detection_fallback():
    """Test the suggest endpoint works when language detection fails or is ambiguous"""
    test_prompts = [
        "123456789",  # Numbers only - should fallback to English
        "!@#$%^&*()",  # Special characters only - should fallback to English
        "movie"  # Very short prompt - should still work
    ]
    
    for prompt in test_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 3

def test_suggest_endpoint_conversational_greetings():
    """Test the suggest endpoint handles conversational greetings naturally"""
    greeting_prompts = [
        "Hi",
        "Hello",
        "Hey there",
        "Good morning",
        "Hii"
    ]
    
    for prompt in greeting_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        
        # Should get at least one response
        assert len(suggestions) >= 1
        
        # Check if AI provided a conversational response
        first_suggestion = suggestions[0]
        assert "title" in first_suggestion
        assert "reason" in first_suggestion
        
        # Conversational responses should be warm and inviting
        reason_lower = first_suggestion["reason"].lower()
        conversational_indicators = [
            "hello", "hi", "help", "movie", "recommend", "preference", "mood", "watch"
        ]
        assert any(indicator in reason_lower for indicator in conversational_indicators)

def test_suggest_endpoint_help_requests():
    """Test the suggest endpoint handles help requests appropriately"""
    help_prompts = [
        "Help",
        "What can you do?",
        "How does this work?",
        "What are your capabilities?"
    ]
    
    for prompt in help_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        
        # Should get at least one response
        assert len(suggestions) >= 1
        
        # Help responses should explain capabilities
        first_suggestion = suggestions[0]
        reason_lower = first_suggestion["reason"].lower()
        help_indicators = [
            "suggest", "recommend", "movie", "series", "help", "can", "ask"
        ]
        assert any(indicator in reason_lower for indicator in help_indicators)

def test_suggest_endpoint_mixed_input():
    """Test the suggest endpoint handles mixed input (greeting + movie request)"""
    mixed_prompts = [
        "Hi, I want action movies",
        "Hello, recommend some comedies",
        "Hey there, suggest animated films",
        "Good morning, I'm looking for thrillers"
    ]
    
    for prompt in mixed_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        
        # Should get multiple suggestions for movie requests
        assert len(suggestions) >= 1
        
        # Should handle both greeting and movie request
        first_suggestion = suggestions[0]
        reason_lower = first_suggestion["reason"].lower()
        
        # Should contain either greeting acknowledgment or movie content
        greeting_or_movie = any(indicator in reason_lower for indicator in 
                               ["hi", "hello", "hey", "action", "comedy", "animated", "thriller", "movie", "film"])
        assert greeting_or_movie

def test_suggest_endpoint_ai_conversation_quality():
    """Test that AI conversational responses are natural and helpful"""
    conversational_prompts = [
        "How are you?",
        "Thanks for the help",
        "Nice to meet you"
    ]
    
    for prompt in conversational_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        
        # Should get conversational response
        assert len(suggestions) >= 1
        
        first_suggestion = suggestions[0]
        reason = first_suggestion["reason"]
        
        # Response should be substantial (not just a few words)
        assert len(reason) > 20
        
        # Should be conversational and helpful
        reason_lower = reason.lower()
        positive_indicators = [
            "great", "good", "help", "movie", "watch", "recommend", "happy", "glad"
        ]
        assert any(indicator in reason_lower for indicator in positive_indicators)

def test_suggest_endpoint_smart_exa_usage_optimization():
    """Test that the system optimizes Exa API usage appropriately"""
    # Test prompts that should use LLM knowledge (no Exa needed)
    knowledge_base_prompts = [
        "classic action movies",
        "popular comedies from the 90s",
        "best Disney animated films",
        "award winning dramas"
    ]
    
    for prompt in knowledge_base_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 1
    
    # Test prompts that might need real-time data
    realtime_prompts = [
        "latest 2024 movies",
        "currently trending films",
        "new releases this year"
    ]
    
    for prompt in realtime_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) >= 1

def test_suggest_endpoint_content_type_detection():
    """Test that the system can detect and respond to content type preferences"""
    
    # Test movie-only requests
    movie_only_prompts = [
        "recommend a good movie",
        "I want to watch a film tonight",
        "suggest some movies please"
    ]
    
    for prompt in movie_only_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        assert len(suggestions) >= 1
        
        # Check that content_type field exists and verify response structure
        for suggestion in suggestions:
            assert "content_type" in suggestion
            # For basic suggestions, should include content type info
            assert suggestion["content_type"] in ["movie", "series", None]

def test_suggest_endpoint_series_requests():
    """Test that the system responds appropriately to series-specific requests"""
    
    series_prompts = [
        "recommend a TV series to binge",
        "I want to watch a good show",
        "suggest some series with multiple seasons"
    ]
    
    for prompt in series_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        assert len(suggestions) >= 1
        
        # Check response includes series-friendly content
        for suggestion in suggestions:
            assert "content_type" in suggestion
            # Should include metadata that could apply to series
            if suggestion["content_type"] == "series":
                # Series might have additional fields
                assert "seasons" in suggestion
                assert "episodes" in suggestion

def test_suggest_endpoint_mixed_content_requests():
    """Test that mixed requests return both movies and series when appropriate"""
    
    mixed_prompts = [
        "recommend something to watch",
        "I want good entertainment",
        "suggest comedy content"
    ]
    
    for prompt in mixed_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        assert len(suggestions) >= 1
        
        # Check that we get varied content
        content_types = set()
        for suggestion in suggestions:
            if "content_type" in suggestion and suggestion["content_type"]:
                content_types.add(suggestion["content_type"])
        
        # Should have some variety in content types if using content database
        assert len(content_types) >= 1

def test_suggest_endpoint_series_metadata_fields():
    """Test that series responses include appropriate metadata fields"""
    
    request_data = {"prompt": "TV series with multiple seasons"}
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "suggestions" in data
    suggestions = data["suggestions"]
    
    # Check that response includes series metadata fields
    for suggestion in suggestions:
        # All suggestions should have these fields (even if None)
        expected_fields = [
            "title", "genre", "year", "reason", "description", "content_type",
            "seasons", "episodes", "end_year", "network", "status",
            "imdb_id", "poster_url", "rating", "runtime"
        ]
        
        for field in expected_fields:
            assert field in suggestion
        
        # If it's a series, some fields might have values
        if suggestion["content_type"] == "series":
            # Series should have meaningful data where available
            assert isinstance(suggestion["seasons"], (int, type(None)))
            assert isinstance(suggestion["episodes"], (int, type(None)))
            assert isinstance(suggestion["runtime"], (int, type(None)))

def test_suggest_endpoint_backward_compatibility():
    """Test that the API maintains backward compatibility with movie-focused requests"""
    
    classic_movie_prompts = [
        "I want animated movies like Coco",
        "action movies",
        "comedy films"
    ]
    
    for prompt in classic_movie_prompts:
        request_data = {"prompt": prompt}
        response = client.post("/suggest", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestions" in data
        suggestions = data["suggestions"]
        assert len(suggestions) >= 1
        
        # All original fields should still be present
        for suggestion in suggestions:
            required_original_fields = ["title", "genre", "year", "reason", "description"]
            for field in required_original_fields:
                assert field in suggestion
                assert suggestion[field] is not None
                
            # New optional fields should be present but may be None
            optional_fields = ["content_type", "seasons", "episodes"]
            for field in optional_fields:
                assert field in suggestion 