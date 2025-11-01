@echo off
echo Starting Backend and Frontend Servers...
echo ==========================================
echo.

REM Start Backend in new window
start "Flask Backend - Port 8000" cmd /k "cd /d c:\Users\IT Lab VR\Downloads\michackathondemo && python main.py"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
start "React Frontend - Port 8001" cmd /k "cd /d c:\Users\IT Lab VR\Downloads\michackathondemo\frontend && npm run dev"

echo.
echo Both servers are starting in separate windows!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:8001
echo.
echo Close the windows or press Ctrl+C in each window to stop the servers.
echo.
pause

