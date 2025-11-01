# Ngrok Setup Guide

## Configuration

The backend is now configured to be accessible via ngrok at:
- **Ngrok URL**: `https://speak.ngrok.app`
- **Local Backend**: `http://localhost:8000`

## Files Created

1. **`ngrok.yml`** - Ngrok configuration file with your static domain
2. **`start-ngrok.bat`** - Script to start ngrok tunnel
3. **`start-ngrok.ps1`** - PowerShell script to start ngrok tunnel
4. **`start-all-with-ngrok.bat`** - Start all services (backend, frontend, ngrok)

## Frontend Configuration

The frontend is configured to use the ngrok URL via environment variable:
- **Environment Variable**: `REACT_APP_WS_URL=https://speak.ngrok.app`
- **Fallback**: `http://localhost:8000` (if env var not set)

### To use ngrok URL:

Create or update `frontend/.env` file:
```
REACT_APP_WS_URL=https://speak.ngrok.app
```

Then restart the frontend server.

## Quick Start

### Option 1: Start Everything (Recommended)
```batch
start-all-with-ngrok.bat
```

This starts:
- Ngrok tunnel (port forwarding)
- Flask backend (port 8000)
- React frontend (port 8001)

### Option 2: Start Ngrok Separately
```batch
start-ngrok.bat
```

Or PowerShell:
```powershell
.\start-ngrok.ps1
```

## CORS Configuration

The Flask backend has been updated to allow CORS from:
- `https://speak.ngrok.app`
- `http://localhost:8001`
- `http://localhost:3000`
- `http://localhost:5173`

## Testing

1. Start ngrok tunnel
2. Start backend server
3. Start frontend server
4. Frontend will connect to: `https://speak.ngrok.app`

## Troubleshooting

- If ngrok fails, check that the auth token is correct in `ngrok.yml`
- Verify ngrok is installed: `ngrok version`
- Check that port 8000 is running: `netstat -ano | findstr :8000`
- Frontend must be restarted after changing `.env` file

