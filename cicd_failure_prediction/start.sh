#!/bin/bash

# Quick Start Script for CI/CD Failure Prediction System
echo "🚀 Starting CI/CD Failure Prediction System..."

# Get the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if backend is running
if check_port 5000; then
    echo "✅ Backend is already running on port 5000"
else
    echo "🔄 Starting backend..."
    cd "$PROJECT_ROOT/cicd_failure_prediction/backend"
    
    # Activate virtual environment and start backend
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    python app.py &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
fi

# Check if frontend is running
if check_port 3000; then
    echo "✅ Frontend is already running on port 3000"
else
    echo "🔄 Starting frontend..."
    cd "$PROJECT_ROOT/cicd_failure_prediction/frontend"
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
fi

echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait