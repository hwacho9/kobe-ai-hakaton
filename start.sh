#!/bin/bash

# Build and start the containers
docker-compose up -d

# Display logs
echo "Starting Fan Event Prediction App..."
echo "Backend API will be available at: http://localhost:8000"
echo "Frontend UI will be available at: http://localhost:3000"
echo ""
echo "To view logs, run: docker-compose logs -f"
echo "To stop the application, run: docker-compose down" 