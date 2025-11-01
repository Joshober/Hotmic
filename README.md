# Real-Time Fallacy Detection Website

A full-stack web application that converts audio to text in real-time and detects logical fallacies and factual errors using AI.

## Features

- Real-time speech-to-text conversion using Web Speech API
- AI-powered fallacy detection (logical fallacies + factual accuracy)
- Live visual alerts and feedback
- Color-coded text highlighting
- Real-time statistics dashboard

## Tech Stack

- **Backend**: Python with Flask, Flask-SocketIO
- **Frontend**: React with TypeScript, Socket.IO client
- **AI**: Local LLM via Ollama or OpenAI-compatible API for fallacy detection
- **Speech-to-Text**: Web Speech API (browser)
- **Tunneling**: Ngrok for public access (optional)

## Setup

### Backend

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Ollama (for local models):
   - Download from https://ollama.ai
   - Run: `ollama pull llama3.2` (or your preferred model)

3. Create `.env` file from `env.example`:
```bash
cp env.example .env
```

4. Configure your local model in `.env`:
```
LOCAL_API_BASE=http://localhost:11434
LOCAL_MODEL_NAME=llama3.2
USE_OLLAMA=true
```

4. Run the backend server:
```bash
python main.py
```

The API will run on `http://localhost:8000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file for custom backend URL:
```bash
REACT_APP_WS_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm start
# or
npm run dev
```

The app will run on `http://localhost:8001` (configured in package.json)

## Usage

1. Start both backend and frontend servers
2. Open the website in your browser
3. Click "Start Recording" to begin speech-to-text
4. Speak into your microphone
5. Watch as fallacies are detected in real-time with visual feedback

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `Socket.IO /socket.io/` - Real-time fallacy detection via Socket.IO

## Quick Start Scripts

Windows users can use the provided batch files:
- `start-all.bat` - Start both backend and frontend in separate windows
- `start-backend.bat` - Start backend only
- `start-frontend.bat` - Start frontend only

See `START.md` for more details.

## Ngrok Setup (Optional)

For public access via ngrok, see `NGROK-SETUP-COMPLETE.md`

## License

MIT
