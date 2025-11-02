# Real-Time Fallacy Detection - Run Services
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Starting Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
}

# Check if ngrok.yml exists
if (-not (Test-Path "ngrok.yml")) {
    Write-Host "ERROR: ngrok.yml not found" -ForegroundColor Red
    Write-Host "Please copy ngrok.yml.example to ngrok.yml and configure it" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start Ngrok Backend Tunnel
Write-Host "[1/3] Starting Ngrok Backend Tunnel..." -ForegroundColor Cyan
Write-Host "Reading ngrok endpoint from ngrok.yml..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '=== Ngrok Backend Tunnel ===' -ForegroundColor Cyan; Write-Host 'Tunnel -> http://localhost:8000' -ForegroundColor Yellow; Write-Host ''; ngrok start --config ngrok.yml app_endpoint"

Start-Sleep -Seconds 3

# Start Backend
Write-Host "[2/3] Starting Flask Backend (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '=== Flask Backend ===' -ForegroundColor Cyan; Write-Host 'Port: 8000' -ForegroundColor Yellow; Write-Host ''; python main.py"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[3/3] Starting React Frontend (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== React Frontend ===' -ForegroundColor Cyan; Write-Host 'Port: 8001' -ForegroundColor Yellow; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  Check ngrok tunnel URL (via ngrok)" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:8001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop." -ForegroundColor Yellow
Write-Host ""

