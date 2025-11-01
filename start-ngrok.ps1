# Start Ngrok Tunnel for Backend
Write-Host "Starting Ngrok Tunnel..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "Forwarding: https://speak.ngrok.app -> http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

cd "c:\Users\IT Lab VR\Downloads\michackathondemo"
ngrok start --config ngrok.yml backend_endpoint

