# Frontend Server Startup Script
Write-Host "Starting React Frontend Server..." -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will run on: http://localhost:8001" -ForegroundColor Cyan
Write-Host "Backend connection: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

cd "c:\Users\IT Lab VR\Downloads\michackathondemo\frontend"
npm run dev

