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
        "prompt": "I want animated movies like Coco",
        "lang": "en"
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

def test_suggest_endpoint_spanish_lang():
    """Test the suggest endpoint returns Spanish responses for lang=es"""
    request_data = {
        "prompt": "películas animadas como Coco",
        "lang": "es"
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
    request_data = {
        "lang": "en"
    }
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
        "prompt": "",
        "lang": "en"
    }
    response = client.post("/suggest", json=request_data)
    assert response.status_code == 422  # FastAPI validation error
    
    data = response.json()
    assert "detail" in data

def test_suggest_endpoint_long_prompt():
    """Test the suggest endpoint returns 400 for prompt exceeding max length"""
    long_prompt = "a" * 501  # Exceeds max_length=500
    request_data = {
        "prompt": long_prompt,
        "lang": "en"
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
        "prompt": "I love superhero action movies",
        "lang": "en"
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
        "prompt": "animated Disney Pixar movies",
        "lang": "en"
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
        "prompt": "good movies",
        "lang": "en"
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