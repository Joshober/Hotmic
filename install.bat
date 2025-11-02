@echo off
title Installing Real-Time Fallacy Detection App
echo ================================================
echo  Installation
echo ================================================
echo.

cd /d "%~dp0"

REM Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install from https://python.org
    pause
    exit /b 1
)
python --version
echo.

REM Check Node.js
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo.

REM Install Python dependencies
echo [3/4] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo.

REM Install Frontend dependencies
echo [4/4] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env >nul
    echo.
)

echo ================================================
echo  Installation Complete!
echo ================================================
echo.
echo Next: Run 'run.bat' to start the application
echo.
pause

