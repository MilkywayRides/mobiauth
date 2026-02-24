#!/bin/bash

echo "🚀 Starting MobiAuth Demo App Setup"
echo ""

# Check if main auth server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Main auth server is not running on port 3000"
    echo "Please start it first with: npm run dev"
    exit 1
fi

echo "✅ Main auth server is running"
echo ""

cd demoapp

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎯 Starting demo app on port 3001..."
npm run dev

