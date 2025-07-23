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

### Frontend (React)
- **Chat Interface**: Interactive chat-based movie suggestion experience
- **Movie Cards**: Beautiful movie recommendation cards with posters and details
- **Responsive Grid Layout**: 2-column grid layout for movie suggestions (single column on mobile)
- **Real-time Chat**: Seamless communication with AI movie assistant
- **Modern UI**: Built with React 18, TypeScript, and styled-components
- **Fast Development**: Powered by Vite and Bun package manager
- **Animations**: Smooth transitions and animations using Framer Motion

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

### Frontend Development

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

   The frontend will be available at `http://localhost:3000`

4. Build for production:
   ```bash
   bun run build
   ```

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
- ✅ **Backend**: Fully functional FastAPI application with movie suggestions
- ✅ **Frontend**: Complete React application with chat interface and movie cards
- ✅ **Integration**: Frontend-backend integration working with real-time API calls
- ✅ **UI/UX**: Responsive grid layout with 2-column movie suggestions display

## Recent Updates

### UI/UX Improvements
- **Grid Layout Enhancement**: Fixed movie recommendations to display in a proper 2-column grid layout for better visual organization
- **Responsive Design**: Maintained single-column layout on mobile devices for optimal mobile experience
- **Visual Alignment**: Improved spacing and alignment of movie suggestion cards

### Technical Improvements
- Enhanced chat interface with better message handling
- Improved IMDB service integration for better movie data retrieval
- Updated hook implementations for more reliable state management

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

### Frontend
- **React 18**: Modern frontend framework with hooks and functional components
- **TypeScript**: Type-safe JavaScript with comprehensive type definitions
- **Vite**: Fast build tool and dev server
- **Bun**: Fast package manager and runtime
- **Styled Components**: CSS-in-JS for component styling
- **Framer Motion**: Smooth animations and transitions
- **React Query**: Server state management and API integration
- **React Router**: Client-side routing and navigation

## Contributing

1. **Backend changes**: Work in `backend/` directory
2. **Frontend changes**: Work in `frontend/` directory
3. **Documentation**: Update relevant README files
4. **Testing**: Run appropriate test suites before submitting changes
5. **UI/UX improvements**: Focus on responsive design and user experience
6. **Code formatting**: Ensure consistent code style across the project

## License

MIT 