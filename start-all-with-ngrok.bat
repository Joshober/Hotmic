@echo off
echo Starting Backend, Frontend, and Ngrok...
echo ========================================
echo.

REM Start Ngrok in new window
start "Ngrok Tunnel - Backend Forwarding" cmd /k "cd /d c:\Users\IT Lab VR\Downloads\michackathondemo && ngrok start --config ngrok.yml backend_endpoint"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Backend in new window
start "Flask Backend - Port 8000" cmd /k "cd /d c:\Users\IT Lab VR\Downloads\michackathondemo && python main.py"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
start "React Frontend - Port 8001" cmd /k "cd /d c:\Users\IT Lab VR\Downloads\michackathondemo\frontend && npm run dev"

echo.
echo All servers are starting in separate windows!
echo.
echo Ngrok:  https://speak.ngrok.app -> http://localhost:8000
echo Backend: http://localhost:8000
echo Frontend: http://localhost:8001
echo.
echo Frontend is configured to use: https://speak.ngrok.app
echo.
echo Close the windows or press Ctrl+C in each window to stop.
echo.
pause

