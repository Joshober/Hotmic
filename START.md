# Quick Start Guide

## One-Click Start (Easiest)

### Double-click or run:
```
start-all.bat
```

This will open **two separate terminal windows**:
- **Window 1**: Flask Backend on port 8000
- **Window 2**: React Frontend on port 8001

Both servers start immediately - no waiting!

---

## Individual Start (If you prefer)

### Backend only:
- Double-click: `start-backend.bat`
- Or run: `.\start-backend.ps1`

### Frontend only:
- Double-click: `start-frontend.bat`
- Or run: `.\start-frontend.ps1`

---

## URLs After Start

- **Frontend**: http://localhost:8001
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

---

## To Stop

Press **Ctrl+C** in each terminal window, or simply close the windows.

---

## Requirements

- Python with Flask dependencies installed
- Node.js with npm packages installed
- Ollama running with llama3.2 model (port 11434)

