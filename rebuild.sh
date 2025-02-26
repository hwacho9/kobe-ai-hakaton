#!/bin/bash

echo "Stopping existing containers..."
docker-compose down

echo "Rebuilding containers..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

echo "Application has been rebuilt and restarted."
echo "Backend API will be available at: http://localhost:8000"
echo "Frontend UI will be available at: http://localhost:3000"
echo ""
echo "To view logs, run: docker-compose logs -f" 