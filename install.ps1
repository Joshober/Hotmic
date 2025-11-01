# Real-Time Fallacy Detection - Installation Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Real-Time Fallacy Detection - Installation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check Node.js
Write-Host "[2/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install Python dependencies
Write-Host "[3/5] Installing Python dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# Install Frontend dependencies
Write-Host "[4/5] Installing Frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# Check Ollama and install model
Write-Host "[5/5] Checking Ollama and model..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "  Ollama installed" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Ollama is not installed" -ForegroundColor Yellow
    Write-Host "Installing Ollama via winget..." -ForegroundColor Yellow
    winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Ollama" -ForegroundColor Red
        Write-Host "Please install manually from https://ollama.ai" -ForegroundColor Red
        exit 1
    }
    Write-Host "Waiting for Ollama to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Check if model exists
Write-Host "Checking for llama3.2 model..." -ForegroundColor Yellow
$modelExists = ollama list 2>&1 | Select-String "llama3.2"
if (-not $modelExists) {
    Write-Host "Model not found. Downloading llama3.2..." -ForegroundColor Yellow
    Write-Host "File size: ~2.0 GB (this may take several minutes)" -ForegroundColor Yellow
    Write-Host ""
    ollama pull llama3.2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Failed to download model" -ForegroundColor Yellow
        Write-Host "You can download it later with: ollama pull llama3.2" -ForegroundColor Yellow
    } else {
        Write-Host "  OK - Model downloaded" -ForegroundColor Green
    }
} else {
    Write-Host "  OK - Model already installed" -ForegroundColor Green
}
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "  OK - Created .env file" -ForegroundColor Green
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure .env file if needed" -ForegroundColor White
Write-Host "  2. Run: .\run.ps1" -ForegroundColor White
Write-Host ""

