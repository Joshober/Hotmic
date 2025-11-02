@echo off
echo Stopping Nginx Reverse Proxy...
cd /d "%~dp0"
nginx -p %~dp0 -c nginx-proxy.conf -s stop
echo Nginx stopped.

