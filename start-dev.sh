#!/bin/bash

echo "🚀 Starting Log Management Dashboard Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL and Redis
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres -d log_management; do
    echo "Database is not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Start the backend application
echo "🔧 Starting backend application..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# Start the frontend application in a new terminal
echo "🎨 Starting frontend application..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for both processes to exit
wait $BACKEND_PID $FRONTEND_PID
