@echo off
REM Backend Setup Script for CI/CD Failure Prediction System (Windows)
echo 🚀 Setting up CI/CD Failure Prediction Backend...

REM Check Python version
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher and try again.
    pause
    exit /b 1
)

python --version 2>&1 | findstr "Python 3" >nul
if %errorlevel% neq 0 (
    echo ❌ Python 3 is required
    echo Please install Python 3.8 or higher and try again.
    pause
    exit /b 1
)

echo ✅ Python 3 found

REM Navigate to backend directory
cd /d "%~dp0"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created successfully
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated

REM Upgrade pip
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Check if model files exist
echo 🔍 Checking for ML model files...
if exist "..\xgb_cicd_model.pkl" (
    echo ✅ XGBoost model found: ..\xgb_cicd_model.pkl
) else (
    echo ⚠️  XGBoost model not found at ..\xgb_cicd_model.pkl
    echo    Please ensure the model file is in the root directory
)

if exist "..\tfidf_vectorizer.pkl" (
    echo ✅ TF-IDF vectorizer found: ..\tfidf_vectorizer.pkl
) else (
    echo ⚠️  TF-IDF vectorizer not found at ..\tfidf_vectorizer.pkl
    echo    Please ensure the vectorizer file is in the root directory
)

REM Create necessary directories
echo 📁 Creating necessary directories...
mkdir uploads 2>nul
mkdir logs 2>nul

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # SMTP Configuration ^(optional - for email notifications^)
        echo SMTP_SERVER=smtp.gmail.com
        echo SMTP_PORT=587
        echo SENDER_EMAIL=your-email@gmail.com
        echo SENDER_PASSWORD=your-app-password
        echo.
        echo # Notification Settings
        echo NOTIFICATION_THRESHOLD=0.7
        echo.
        echo # Flask Settings
        echo FLASK_ENV=development
        echo FLASK_DEBUG=True
    ) > .env
    echo ✅ .env file created. Please update with your settings.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Backend setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env file with your email settings ^(optional^)
echo 2. Ensure model files are in the correct location
echo 3. Run the server with: python app.py
echo.
echo 🌐 The backend will be available at: http://localhost:5000
echo.
pause