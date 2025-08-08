#!/bin/bash

echo "🚀 Starting Log Management Dashboard Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL with TimescaleDB
echo "🐘 Starting PostgreSQL with TimescaleDB..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres -d log_management; do
    echo "Database is not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Start the backend application
echo "🔧 Starting backend application..."
cd backend
npm run dev 