# Real-Time Fallacy Detection Website

A full-stack web application that converts audio to text in real-time and detects logical fallacies and factual errors using AI.

## Features

- Real-time speech-to-text conversion using Web Speech API
- AI-powered fallacy detection (logical fallacies + factual accuracy)
- Live visual alerts and feedback
- Color-coded text highlighting
- Real-time statistics dashboard

## Tech Stack

- **Backend**: Python with FastAPI, WebSockets
- **Frontend**: React with TypeScript
- **AI**: Local LLM via Ollama or OpenAI-compatible API for fallacy detection
- **Speech-to-Text**: Web Speech API (browser)

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

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open the website in your browser
3. Click "Start Recording" to begin speech-to-text
4. Speak into your microphone
5. Watch as fallacies are detected in real-time with visual feedback

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `WebSocket /ws` - Real-time fallacy detection

## License

MIT

