@echo off
title Installing Real-Time Fallacy Detection App
echo ================================================
echo  Real-Time Fallacy Detection - Installation
echo ================================================
echo.

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
python --version
echo   OK
echo.

REM Check Node.js
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo   OK
echo.

REM Install Python dependencies
echo [3/5] Installing Python dependencies...
cd /d "%~dp0"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo   OK
echo.

REM Install Frontend dependencies
echo [4/5] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo   OK
echo.

REM Check Ollama and install model
echo [5/5] Checking Ollama and model...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama is not installed or not in PATH
    echo.
    echo Installing Ollama via winget...
    winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Ollama
        echo Please install manually from https://ollama.ai
        pause
        exit /b 1
    )
    echo Waiting for Ollama to be ready...
    timeout /t 5 /nobreak >nul
)

REM Refresh PATH for Ollama
set PATH=%PATH%;%LOCALAPPDATA%\Programs\Ollama

REM Check if model exists
echo Checking for llama3.2 model...
ollama list | findstr /C:"llama3.2" >nul 2>&1
if %errorlevel% neq 0 (
    echo Model not found. Downloading llama3.2 (this may take several minutes)...
    echo File size: ~2.0 GB
    echo.
    ollama pull llama3.2
    if %errorlevel% neq 0 (
        echo WARNING: Failed to download model
        echo You can download it later with: ollama pull llama3.2
    ) else (
        echo   OK - Model downloaded
    )
) else (
    echo   OK - Model already installed
)
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env >nul
    echo   OK - Created .env file
    echo.
)

echo ================================================
echo  Installation Complete!
echo ================================================
echo.
echo Next steps:
echo   1. Configure .env file if needed
echo   2. Run: run.bat
echo.
pause

