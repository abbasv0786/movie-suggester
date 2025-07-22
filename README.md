# Movie Suggester AI - Monorepo

An AI-powered movie suggestion application with a FastAPI backend and React frontend.

## Project Structure

This is a **monorepo** containing both frontend and backend applications:

```
Movie-suggestor/
├── frontend/           # React + TypeScript + Bun frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   ├── package.json    # Frontend dependencies
│   ├── tsconfig.json   # TypeScript configuration
│   └── vite.config.ts  # Vite build configuration
│
├── backend/            # FastAPI + Python + uv backend
│   ├── src/            # Source modules
│   ├── tests/          # Test suite
│   ├── main.py         # FastAPI application entry point
│   ├── pyproject.toml  # Project configuration
│   └── uv.lock         # Dependency lock file
│
├── docs/               # Project documentation
└── README.md           # This file
```

## Features

### Backend (FastAPI)
- **Movie Suggestions**: AI-powered movie recommendations via `/suggest` endpoint
- **Multilingual Support**: English and Spanish keyword detection and responses
- **Input Validation**: Robust Pydantic-based request validation
- **Health Check**: Simple health endpoint to verify service status
- **Auto Documentation**: Interactive API docs at `/docs`

### Frontend (React) - *Coming Soon*
- Modern React 18 with TypeScript
- Responsive UI built with Vite
- Fast development with Bun package manager

## Quick Start

### Prerequisites

- **Backend**: Python 3.11+, `uv` package manager
- **Frontend**: Bun 1.0+ *(for future frontend development)*

### Backend Development

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

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

4. Run the backend:
   ```bash
   uv run python main.py
   ```

   The API will be available at `http://localhost:8000`

### Frontend Development *(Coming Soon)*

Frontend setup and development instructions will be added in future stories.

## API Documentation

- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Usage Example

```bash
# Get movie suggestions
curl -X POST "http://localhost:8000/suggest" \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "I want animated movies like Coco",
       "lang": "en"
     }'
```

## Development Workflow

### Monorepo Benefits
- **Shared Types**: TypeScript interfaces shared between frontend/backend *(future)*
- **Unified Testing**: End-to-end tests covering full user journey *(future)*
- **Consistent Tooling**: Shared linting, formatting, and CI/CD *(future)*
- **Atomic Deployments**: Deploy frontend/backend changes together *(future)*
- **Developer Experience**: Single repository for full-stack development

### Current Development Status
- ✅ **Backend**: Fully functional FastAPI application
- 🚧 **Frontend**: Directory structure prepared, implementation pending
- 🚧 **Integration**: Frontend-backend integration pending

## Testing

### Backend Tests
```bash
cd backend
uv run pytest tests/ -v
```

### Integration Tests *(Future)*
Full-stack integration tests will be added as the frontend is developed.

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **Python 3.11+**: Core language
- **uv**: Fast Python package manager
- **Pydantic**: Data validation and serialization
- **Gemini 2.0 Flash**: LLM for intelligent suggestions
- **Exa API**: Real-time movie data search

### Frontend *(Prepared)*
- **React 18**: Modern frontend framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Bun**: Fast package manager and runtime

## Contributing

1. Backend changes: Work in `backend/` directory
2. Frontend changes: Work in `frontend/` directory *(when implemented)*
3. Documentation: Update relevant README files
4. Testing: Run appropriate test suites before submitting changes

## License

MIT 