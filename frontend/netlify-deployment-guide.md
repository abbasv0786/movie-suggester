# Netlify Deployment Guide

## 🚀 Environment Variables Setup

### Option 1: Netlify Dashboard (Recommended)

1. **Go to your Netlify site dashboard**
2. **Navigate to Site settings > Environment variables**
3. **Add these variables:**

```bash
# Required
VITE_API_URL=https://your-backend-api.com

# Optional (for production)
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### Option 2: Using .env.production file

1. **Create `.env.production` file:**
```bash
cp env.production.example .env.production
```

2. **Edit the file with your production values:**
```bash
VITE_API_URL=https://your-backend-api.com
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

3. **Add to your repository** (only if values are not sensitive)

## 🔧 Netlify Configuration

### Current netlify.toml
```toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm ci && npm run build"
```

### Environment Variables in netlify.toml (Alternative)
```toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm ci && npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  VITE_API_URL = "https://your-backend-api.com"
  VITE_DEBUG_MODE = "false"
```

## 🎯 Best Practices

### ✅ Recommended (Netlify Dashboard)
- Set environment variables in Netlify dashboard
- Keep sensitive data out of repository
- Easy to change without code deployment

### ⚠️ Alternative (.env.production)
- Only use for non-sensitive configuration
- Remember to add to .gitignore if sensitive
- Less flexible for environment changes

## 🔍 Testing Your Setup

### Local Testing
```bash
# Test production build locally
npm run build

# Check environment variables
echo $VITE_API_URL
```

### Netlify Testing
1. Deploy to Netlify
2. Check build logs for environment variable usage
3. Test API calls in browser console

## 🚨 Common Issues

### Issue: Environment variables not loading
**Solution**: Ensure variables start with `VITE_` prefix

### Issue: API calls failing in production
**Solution**: Check `VITE_API_URL` is set correctly

### Issue: Build failing
**Solution**: Verify all required variables are set 