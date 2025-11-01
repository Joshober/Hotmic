@echo off
title Real-Time Fallacy Detection - Running All Services
echo ================================================
echo  Starting All Services
echo ================================================
echo.

cd /d "%~dp0"

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found
    echo Creating from template...
    copy env.example .env >nul
)

echo Starting services in separate windows...
echo.

REM Start Backend
echo [1/3] Starting Flask Backend (Port 8000)...
start "Flask Backend - Port 8000" cmd /k "cd /d %~dp0 && echo === Flask Backend === && echo Port: 8000 && echo. && python main.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/3] Starting React Frontend (Port 8001)...
start "React Frontend - Port 8001" cmd /k "cd /d %~dp0frontend && echo === React Frontend === && echo Port: 8001 && echo Connecting to: http://localhost:8000 && echo. && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] All services started!
echo.
echo Two windows have opened:
echo   1. Flask Backend - http://localhost:8000
echo   2. React Frontend - http://localhost:8001
echo.
echo Open http://localhost:8001 in your browser to use the app.
echo.
echo Press Ctrl+C in each window to stop the services.
echo.
pause

