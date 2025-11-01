# Ngrok Setup - Complete Configuration

## Current Setup

### Frontend Ngrok Tunnel
- **URL**: `https://warner-unthrashed-nonvascularly.ngrok-free.dev`
- **Forwards to**: `http://localhost:8001`
- **Status**: Running (as you showed)

### Backend Ngrok Tunnel
- **URL**: `https://speak.ngrok.app`
- **Forwards to**: `http://localhost:8000`
- **Config**: `ngrok.yml`
- **Status**: Needs to be running!

## How It Works

1. **Frontend accessed via ngrok** (`https://warner-unthrashed-nonvascularly.ngrok-free.dev`)
2. **Frontend auto-detects** it's on ngrok and connects to backend via ngrok
3. **Frontend connects to** `https://speak.ngrok.app`
4. **Backend receives** the connection and processes requests

## Configuration Updates Made

### Frontend (`useWebSocket.ts`)
- ✅ Auto-detects if accessed via ngrok URL
- ✅ If on ngrok: connects to `https://speak.ngrok.app`
- ✅ If on localhost: connects to `http://localhost:8000`

### Backend (`main.py`)
- ✅ CORS allows: `https://speak.ngrok.app`
- ✅ CORS allows: `https://*.ngrok-free.dev` (your frontend domain)
- ✅ CORS allows: `https://*.ngrok.io`

## Starting Both Tunnels

### Option 1: Use Scripts
```batch
REM Start Backend Tunnel
start-ngrok.bat

REM Start Frontend Tunnel (in another terminal)
ngrok http 8001
```

### Option 2: Manual
```bash
# Terminal 1 - Backend Tunnel
ngrok start --config ngrok.yml backend_endpoint

# Terminal 2 - Frontend Tunnel  
ngrok http 8001
```

## Verification

1. ✅ Backend ngrok tunnel running: `https://speak.ngrok.app`
2. ✅ Frontend ngrok tunnel running: `https://warner-unthrashed-nonvascularly.ngrok-free.dev`
3. ✅ Frontend hook auto-detects ngrok and uses backend ngrok URL
4. ✅ Backend CORS allows both frontend and backend ngrok URLs

## Testing

1. Access frontend via: `https://warner-unthrashed-nonvascularly.ngrok-free.dev`
2. Frontend should auto-connect to backend at: `https://speak.ngrok.app`
3. Check browser console for Socket.IO connection status

