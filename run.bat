@echo off
title Real-Time Fallacy Detection - Starting Services
echo ================================================
echo  Starting Services
echo ================================================
echo.

cd /d "%~dp0"

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found
    echo Creating from template...
    copy env.example .env >nul
)

REM Check if ngrok.yml exists
if not exist ngrok.yml (
    echo ERROR: ngrok.yml not found
    echo Please copy ngrok.yml.example to ngrok.yml and configure it
    echo.
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Start Ngrok Backend Tunnel
echo [1/3] Starting Ngrok Backend Tunnel...
echo Reading ngrok endpoint from ngrok.yml...
start "Ngrok Backend" cmd /k "cd /d %~dp0 && echo === Ngrok Backend Tunnel === && echo Tunnel -^> http://localhost:8000 && echo. && ngrok start --config ngrok.yml app_endpoint"
timeout /t 3 /nobreak >nul

REM Start Backend
echo [2/3] Starting Flask Backend (Port 8000)...
start "Flask Backend" cmd /k "cd /d %~dp0 && echo === Flask Backend === && echo Port: 8000 && echo. && python main.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [3/3] Starting React Frontend (Port 8001)...
start "React Frontend" cmd /k "cd /d %~dp0frontend && echo === React Frontend === && echo Port: 8001 && echo. && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo Services started!
echo.
echo Backend:  Check ngrok tunnel URL (via ngrok)
echo Frontend: http://localhost:8001
echo.
echo Press Ctrl+C in each window to stop.
pause

