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
  "compose")
    echo "🐳 Starting with Docker Compose..."
    docker compose up --build
    ;;
  "compose-dev")
    echo "🔧 Starting development with Docker Compose..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ;;
  "stop")
    echo "🛑 Stopping containers..."
    docker compose down
    docker stop surewin-app 2>/dev/null || true
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker compose down --rmi all --volumes --remove-orphans
    docker rmi surewin:latest 2>/dev/null || true
    echo "✅ Cleanup complete!"
    ;;
  *)
    echo "🐳 SureWin Docker Helper"
    echo ""
    echo "Usage: $0 {build|run|compose|compose-dev|stop|clean}"
    echo ""
    echo "Commands:"
    echo "  build      - Build the Docker image"
    echo "  run        - Run the container (after building)"
    echo "  compose    - Start with Docker Compose"
    echo "  compose-dev- Start in development mode"
    echo "  stop       - Stop running containers"
    echo "  clean      - Remove all containers and images"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 run"
    echo "  $0 compose"
    exit 1
    ;;
esac 