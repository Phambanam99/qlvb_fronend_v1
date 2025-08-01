#!/bin/bash
# Fast build script for QLVB frontend

echo "=== QLVB Fast Frontend Build ==="

# Check if .dockerignore exists
if [ ! -f ".dockerignore" ]; then
echo "Creating .dockerignore for faster builds..."
cat > .dockerignore << 'EOF'
    node_modules
    .next
    .git
    .gitignore
    README.md
    .dockerignore
    Dockerfile
    .vscode
    .idea
    *.log
    .env*.local
    coverage
    .nyc_output
    EOF
    fi

    # Build arguments from .env
    if [ -f "../.env" ]; then
    echo "Loading configuration from .env..."
    export $(grep -v '^#' ../.env | grep -v '^$' | xargs)
    fi

    # Use build arguments with fallbacks
    API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:8080/api"}
    BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-"http://localhost:8080"}

    echo "Building with:"
    echo "  API URL: $API_URL"
    echo "  Backend URL: $BACKEND_URL"

    # Clean previous builds
    echo "Cleaning previous builds..."
    rm -rf .next
    rm -rf node_modules/.cache

    # Build with optimizations
    echo "Building frontend (optimized for speed)..."
    time docker build \
    --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
    --build-arg NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL" \
    --target runner \
    --progress=plain \
    -t qlvb-frontend:latest .

    if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    else
    echo "❌ Frontend build failed!"
    exit 1
    fi