#!/usr/bin/env pwsh

# Complete Setup Script for CI/CD Failure Prediction System (PowerShell)
Write-Host "🚀 Setting up CI/CD Failure Prediction System..." -ForegroundColor Blue
Write-Host "=============================================="

# Get the project root directory
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $PROJECT_ROOT

# Functions for colored output
function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

# Check Python
try {
    $pythonVersion = & python --version 2>&1
    if ($pythonVersion -match "Python 3") {
        Write-Success "Python found: $pythonVersion"
        $PYTHON_CMD = "python"
    } else {
        Write-Error "Python 3 is required but Python 2 found."
        exit 1
    }
} catch {
    Write-Error "Python 3 is required but not found."
    Write-Info "Please install Python 3.8 or higher from https://python.org"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = & node --version 2>&1
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error "Node.js is required but not found."
    Write-Info "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check npm
try {
    $npmVersion = & npm --version 2>&1
    Write-Success "npm found: v$npmVersion"
} catch {
    Write-Error "npm is required but not found."
    exit 1
}

# Check for model files
Write-Host ""
Write-Host "🔍 Checking for ML model files..." -ForegroundColor Blue

if (Test-Path "xgb_cicd_model.pkl") {
    Write-Success "XGBoost model found: xgb_cicd_model.pkl"
} else {
    Write-Warning "XGBoost model not found: xgb_cicd_model.pkl"
    Write-Info "Please ensure the model file is in the project root directory"
}

if (Test-Path "tfidf_vectorizer.pkl") {
    Write-Success "TF-IDF vectorizer found: tfidf_vectorizer.pkl"
} else {
    Write-Warning "TF-IDF vectorizer not found: tfidf_vectorizer.pkl"
    Write-Info "Please ensure the vectorizer file is in the project root directory"
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Blue
Write-Host "========================"

# Setup Backend
Set-Location "$PROJECT_ROOT\cicd_failure_prediction\backend"

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    & $PYTHON_CMD -m venv venv
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Virtual environment created"
    } else {
        Write-Error "Failed to create virtual environment"
        exit 1
    }
} else {
    Write-Success "Virtual environment already exists"
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip and install dependencies
Write-Host "Installing Python dependencies..."
& $PYTHON_CMD -m pip install --upgrade pip
& pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend dependencies installed"
} else {
    Write-Error "Failed to install backend dependencies"
    exit 1
}

# Create necessary directories
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    $envContent = @"
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
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success ".env file created"
} else {
    Write-Success ".env file already exists"
}

Write-Host ""
Write-Host "🌐 Setting up Frontend..." -ForegroundColor Blue
Write-Host "========================="

# Setup Frontend
Set-Location "$PROJECT_ROOT\cicd_failure_prediction\frontend"

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..."
& npm install

if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend dependencies installed"
} else {
    Write-Error "Failed to install frontend dependencies"
    exit 1
}

# Return to project root
Set-Location $PROJECT_ROOT

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "================================"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update backend\.env with your email settings (optional)"
Write-Host "2. Ensure ML model files are in the project root:"
Write-Host "   - xgb_cicd_model.pkl"
Write-Host "   - tfidf_vectorizer.pkl"
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Green
Write-Host ""
Write-Host "Backend (Terminal 1):" -ForegroundColor Cyan
Write-Host "  cd cicd_failure_prediction\backend"
Write-Host "  .\venv\Scripts\Activate.ps1"
Write-Host "  python app.py"
Write-Host ""
Write-Host "Frontend (Terminal 2):" -ForegroundColor Cyan
Write-Host "  cd cicd_failure_prediction\frontend"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend API: http://localhost:5000"
Write-Host ""
Write-Success "Happy predicting! 🎯"

Read-Host "Press Enter to continue..."