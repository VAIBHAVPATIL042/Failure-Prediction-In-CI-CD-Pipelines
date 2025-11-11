@echo off
REM Quick Start Script for CI/CD Failure Prediction System (Windows)
echo 🚀 Starting CI/CD Failure Prediction System...

set PROJECT_ROOT=%~dp0

REM Function to check if port is in use (simplified)
netstat -an | find ":5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend is already running on port 5000
) else (
    echo 🔄 Starting backend...
    cd /d "%PROJECT_ROOT%cicd_failure_prediction\backend"
    start "Backend" cmd /k "venv\Scripts\activate.bat && python app.py"
    echo ✅ Backend started
    timeout /t 3 >nul
)

netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is already running on port 3000
) else (
    echo 🔄 Starting frontend...
    cd /d "%PROJECT_ROOT%cicd_failure_prediction\frontend"
    start "Frontend" cmd /k "npm run dev"
    echo ✅ Frontend started
)

echo.
echo 🌐 Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul