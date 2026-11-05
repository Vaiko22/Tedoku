#!/bin/bash

# Deploy Admin App to Vercel
# Usage: ./deploy.sh [--prod]

set -e

echo "🚀 Deploying Tedoku Admin to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the app
echo "📦 Building admin app..."
npm run build

# Deploy
if [ "$1" == "--prod" ]; then
    echo "🌐 Deploying to production..."
    vercel --prod
else
    echo "🔧 Deploying to preview..."
    vercel
fi

echo "✅ Deployment complete!"
