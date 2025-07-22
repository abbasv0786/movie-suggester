"""
Movie Suggester AI - FastAPI Application Entry Point (Simplified)
"""
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import logging
import json

# Import simplified modules
from src.constants import AI_FALLBACK_ENABLED, AI_FALLBACK_MIN_SUGGESTIONS
from src.llm_agent import LLMAgent
from src.suggestion_engine import MovieSuggestionEngine
from src.poster_service import PosterService
# COMMENTED OUT - Language manager and search agent removed for simplicity
# from src.language_manager import LanguageManager
# from src.search_agent import SearchAgent
# from src.prompt_engine import PromptEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Pydantic Models
class SuggestionRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1500, description="Movie preference description")

class MovieSuggestion(BaseModel):
    title: str = Field(..., description="Content title")
    genre: List[str] = Field(..., description="Content genres")
    year: int = Field(..., description="Release year")
    reason: str = Field(..., description="Explanation for recommendation")
    description: str = Field(..., description="Brief content description")
    content_type: Optional[str] = Field("movie", description="Content type: 'movie' or 'series'")
    
    # IMDB and poster fields (NEW)
    poster_url: Optional[str] = Field(None, description="Movie/series poster image URL")
    imdb_id: Optional[str] = Field(None, description="IMDB ID")
    imdb_rating: Optional[float] = Field(None, description="IMDB rating (0-10)")
    imdb_title: Optional[str] = Field(None, description="Official IMDB title")

class SuggestionResponse(BaseModel):
    suggestions: List[MovieSuggestion] = Field(..., description="List of movie recommendations")

# Initialize FastAPI app
app = FastAPI(
    title="Movie Suggester AI",
    description="AI-powered movie suggestion API using DeepSeek with movie posters",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize simplified components
try:
    llm_agent = LLMAgent()
    logger.info("DeepSeek LLM agent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize LLM agent: {e}")
    llm_agent = None

# Initialize poster service
try:
    poster_service = PosterService()
    logger.info("Poster service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize poster service: {e}")
    poster_service = None

# Fallback suggestion engine
try:
    suggestion_engine = MovieSuggestionEngine()
    logger.info("Fallback suggestion engine initialized")
except Exception as e:
    logger.error(f"Failed to initialize suggestion engine: {e}")
    suggestion_engine = None

# Configure CORS
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
        "description": "AI-powered movie suggestion API using DeepSeek with movie posters",
        "version": "0.2.0",
        "status": "active",
        "model": "deepseek/deepseek-r1:free",
        "features": [
            "🤖 DeepSeek AI recommendations",
            "🎬 Movie poster integration", 
            "📡 Streaming support",
            "🌍 Multilingual responses",
            "⭐ IMDB ratings & data"
        ],
        "endpoints": {
            "health": "/health",
            "suggest": "/suggest",
            "suggest_stream": "/suggest/stream",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "improvements": [
            "Simplified architecture",
            "DeepSeek integration via OpenRouter", 
            "Streaming support",
            "Multilingual built-in",
            "Movie posters & IMDB data",
            "Exa Labs ready for future"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "healthy", 
            "service": "movie-suggester-ai",
            "version": "0.2.0",
            "model": "deepseek/deepseek-r1:free",
            "llm_agent": "ready" if llm_agent else "unavailable",
            "poster_service": "ready" if poster_service else "unavailable"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.post("/suggest", response_model=SuggestionResponse)
async def suggest_movies(request: SuggestionRequest):
    """Movie suggestion endpoint - simplified flow using DeepSeek"""
    try:
        logger.info(f"Processing suggestion request: '{request.prompt[:50]}...'")
        
        # Use DeepSeek for suggestions if available
        if llm_agent:
            logger.info("Using DeepSeek for AI-powered suggestions")
            return await _deepseek_suggestions(request)
        
        # Fallback to basic suggestion engine
        if suggestion_engine:
            logger.info("Using basic suggestion engine fallback")
            return await _basic_suggestions(request)
        
        # Emergency fallback
        logger.warning("All systems unavailable, using emergency fallback")
        return await _emergency_fallback(request)
        
    except Exception as e:
        logger.error(f"Error processing suggestion request: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Unable to process movie suggestion request"
        )

@app.post("/suggest/stream")
async def suggest_movies_stream(request: SuggestionRequest):
    """Streaming movie suggestion endpoint using DeepSeek with poster enrichment"""
    try:
        logger.info(f"Starting streaming suggestions for: '{request.prompt[:50]}...'")
        
        if not llm_agent:
            raise HTTPException(status_code=503, detail="Streaming service unavailable")
        
        async def generate_enriched_stream():
            """Generate streaming response with poster enrichment"""
            try:
                # Step 1: Stream the raw AI response while collecting it
                logger.info("🎬 Streaming AI response...")
                yield f"data: {json.dumps({'status': 'Generating AI suggestions...'})}\n\n"
                
                collected_content = ""
                async for chunk in llm_agent.generate_suggestions_stream(request.prompt):
                    # Stream the raw content to user
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                    collected_content += chunk
                
                # Step 2: Parse the complete AI response
                logger.info("🎨 Parsing AI response and fetching posters...")
                yield f"data: {json.dumps({'status': 'Fetching movie posters...'})}\n\n"
                
                # Parse the collected content into suggestions
                ai_suggestions = llm_agent.parse_suggestions(collected_content)
                
                if not ai_suggestions:
                    yield f"data: {json.dumps({'error': 'No suggestions generated'})}\n\n"
                    return
                
                # Step 3: Fetch posters for movie titles
                movie_titles_for_posters = []
                suggestions = []
                
                for suggestion in ai_suggestions:
                    title = suggestion.get("title", "Unknown")
                    reason = suggestion.get("reason", "AI recommendation")
                    
                    if title not in ["Chat Response", "Help Response"]:
                        movie_titles_for_posters.append(title)
                    
                    suggestions.append(MovieSuggestion(
                        title=title,
                        genre=["recommendation"],
                        year=2024,
                        reason=reason,
                        description="AI-powered movie/series recommendation using DeepSeek",
                        content_type="movie"
                    ))
                
                # Step 4: Fetch posters concurrently
                if movie_titles_for_posters and poster_service:
                    try:
                        poster_data = await poster_service.get_multiple_posters(movie_titles_for_posters)
                        
                        # Update suggestions with poster data
                        for suggestion in suggestions:
                            if suggestion.title in poster_data and poster_data[suggestion.title]:
                                poster_info = poster_data[suggestion.title]
                                
                                suggestion.poster_url = poster_info.get("poster_url")
                                suggestion.imdb_id = poster_info.get("imdb_id")
                                suggestion.imdb_rating = poster_info.get("rating")
                                suggestion.imdb_title = poster_info.get("imdb_title")
                                
                                if poster_info.get("year"):
                                    try:
                                        suggestion.year = int(poster_info["year"])
                                    except (ValueError, TypeError):
                                        pass
                                
                                if suggestion.poster_url:
                                    suggestion.description = f"AI-powered recommendation with poster and IMDB data (Rating: {suggestion.imdb_rating or 'N/A'})"
                        
                        poster_count = len([s for s in suggestions if s.poster_url])
                        logger.info(f"✅ Enhanced {poster_count} suggestions with posters")
                        
                    except Exception as e:
                        logger.error(f"Error fetching posters: {e}")
                
                # Step 5: Stream the final enriched response
                yield f"data: {json.dumps({'status': 'Finalizing with posters...'})}\n\n"
                
                # Convert suggestions to dict format for JSON serialization
                enriched_response = {
                    "suggestions": [
                        {
                            "title": s.title,
                            "genre": s.genre,
                            "year": s.year,
                            "reason": s.reason,
                            "description": s.description,
                            "content_type": s.content_type,
                            "poster_url": s.poster_url,
                            "imdb_id": s.imdb_id,
                            "imdb_rating": s.imdb_rating,
                            "imdb_title": s.imdb_title
                        }
                        for s in suggestions
                    ]
                }
                
                # Stream the final enriched result
                yield f"data: {json.dumps({'final_result': enriched_response})}\n\n"
                
                # Send completion signal
                yield f"data: {json.dumps({'complete': True, 'poster_count': len([s for s in suggestions if s.poster_url])})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in enriched streaming: {e}")
                error_response = json.dumps({'error': str(e), 'fallback': True})
                yield f"data: {error_response}\n\n"
        
        return StreamingResponse(
            generate_enriched_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up enriched streaming: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to start streaming suggestions")

async def _deepseek_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Generate suggestions using DeepSeek via OpenRouter with poster enrichment"""
    try:
        # Get AI suggestions from DeepSeek
        ai_suggestions = await llm_agent.generate_suggestions(request.prompt)
        
        suggestions = []
        movie_titles_for_posters = []
        
        # First pass: Create suggestions and collect movie titles
        for suggestion in ai_suggestions:
            title = suggestion.get("title", "Unknown")
            reason = suggestion.get("reason", "AI recommendation")
            
            # Handle different response types
            if title in ["Chat Response", "Help Response"]:
                # Conversational responses (no posters needed)
                suggestions.append(MovieSuggestion(
                    title=title,
                    genre=["conversation"],
                    year=2024,
                    reason=reason,
                    description="AI conversational response",
                    content_type="chat"
                ))
            else:
                # Movie/series suggestions (collect for poster fetching)
                movie_titles_for_posters.append(title)
                suggestions.append(MovieSuggestion(
                    title=title,
                    genre=["recommendation"],
                    year=2024,  # Default year for AI suggestions
                    reason=reason,
                    description="AI-powered movie/series recommendation using DeepSeek",
                    content_type="movie"
                ))
        
        # Second pass: Fetch posters for movie/series suggestions
        if movie_titles_for_posters and poster_service:
            logger.info(f"Fetching posters for {len(movie_titles_for_posters)} titles")
            
            try:
                poster_data = await poster_service.get_multiple_posters(movie_titles_for_posters)
                
                # Update suggestions with poster data
                for suggestion in suggestions:
                    if suggestion.title in poster_data and poster_data[suggestion.title]:
                        poster_info = poster_data[suggestion.title]
                        
                        # Update suggestion with IMDB data
                        suggestion.poster_url = poster_info.get("poster_url")
                        suggestion.imdb_id = poster_info.get("imdb_id")
                        suggestion.imdb_rating = poster_info.get("rating")
                        suggestion.imdb_title = poster_info.get("imdb_title")
                        
                        # Update year if we got it from IMDB
                        if poster_info.get("year"):
                            try:
                                suggestion.year = int(poster_info["year"])
                            except (ValueError, TypeError):
                                pass
                        
                        # Update content type if we got it from IMDB
                        if poster_info.get("type"):
                            imdb_type = poster_info["type"].lower()
                            if imdb_type in ["movie", "series", "tv series"]:
                                suggestion.content_type = "series" if "series" in imdb_type else "movie"
                        
                        # Enhanced description with IMDB data
                        if suggestion.poster_url:
                            suggestion.description = f"AI-powered recommendation with poster and IMDB data (Rating: {suggestion.imdb_rating or 'N/A'})"
                        
                logger.info(f"Successfully enriched {len([s for s in suggestions if s.poster_url])} suggestions with poster data")
                
            except Exception as e:
                logger.error(f"Error fetching posters: {e}")
                # Continue without posters - not a critical failure
        
        if not suggestions:
            logger.warning("No AI suggestions generated, using fallback")
            return await _basic_suggestions(request)
        
        logger.info(f"Generated {len(suggestions)} DeepSeek-powered suggestions (with poster enrichment)")
        return SuggestionResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error in DeepSeek suggestions: {e}")
        return await _basic_suggestions(request)

async def _basic_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Basic fallback using suggestion engine with poster enrichment"""
    try:
        if not suggestion_engine:
            return await _emergency_fallback(request)
            
        suggestion_results = suggestion_engine.suggest_movies(request.prompt, count=3)
        
        suggestions = []
        movie_titles_for_posters = []
        
        # First pass: Create suggestions and collect titles
        for result in suggestion_results:
            content = result.movie
            
            suggestion = MovieSuggestion(
                title=content.title,
                genre=content.genre,
                year=content.year,
                reason=result.reason,
                description=content.description,
                content_type=getattr(content, 'content_type', 'movie')
            )
            suggestions.append(suggestion)
            movie_titles_for_posters.append(content.title)
        
        # Second pass: Fetch posters for suggestions
        if movie_titles_for_posters and poster_service:
            try:
                poster_data = await poster_service.get_multiple_posters(movie_titles_for_posters)
                
                # Update suggestions with poster data
                for suggestion in suggestions:
                    if suggestion.title in poster_data and poster_data[suggestion.title]:
                        poster_info = poster_data[suggestion.title]
                        
                        suggestion.poster_url = poster_info.get("poster_url")
                        suggestion.imdb_id = poster_info.get("imdb_id")
                        suggestion.imdb_rating = poster_info.get("rating")
                        suggestion.imdb_title = poster_info.get("imdb_title")
                        
                        if suggestion.poster_url:
                            suggestion.description = f"Fallback recommendation with poster and IMDB data (Rating: {suggestion.imdb_rating or 'N/A'})"
                
                logger.info(f"Enriched {len([s for s in suggestions if s.poster_url])} basic suggestions with posters")
                
            except Exception as e:
                logger.error(f"Error fetching posters for basic suggestions: {e}")
        
        logger.info(f"Generated {len(suggestions)} basic suggestions with poster enrichment")
        return SuggestionResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error in basic suggestions: {e}")
        return await _emergency_fallback(request)

async def _emergency_fallback(request: SuggestionRequest) -> SuggestionResponse:
    """Emergency fallback when all systems fail - with some poster attempts"""
    logger.warning("Using emergency fallback suggestions")
    
    # Create fallback suggestions with well-known movies
    fallback_data = [
        {
            "title": "The Shawshank Redemption",
            "genre": ["drama"],
            "year": 1994,
            "reason": f"A timeless classic that appeals to most viewers. Based on your request: '{request.prompt}'",
            "description": "Emergency fallback recommendation"
        },
        {
            "title": "Inception",
            "genre": ["sci-fi", "thriller"],
            "year": 2010,
            "reason": "A mind-bending thriller with universal appeal and excellent storytelling.",
            "description": "Emergency fallback recommendation"
        },
        {
            "title": "Spirited Away",
            "genre": ["animation", "fantasy"],
            "year": 2001,
            "reason": "A beautiful animated film perfect for all ages with incredible artistry.",
            "description": "Emergency fallback recommendation"
        }
    ]
    
    fallback_suggestions = []
    titles_for_posters = []
    
    # Create suggestions
    for data in fallback_data:
        suggestion = MovieSuggestion(
            title=data["title"],
            genre=data["genre"],
            year=data["year"],
            reason=data["reason"],
            description=data["description"],
            content_type="movie"
        )
        fallback_suggestions.append(suggestion)
        titles_for_posters.append(data["title"])
    
    # Try to get posters even for emergency fallback
    if poster_service:
        try:
            logger.info("Attempting to fetch posters for emergency fallback suggestions")
            poster_data = await poster_service.get_multiple_posters(titles_for_posters)
            
            for suggestion in fallback_suggestions:
                if suggestion.title in poster_data and poster_data[suggestion.title]:
                    poster_info = poster_data[suggestion.title]
                    
                    suggestion.poster_url = poster_info.get("poster_url")
                    suggestion.imdb_id = poster_info.get("imdb_id")
                    suggestion.imdb_rating = poster_info.get("rating")
                    suggestion.imdb_title = poster_info.get("imdb_title")
                    
                    if suggestion.poster_url:
                        suggestion.description = f"Emergency fallback with poster (Rating: {suggestion.imdb_rating or 'N/A'})"
            
            logger.info(f"Emergency fallback: Got posters for {len([s for s in fallback_suggestions if s.poster_url])} suggestions")
            
        except Exception as e:
            logger.error(f"Failed to fetch posters for emergency fallback: {e}")
    
    return SuggestionResponse(suggestions=fallback_suggestions)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with cleanup"""
    logger.error(f"Unexpected error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": str(request.url),
            "suggestion": "Check API key configuration and try again"
        }
    )

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on app shutdown"""
    try:
        if poster_service:
            await poster_service.close()
            logger.info("Poster service closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown cleanup: {e}")

def main():
    """Entry point for the application"""
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    logger.info(f"Starting simplified Movie Suggester AI on {host}:{port}")
    logger.info("Using DeepSeek model via OpenRouter")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main() 