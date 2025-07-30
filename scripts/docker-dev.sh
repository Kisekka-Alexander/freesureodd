#!/bin/bash

# Docker development script for SureWin

set -e

case "$1" in
  "build")
    echo "🐳 Building Docker image..."
    docker build -t surewin:latest .
    echo "✅ Build complete!"
    ;;
  "run")
    echo "🚀 Running Docker container..."
    docker run -p 3000:3000 \
      -e NEXTAUTH_URL=http://localhost:3000 \
      -e NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production \
      --name surewin-app \
      --rm \
      surewin:latest
    ;;
  "dev")
    echo "🔧 Starting development environment..."
    echo "📁 Source code mounted for hot reload"
    echo "🚀 Access your app at http://localhost:3000"
    echo ""
    
    # Stop any existing containers first
    docker compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    
    # Start development environment
    docker compose -f docker-compose.dev.yml up --build
    ;;
  "stop")
    echo "🛑 Stopping containers..."
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker stop surewin-app 2>/dev/null || true
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    docker rmi surewin:latest 2>/dev/null || true
    echo "✅ Cleanup complete!"
    ;;
  "logs")
    echo "📋 Showing development logs..."
    docker compose -f docker-compose.dev.yml logs -f
    ;;
  *)
    echo "🐳 SureWin Docker Helper"
    echo ""
    echo "Usage: $0 {build|run|dev|stop|clean|logs}"
    echo ""
    echo "Commands:"
    echo "  build      - Build the production Docker image"
    echo "  run        - Run the production container"
    echo "  dev        - Start development with HOT RELOAD ✨"
    echo "  stop       - Stop running containers"
    echo "  clean      - Remove all containers and images"
    echo "  logs       - Show development container logs"
    echo ""
    echo "💡 For development with hot reload:"
    echo "  $0 dev"
    echo ""
    echo "🚀 For production:"
    echo "  $0 build && $0 run"
    exit 1
    ;;
esac 