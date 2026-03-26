#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "⚡ Fastlane — building & starting unified server..."

# Install deps if needed
cd "$SCRIPT_DIR/backend"
[ ! -d "node_modules" ] && { echo "📦 Installing backend deps..."; npm install; }

cd "$SCRIPT_DIR/frontend"
[ ! -d "node_modules" ] && { echo "📦 Installing frontend deps..."; npm install; }

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Start unified server (backend serves frontend dist)
cd "$SCRIPT_DIR/backend"
echo ""
echo "🚀 Starting Fastlane on http://localhost:3001"
echo "   Login: demo@fastlane.ai / demo1234"
echo ""
node server.js
