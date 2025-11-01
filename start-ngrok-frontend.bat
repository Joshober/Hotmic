@echo off
title Ngrok Tunnel - Frontend Forwarding
echo Starting Ngrok Tunnel for Frontend...
echo =======================================
echo.
echo Forwarding: https://warner-unthrashed-nonvascularly.ngrok-free.dev -> http://localhost:8001
echo.
echo Press Ctrl+C to stop the tunnel
echo.
echo Note: This uses a free ngrok domain that changes each time.
echo       You can also run: ngrok http 8001
echo.

cd /d "c:\Users\IT Lab VR\Downloads\michackathondemo"
ngrok http 8001

