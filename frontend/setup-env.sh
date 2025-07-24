#!/bin/bash

# Frontend Environment Setup Script

echo "🎬 Setting up Movie Suggester Frontend Environment"
echo "=================================================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Your existing .env file was preserved."
        exit 1
    fi
fi

# Copy template to .env
cp env.template .env

echo "✅ Created .env file from template"
echo ""
echo "📝 Environment Variables:"
echo "   VITE_API_URL=http://localhost:8000  # Your backend API URL"
echo "   VITE_USE_PROXY=false                # Use Vite proxy for development"
echo "   VITE_DEBUG_MODE=true               # Enable debug logging"
echo ""
echo "🔧 Next steps:"
echo "   1. Edit .env file to match your backend URL"
echo "   2. Run 'bun run dev' to start development"
echo "   3. For production, update VITE_API_URL to your backend URL"
echo ""
echo "🎉 Environment setup complete!" 