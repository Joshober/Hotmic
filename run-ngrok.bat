@echo off
title Real-Time Fallacy Detection - Run with Ngrok
echo ================================================
echo  Starting All Services with Ngrok
echo ================================================
echo.

cd /d "%~dp0"

REM Check if ngrok.yml exists
if not exist ngrok.yml (
    echo WARNING: ngrok.yml not found
    echo Creating from template...
    copy ngrok.yml.example ngrok.yml >nul
    echo.
    echo IMPORTANT: Edit ngrok.yml and add your auth token!
    echo.
    pause
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env >nul
)

echo Starting services in separate windows...
echo.

REM Start Ngrok Backend Tunnel
echo [1/4] Starting Ngrok Backend Tunnel...
start "Ngrok Backend Tunnel" cmd /k "cd /d %~dp0 && echo === Ngrok Backend Tunnel === && echo https://speak.ngrok.app -^> http://localhost:8000 && echo. && ngrok start --config ngrok.yml backend_endpoint"
timeout /t 3 /nobreak >nul

REM Start Backend
echo [2/4] Starting Flask Backend (Port 8000)...
start "Flask Backend - Port 8000" cmd /k "cd /d %~dp0 && echo === Flask Backend === && echo Port: 8000 && echo. && python main.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [3/4] Starting React Frontend (Port 8001)...
start "React Frontend - Port 8001" cmd /k "cd /d %~dp0frontend && echo === React Frontend === && echo Port: 8001 && echo Auto-detects ngrok or localhost && echo. && npm run dev"
timeout /t 2 /nobreak >nul

echo [4/4] All services started!
echo.
echo Three windows have opened:
echo   1. Ngrok Backend Tunnel - https://speak.ngrok.app
echo   2. Flask Backend - http://localhost:8000
echo   3. React Frontend - http://localhost:8001
echo.
echo Frontend will auto-connect via ngrok when accessed through ngrok URL.
echo.
echo Press Ctrl+C in each window to stop the services.
echo.
pause

