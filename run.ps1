# Real-Time Fallacy Detection - Run All Services
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
}

Write-Host "Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Flask Backend (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '=== Flask Backend ===' -ForegroundColor Cyan; Write-Host 'Port: 8000' -ForegroundColor Yellow; Write-Host ''; python main.py"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting React Frontend (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== React Frontend ===' -ForegroundColor Cyan; Write-Host 'Port: 8001' -ForegroundColor Yellow; Write-Host 'Connecting to: http://localhost:8000' -ForegroundColor Yellow; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Two windows have opened:" -ForegroundColor Cyan
Write-Host "  1. Flask Backend - http://localhost:8000" -ForegroundColor Yellow
Write-Host "  2. React Frontend - http://localhost:8001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open http://localhost:8001 in your browser to use the app." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the services." -ForegroundColor Yellow
Write-Host ""

