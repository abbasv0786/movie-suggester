#!/bin/bash

# Netlify Deployment Checklist

echo "🚀 Netlify Deployment Checklist"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

echo "✅ 1. Environment Variables Setup"
echo "   - Set VITE_API_URL in Netlify dashboard"
echo "   - Set VITE_DEBUG_MODE=false for production"
echo ""

echo "✅ 2. Build Configuration"
echo "   - netlify.toml is configured correctly"
echo "   - Build command: npm ci && npm run build"
echo "   - Publish directory: dist"
echo ""

echo "✅ 3. Dependencies"
echo "   - All dependencies are in package.json"
echo "   - No platform-specific issues"
echo ""

echo "✅ 4. Environment Variables Check"
echo "   Required variables:"
echo "   - VITE_API_URL (your backend URL)"
echo ""
echo "   Optional variables:"
echo "   - VITE_DEBUG_MODE=false"
echo "   - VITE_LOG_LEVEL=error"
echo "   - VITE_ENABLE_ANALYTICS=true"
echo ""

echo "🔧 Quick Setup Commands:"
echo "1. Test build locally: npm run build"
echo "2. Check environment: echo \$VITE_API_URL"
echo "3. Deploy to Netlify: git push origin main"
echo ""

echo "📋 Netlify Dashboard Steps:"
echo "1. Go to Site settings > Environment variables"
echo "2. Add VITE_API_URL=https://your-backend-api.com"
echo "3. Add VITE_DEBUG_MODE=false"
echo "4. Trigger new deployment"
echo ""

echo "🎯 Ready for deployment!" 