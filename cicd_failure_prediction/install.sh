#!/bin/bash

# Complete Setup Script for CI/CD Failure Prediction System
echo "🚀 Setting up CI/CD Failure Prediction System..."
echo "=============================================="

# Get the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version 2>&1)
    print_success "Python found: $python_version"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    python_version=$(python --version 2>&1)
    if [[ $python_version == *"Python 3"* ]]; then
        print_success "Python found: $python_version"
        PYTHON_CMD="python"
    else
        print_error "Python 3 is required but Python 2 found."
        exit 1
    fi
else
    print_error "Python 3 is required but not found."
    print_info "Please install Python 3.8 or higher from https://python.org"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    print_success "Node.js found: $node_version"
else
    print_error "Node.js is required but not found."
    print_info "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    print_success "npm found: v$npm_version"
else
    print_error "npm is required but not found."
    exit 1
fi

# Check for model files
echo ""
echo "🔍 Checking for ML model files..."
if [ -f "xgb_cicd_model.pkl" ]; then
    print_success "XGBoost model found: xgb_cicd_model.pkl"
else
    print_warning "XGBoost model not found: xgb_cicd_model.pkl"
    print_info "Please ensure the model file is in the project root directory"
fi

if [ -f "tfidf_vectorizer.pkl" ]; then
    print_success "TF-IDF vectorizer found: tfidf_vectorizer.pkl"
else
    print_warning "TF-IDF vectorizer not found: tfidf_vectorizer.pkl"
    print_info "Please ensure the vectorizer file is in the project root directory"
fi

echo ""
echo "📦 Setting up Backend..."
echo "========================"

# Setup Backend
cd "$PROJECT_ROOT/cicd_failure_prediction/backend"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -eq 0 ]; then
        print_success "Virtual environment created"
    else
        print_error "Failed to create virtual environment"
        exit 1
    fi
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Upgrade pip and install dependencies
echo "Installing Python dependencies..."
$PYTHON_CMD -m pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create necessary directories
mkdir -p uploads logs

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOL
# SMTP Configuration (optional - for email notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password

# Notification Settings
NOTIFICATION_THRESHOLD=0.7

# Flask Settings
FLASK_ENV=development
FLASK_DEBUG=True
EOL
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

echo ""
echo "🌐 Setting up Frontend..."
echo "========================="

# Setup Frontend
cd "$PROJECT_ROOT/cicd_failure_prediction/frontend"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Return to project root
cd "$PROJECT_ROOT"

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your email settings (optional)"
echo "2. Ensure ML model files are in the project root:"
echo "   - xgb_cicd_model.pkl"
echo "   - tfidf_vectorizer.pkl"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd cicd_failure_prediction/backend"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
echo "  venv\\Scripts\\activate"
else
echo "  source venv/bin/activate"
fi
echo "  python app.py"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd cicd_failure_prediction/frontend"
echo "  npm run dev"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo ""
print_success "Happy predicting! 🎯"