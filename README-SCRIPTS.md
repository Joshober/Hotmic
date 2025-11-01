# Startup Scripts

## Quick Start

### Option 1: PowerShell Scripts (Recommended)
Open two separate PowerShell terminals and run:

**Terminal 1 - Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\start-frontend.ps1
```

### Option 2: Batch Files (Windows)
Double-click or run in separate Command Prompt windows:

- `start-backend.bat` - Starts Flask backend on port 8000
- `start-frontend.bat` - Starts React frontend on port 8001

## What Each Script Does

### Backend Script (`start-backend.ps1` / `start-backend.bat`)
- Changes to the project directory
- Starts the Flask server with Flask-SocketIO
- Runs on `http://localhost:8000`

### Frontend Script (`start-frontend.ps1` / `start-frontend.bat`)
- Changes to the frontend directory
- Starts the React development server
- Runs on `http://localhost:8001`
- Automatically connects to backend at `http://localhost:8000`

## URLs
- **Frontend**: http://localhost:8001
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Ollama**: http://localhost:11434 (must be running separately)

## Requirements
- Backend: Python with Flask dependencies installed
- Frontend: Node.js with npm packages installed
- Ollama: Must be installed and running with llama3.2 model

