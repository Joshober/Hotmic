# Start both Backend and Frontend in separate terminal windows
Write-Host "Starting Backend and Frontend Servers..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Start Backend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\IT Lab VR\Downloads\michackathondemo'; Write-Host 'Flask Backend - Port 8000' -ForegroundColor Cyan; Write-Host '============================' -ForegroundColor Cyan; python main.py"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\IT Lab VR\Downloads\michackathondemo\frontend'; Write-Host 'React Frontend - Port 8001' -ForegroundColor Cyan; Write-Host '============================' -ForegroundColor Cyan; npm run dev"

Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the windows or press Ctrl+C in each window to stop the servers." -ForegroundColor Yellow
Write-Host ""

