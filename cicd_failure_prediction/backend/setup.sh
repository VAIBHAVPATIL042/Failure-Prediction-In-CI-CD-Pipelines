#!/bin/bash

# Backend Setup Script for CI/CD Failure Prediction System
echo "🚀 Setting up CI/CD Failure Prediction Backend..."

# Check Python version
python_version=$(python --version 2>&1)
if [[ $python_version == *"Python 3"* ]]; then
    echo "✅ Python found: $python_version"
else
    echo "❌ Python 3 is required but not found."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
    if [ $? -eq 0 ]; then
        echo "✅ Virtual environment created successfully"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix/Linux/macOS
    source venv/bin/activate
fi

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment activated"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

# Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if model files exist
echo "🔍 Checking for ML model files..."
if [ -f "../xgb_cicd_model.pkl" ]; then
    echo "✅ XGBoost model found: ../xgb_cicd_model.pkl"
else
    echo "⚠️  XGBoost model not found at ../xgb_cicd_model.pkl"
    echo "   Please ensure the model file is in the root directory"
fi

if [ -f "../tfidf_vectorizer.pkl" ]; then
    echo "✅ TF-IDF vectorizer found: ../tfidf_vectorizer.pkl"
else
    echo "⚠️  TF-IDF vectorizer not found at ../tfidf_vectorizer.pkl"
    echo "   Please ensure the vectorizer file is in the root directory"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads logs

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
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
    echo "✅ .env file created. Please update with your settings."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your email settings (optional)"
echo "2. Ensure model files are in the correct location"
echo "3. Run the server with: python app.py"
echo ""
echo "🌐 The backend will be available at: http://localhost:5000"
echo ""