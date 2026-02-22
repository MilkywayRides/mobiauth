#!/bin/bash

# Production deployment script

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🏗️  Building application..."
npm run build

# Restart application
echo "♻️  Restarting application..."
pm2 restart auth-system || pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs auth-system"
