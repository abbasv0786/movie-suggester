# Movie Suggester AI

An AI-powered movie suggestion API built with FastAPI.

## Features

- **Movie Suggestions**: AI-powered movie recommendations via `/suggest` endpoint
- **Multilingual Support**: English and Spanish keyword detection and responses
- **Input Validation**: Robust Pydantic-based request validation
- **Health Check**: Simple health endpoint to verify service status
- **FastAPI Framework**: High-performance, modern Python web framework
- **Async Support**: Built for scalability with async/await
- **Auto Documentation**: Interactive API docs at `/docs`

## Quick Start

### Prerequisites

- Python 3.11+
- uv package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys:
   # GEMINI_API_KEY=your_gemini_api_key_here
   # EXA_API_KEY=your_exa_api_key_here
   ```

### Running the Application

```bash
# Using uv
uv run python main.py

# Or activate virtual environment and run directly
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Example Usage

```bash
# Get movie suggestions
curl -X POST "http://localhost:8000/suggest" \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "I want animated movies like Coco",
       "lang": "en"
     }'

# Response:
{
  "suggestions": [
    {
      "title": "Encanto",
      "reason": "A vibrant animated film about a magical family in Colombia"
    },
    {
      "title": "Coco", 
      "reason": "Beautiful story about family and Mexican tradition"
    },
    {
      "title": "Moana",
      "reason": "Musical adventure about courage and self-determination"
    }
  ]
}
```

## Endpoints

- `GET /` - API welcome and information
- `GET /health` - Health check endpoint  
- `POST /suggest` - Movie suggestion endpoint (accepts movie preferences)

## Development

### Running Tests

```bash
uv run pytest tests/ -v
```

### Project Structure

```
movie-suggestor/
├── main.py              # FastAPI application entry point
├── src/                 # Source modules (future implementations)
├── tests/               # Test suite
└── pyproject.toml       # Project configuration
```

## Contributing

This project follows Python best practices and uses:
- FastAPI for the web framework
- uvicorn for the ASGI server
- pytest for testing
- uv for dependency management

## License

MIT 