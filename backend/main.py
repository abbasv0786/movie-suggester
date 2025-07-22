"""
Movie Suggester AI - FastAPI Application Entry Point
"""
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import logging

# Import constants and agent modules
from src.constants import EMERGENCY_FALLBACK_MOVIES
from src.language_manager import LanguageManager
from src.search_agent import SearchAgent
from src.prompt_engine import PromptEngine
from src.llm_agent import LLMAgent
from src.suggestion_engine import MovieSuggestionEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Pydantic Models for /suggest endpoint
class SuggestionRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1500, description="Movie preference description")
    lang: Optional[str] = Field("en", max_length=5, description="Language code (e.g., 'en', 'es')")

class MovieSuggestion(BaseModel):
    title: str = Field(..., description="Movie title")
    genre: List[str] = Field(..., description="Movie genres")
    year: int = Field(..., description="Movie release year")
    reason: str = Field(..., description="Explanation for recommendation")
    description: str = Field(..., description="Brief movie description")

class SuggestionResponse(BaseModel):
    suggestions: List[MovieSuggestion] = Field(..., description="List of movie recommendations")

# Initialize FastAPI app
app = FastAPI(
    title="Movie Suggester AI",
    description="AI-powered movie suggestion API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize suggestion engine (always available for basic suggestions)
try:
    suggestion_engine = MovieSuggestionEngine()
    logger.info("Basic suggestion engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize suggestion engine: {e}")
    suggestion_engine = None

# Initialize agent instances
try:
    language_manager = LanguageManager()
    search_agent = SearchAgent()
    prompt_engine = PromptEngine()
    llm_agent = LLMAgent()
    logger.info("All agents initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agents: {e}")
    # Will fallback to basic suggestion logic if agents fail to initialize
    language_manager = None
    search_agent = None
    prompt_engine = None
    llm_agent = None

# Configure CORS - restrict origins in production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - API welcome and information"""
    return {
        "message": "Welcome to Movie Suggester AI",
        "description": "AI-powered movie suggestion API",
        "version": "0.1.0",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "suggest": "/suggest",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "github": "https://github.com/your-username/movie-suggestor"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint to verify service status"""
    try:
        return {
            "status": "healthy", 
            "service": "movie-suggester-ai",
            "version": "0.1.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.post("/suggest", response_model=SuggestionResponse)
async def suggest_movies(request: SuggestionRequest):
    """Movie suggestion endpoint - returns personalized movie recommendations"""
    try:
        logger.info(f"Processing suggestion request: prompt='{request.prompt[:50]}...', lang={request.lang}")
        
        # Check if full LLM agents are available for advanced suggestions
        if all([language_manager, search_agent, prompt_engine, llm_agent]):
            logger.info("Using advanced LLM-powered suggestion flow")
            return await _advanced_llm_suggestions(request)
        
        # Fallback to basic suggestion engine
        if suggestion_engine:
            logger.info("Using basic suggestion engine")
            return await _basic_suggestions(request)
        
        # Emergency fallback if everything fails
        logger.warning("All suggestion systems unavailable, using emergency fallback")
        return await _emergency_fallback_suggestions(request)
        
    except Exception as e:
        logger.error(f"Error processing suggestion request: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Unable to process movie suggestion request"
        )

async def _advanced_llm_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Advanced LLM-powered suggestion flow for future integration"""
    # REAL AGENT INTEGRATION FLOW - Kept for future Epic 2
    
    # Step 1: Process multilingual request and detect language
    language_result = await language_manager.process_multilingual_request(
        request.prompt, request.lang
    )
    english_prompt = language_result["english_text"]
    target_language = language_result["target_language"]
    
    # Step 2: Search for real-time movie data
    search_results = await search_agent.search_movies(english_prompt, num_results=5)
    logger.info(f"Retrieved {len(search_results)} search results")
    
    # Step 3: Construct structured prompt with search context
    structured_prompt = prompt_engine.construct_movie_prompt(
        english_prompt, search_results, target_language
    )
    
    # Step 4: Generate AI-powered suggestions
    ai_suggestions = await llm_agent.generate_suggestions(
        english_prompt, search_results, target_language
    )
    
    # Step 5: Convert to response format and translate if needed
    suggestions = []
    for suggestion in ai_suggestions:
        title = suggestion.get("title", "Unknown Movie")
        reason = suggestion.get("reason", "Great movie recommendation")
        
        # Translate to target language if needed
        if target_language != "en":
            reason = await language_manager.translate_from_english(reason, target_language)
        
        # Note: LLM suggestions need to be enhanced with genre, year, description
        # For now, use basic fallback structure
        suggestions.append(MovieSuggestion(
            title=title, 
            genre=["unknown"], 
            year=2020, 
            reason=reason,
            description="AI-powered movie recommendation"
        ))
    
    # Ensure we have at least some suggestions with proper genre information
    if not suggestions or all(s.genre == ["unknown"] for s in suggestions):
        logger.warning("No AI suggestions generated or invalid genre data, using basic engine")
        return await _basic_suggestions(request)
    
    logger.info(f"Returning {len(suggestions)} AI-powered suggestions")
    return SuggestionResponse(suggestions=suggestions)

async def _basic_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Basic suggestion logic using MovieSuggestionEngine"""
    try:
        # Use the suggestion engine to get recommendations
        suggestion_results = suggestion_engine.suggest_movies(request.prompt, count=3)
        
        suggestions = []
        for result in suggestion_results:
            movie = result.movie
            suggestions.append(MovieSuggestion(
                title=movie.title,
                genre=movie.genre,
                year=movie.year,
                reason=result.reason,
                description=movie.description
            ))
        
        logger.info(f"Generated {len(suggestions)} basic suggestions")
        return SuggestionResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error in basic suggestions: {e}")
        return await _emergency_fallback_suggestions(request)

async def _emergency_fallback_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Emergency fallback when all suggestion systems fail"""
    suggestions = [
        MovieSuggestion(**movie_data) for movie_data in EMERGENCY_FALLBACK_MOVIES
    ]
    
    return SuggestionResponse(suggestions=suggestions)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors"""
    logger.error(f"Unexpected error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": str(request.url)
        }
    )

def main():
    """Entry point for the application"""
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    logger.info(f"Starting Movie Suggester AI on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main() 