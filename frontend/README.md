# Movie Suggester - Frontend

A modern React chat interface for AI-powered movie recommendations, built with TypeScript, Bun, and cutting-edge UI technologies.

## 🚀 Quick Start

### Prerequisites

- **Bun** (≥1.0.0) - Fast JavaScript runtime and package manager
- **Node.js** (≥18.0.0) - Required for some dependencies
- **Modern browser** - Chrome, Firefox, Safari, or Edge

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp env.template .env
   ```

2. **Configure your environment variables**:
   ```bash
   # Edit .env file with your settings
   VITE_API_URL=http://localhost:8000  # Your backend API URL
   VITE_USE_PROXY=false                # Use Vite proxy for development
   VITE_DEBUG_MODE=true               # Enable debug logging
   ```

3. **For production deployment** (Netlify):
   - Set `VITE_API_URL` to your production backend URL
   - Example: `VITE_API_URL=https://your-backend-api.com`
   - Copy `env.production.example` to `.env.production` for production builds

### Installation

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # Reload your shell or run: exec /bin/zsh
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   bun install
   ```

3. **Start development server**:
   ```bash
   bun run dev
   ```

4. **Open in browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Movie AI chat interface

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run type-check` | Run TypeScript type checking |
| `bun run lint` | Run ESLint code analysis |
| `bun run setup` | Set up environment variables |

## 🔧 Environment Variables

The frontend uses environment variables to configure API endpoints and features. All variables are prefixed with `VITE_` to be accessible in the browser.

### Available Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` | ✅ |
| `VITE_USE_PROXY` | Use Vite dev proxy | `false` | ❌ |
| `VITE_DEBUG_MODE` | Enable debug logging | `true` | ❌ |
| `VITE_LOG_LEVEL` | Logging level | `debug` | ❌ |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` | ❌ |
| `VITE_ENABLE_ERROR_REPORTING` | Enable error reporting | `false` | ❌ |

### Quick Setup

```bash
# Run the setup script
bun run setup

# Or manually copy the template
cp env.template .env
```

### Development vs Production

- **Development**: Uses localhost backend URL
- **Production**: Uses your deployed backend URL
- **Netlify**: Set environment variables in Netlify dashboard

## 🎬 Testing the Chat Interface

### What You'll See

1. **Welcome Screen**: AI greeting with movie emoji
2. **Chat Header**: Shows message count and clear chat option
3. **Message Area**: Scrollable conversation with user/bot messages
4. **Input Box**: Multi-line text input with send button

### How to Test Features

#### 🗣 **Basic Chat Flow**
1. Type any message and press Enter or click Send
2. Watch the typing indicator appear
3. See the AI's mock response based on keywords

#### 🎯 **Trigger Specific Responses**
Try these phrases to see different AI responses with movie recommendations:

**Greetings:**
- `"Hello"`, `"Hi"`, `"Hey"` → Welcome message

**Action Movies:**
- `"action"`, `"adventure"`, `"superhero"`, `"fight"` → John Wick, Mad Max recommendations

**Comedy Movies:**
- `"comedy"`, `"funny"`, `"laugh"`, `"humor"` → Grand Budapest Hotel, Superbad recommendations

**Horror Movies:**
- `"horror"`, `"scary"`, `"spooky"`, `"ghost"` → Hereditary, Get Out recommendations

**Romance Movies:**
- `"romance"`, `"love"`, `"date night"` → Princess Bride, La La Land recommendations

**Sci-Fi Movies:**
- `"sci-fi"`, `"space"`, `"future"`, `"robot"` → Blade Runner, Interstellar recommendations

**Drama Movies:**
- `"drama"`, `"emotional"`, `"serious"` → Parasite, Moonlight recommendations

**General Recommendations:**
- `"recommend me something"`, `"what should I watch"`, `"good movie"` → Personalized help

**Default Response:**
- Anything else → Helpful guidance with genre suggestions

#### ⌨️ **Input Features**
- **Multi-line**: Use Shift+Enter for new lines
- **Quick Suggestions**: Click input when empty to see suggestions
- **Character Limit**: Watch the counter at 1600+ characters
- **Validation**: Try sending empty messages

#### 📱 **Responsive Design**
- **Desktop**: Full chat interface with hover effects
- **Mobile**: Touch-optimized with proper keyboard handling
- **Resize**: Try different browser window sizes

#### 🎨 **UI Features**
- **Auto-scroll**: Messages automatically scroll to bottom
- **Manual Scroll**: Scroll up to see scroll-to-bottom button
- **Message Status**: See sending → sent status on your messages
- **Typing Animation**: Watch the bouncing dots when AI responds
- **Clear Chat**: Use button in header to reset conversation

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── MessageBubble.tsx    # Message display component
│   │   └── InputBox.tsx         # Message input component
│   ├── hooks/               # Custom React hooks
│   │   └── useChat.ts           # Chat state management
│   ├── pages/               # Page components
│   │   ├── ChatTestPage.tsx     # Chat interface test page
│   │   └── TestPage.tsx         # Component showcase page
│   ├── types/               # TypeScript definitions
│   │   └── chat.ts              # Chat-related interfaces
│   ├── utils/               # Utility functions
│   │   └── messageUtils.ts      # Message formatting & validation
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## 🎨 Features Overview

### 💬 **Chat Interface**
- **Real-time messaging** with mock AI responses
- **Message persistence** across browser sessions
- **Typing indicators** with animated dots
- **Message status** (sending, sent, error)
- **Smart auto-scroll** with manual override detection

### 🎛 **Input System**
- **Multi-line support** with auto-resize
- **Quick suggestions** for common queries
- **Character limits** with visual feedback
- **Input validation** and error handling
- **Keyboard shortcuts** (Enter to send, Escape to close suggestions)

### 📱 **Responsive Design**
- **Mobile-first** approach with touch optimization
- **Breakpoints**: 320px (mobile), 768px (tablet), 1024px+ (desktop)
- **Touch-friendly** buttons (44px minimum)
- **Optimized keyboards** on iOS/Android

### 🎞 **UI/UX Features**
- **Smooth animations** with Framer Motion
- **Message bubbles** with distinct user/bot styling
- **Avatars and timestamps** on all messages
- **Empty state** with welcoming message
- **Error handling** with dismissible notifications

## 🔧 Technical Stack

### Core Technologies
- **React 18** - Modern hooks and concurrent features
- **TypeScript** - Full type safety and IntelliSense
- **Bun** - Ultra-fast package manager and runtime
- **Vite** - Lightning-fast build tool and dev server

### UI & Styling
- **Styled Components** - CSS-in-JS with theming
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Comprehensive icon library

### State & Data
- **Custom Hooks** - `useChat` for chat state management
- **localStorage** - Message persistence across sessions
- **Date-fns** - Elegant date formatting

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript strict mode** - Maximum type safety
- **Hot Module Replacement** - Instant development feedback

## 🐛 Troubleshooting

### Common Issues

#### **"Command not found: bun"**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
# Reload shell
exec /bin/zsh
```

#### **Port 3000 already in use**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or use different port
bun run dev --port 3001
```

#### **TypeScript errors**
```bash
# Check for errors
bun run type-check
# Common fix: restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### **Build failures**
```bash
# Clean and reinstall
rm -rf node_modules
rm bun.lockb
bun install
bun run build
```

### Development Tips

#### **VS Code Setup**
Recommended extensions:
- TypeScript and JavaScript Language Features
- Styled Components
- Prettier - Code formatter
- Auto Rename Tag

#### **Browser DevTools**
- **React DevTools** - Inspect component state
- **Network tab** - Check for console errors
- **Responsive mode** - Test mobile layouts

## 🚀 Build for Production

```bash
# Create optimized build
bun run build

# Preview production build locally
bun run preview

# Build output will be in ./dist/
# Current size: 333.71 kB (108.61 kB gzipped)
```

## 📈 Performance

### Current Metrics
- **Bundle size**: 333.71 kB (108.61 kB gzipped)
- **Build time**: ~4 seconds
- **Dev server startup**: ~1 second
- **Hot reload**: <100ms

### Optimizations
- **Tree shaking** - Unused code elimination
- **Code splitting** - Efficient loading
- **Animation hardware acceleration** - Smooth 60fps
- **Optimized scrolling** - Efficient message rendering

## 🎯 Next Steps

This chat interface is ready for integration with:
1. **Backend API** - Replace mock responses with real AI
2. **User Authentication** - Add user sessions and profiles  
3. **Movie Data** - Integrate with movie databases
4. **Advanced Features** - Voice input, image sharing, etc.

## 💡 Development Notes

### Key Design Decisions
- **Custom Hook Pattern** - Centralized chat logic in `useChat`
- **Component Composition** - Modular, reusable components
- **Type-First Approach** - Comprehensive TypeScript interfaces
- **Mobile-First Responsive** - Progressive enhancement from mobile
- **Performance-Oriented** - Optimized renders and animations

### Code Quality
- **Strict TypeScript** - Zero any types, full type safety
- **ESLint Rules** - Consistent code style and best practices
- **Semantic HTML** - Accessibility and SEO friendly
- **Error Boundaries** - Graceful error handling

---

**Happy coding! 🎬✨**

For questions or issues, check the troubleshooting section above or review the component documentation in the source files. 