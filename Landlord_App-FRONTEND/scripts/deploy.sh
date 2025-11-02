#!/bin/bash

# Frontend Deployment Script for Vercel

echo "🚀 Starting frontend deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the frontend root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test -- --run

# Build for production
echo "🏗️ Building for production..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️ Vercel CLI not found. Install with: npm i -g vercel"
    echo "📋 Manual deployment steps:"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Login: vercel login"
    echo "3. Deploy: vercel --prod"
fi

echo "✅ Deployment script completed!"