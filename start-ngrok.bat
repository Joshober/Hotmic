@echo off
title Ngrok Tunnel - Backend Forwarding
echo Starting Ngrok Tunnel...
echo ==========================
echo.
echo Forwarding: https://speak.ngrok.app -> http://localhost:8000
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cd /d "c:\Users\IT Lab VR\Downloads\michackathondemo"
ngrok start --config ngrok.yml backend_endpoint

