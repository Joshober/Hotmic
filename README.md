# Real-Time Fallacy Detection

A production-ready full-stack web application that performs real-time speech-to-text conversion and AI-powered detection of logical fallacies and factual errors.

## Overview

This application provides a comprehensive solution for real-time fallacy detection during speech. Users can speak naturally into their microphone, and the system will instantly analyze the spoken text for logical fallacies, factual inaccuracies, and argumentative flaws using advanced AI models.

## Key Features

- **Real-Time Speech-to-Text**: Browser-based Web Speech API integration for instant transcription
- **AI-Powered Analysis**: Leverages local LLM (Ollama) or OpenAI-compatible APIs for fallacy detection
- **Visual Feedback**: Color-coded text highlighting based on fallacy severity
- **Live Statistics**: Real-time dashboard showing fallacy detection metrics
- **Interactive Alerts**: Instant notifications when fallacies are detected
- **Multi-Speaker Support**: Track and analyze fallacies by speaker

## Technology Stack

### Backend
- **Framework**: Flask 3.0 with Flask-SocketIO for real-time communication
- **Language**: Python 3.11+
- **WebSockets**: Socket.IO for bidirectional real-time messaging
- **AI Integration**: Ollama or OpenAI-compatible API endpoints

### Frontend
- **Framework**: React 18 with TypeScript
- **Real-Time**: Socket.IO client for WebSocket communication
- **Visualization**: Recharts for statistical dashboards
- **Styling**: CSS3 with animations and responsive design

### Deployment
- **Containerization**: Docker and Docker Compose
- **Production Server**: Nginx for frontend serving
- **Optional Tunneling**: Ngrok for public access during development

## Installation

### Prerequisites

- Docker and Docker Compose (for containerized deployment), OR
- Python 3.11+ and Node.js 18+ (for local development)
- Ollama installed (for local AI model support)

### Quick Start with Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd michackathondemo
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   LOCAL_API_BASE=http://host.docker.internal:11434
   LOCAL_MODEL_NAME=llama3.2
   USE_OLLAMA=true
   PORT=8000
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Backend API: `http://localhost:8000`
   - Frontend: `http://localhost:8001`

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

**Note**: Ensure Ollama is running on your host machine for local model support.

### Local Development Setup

#### Backend Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install and configure Ollama**:
   - Download from [ollama.ai](https://ollama.ai)
   - Install the llama3.2 model: `ollama pull llama3.2`

3. **Configure environment**:
   ```bash
   cp env.example .env
   ```
   Edit `.env`:
   ```env
   LOCAL_API_BASE=http://localhost:11434
   LOCAL_MODEL_NAME=llama3.2
   USE_OLLAMA=true
   PORT=8000
   ```

4. **Start the backend server**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`.

#### Frontend Installation

1. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Optional: Configure backend URL**:
   Create `frontend/.env`:
   ```env
   REACT_APP_WS_URL=http://localhost:8000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:8001`.

### Automated Installation (Windows)

1. **Run the installation script**:
   ```batch
   install.bat
   ```
   Or with PowerShell:
   ```powershell
   .\install.ps1
   ```

   This script will:
   - Verify Python and Node.js installations
   - Install all dependencies
   - Install Ollama (if not present)
   - Download the llama3.2 model
   - Create configuration files

2. **Start the application**:
   ```batch
   run.bat
   ```
   Or with PowerShell:
   ```powershell
   .\run.ps1
   ```

## Configuration

### Environment Variables

#### Backend Configuration (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `LOCAL_API_BASE` | Ollama API base URL | `http://localhost:11434` |
| `LOCAL_MODEL_NAME` | AI model name | `llama3.2` |
| `USE_OLLAMA` | Enable Ollama integration | `true` |
| `PORT` | Backend server port | `8000` |

#### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_WS_URL` | Backend WebSocket URL | `http://localhost:8000` |

### Ngrok Configuration (Optional)

For public access via ngrok tunneling:

1. **Copy the configuration template**:
   ```bash
   cp ngrok.yml.example ngrok.yml
   ```

2. **Edit `ngrok.yml`** and add your ngrok authentication token and static domain

3. **Run with ngrok**:
   ```batch
   run-ngrok.bat
   ```

The frontend automatically detects when accessed via ngrok and connects to the backend through the tunnel.

## Usage

1. Start both backend and frontend services (or use Docker Compose)
2. Open `http://localhost:8001` in a supported browser
3. Click "Start Recording" to begin speech-to-text conversion
4. Speak into your microphone
5. Observe real-time fallacy detection with visual feedback:
   - Text highlighting indicates detected fallacies
   - Color coding shows severity levels
   - Dashboard displays real-time statistics
   - Alerts notify you of detected issues

## API Documentation

### REST Endpoints

- `GET /` - API status information
- `GET /health` - Health check endpoint

### WebSocket API (Socket.IO)

The application uses Socket.IO for real-time bidirectional communication.

#### Client to Server Events

**`message`** - Send text for fallacy detection:
```json
{
  "type": "text",
  "text": "The text to analyze for fallacies"
}
```

#### Server to Client Events

**`fallacy_detection`** - Detection results:
```json
{
  "type": "fallacy_detection",
  "text": "Original text analyzed",
  "fallacies": [
    {
      "type": "ad_hominem",
      "name": "Ad Hominem Attack",
      "severity": "medium",
      "confidence": 0.85,
      "explanation": "Attacking the person instead of their argument",
      "text_span": "attacking the person",
      "start_index": 10,
      "end_index": 35
    }
  ],
  "has_fallacies": true,
  "confidence": 0.85
}
```

## Project Structure

```
michackathondemo/
├── app/                      # Backend application modules
│   ├── __init__.py
│   ├── fallacy_detector.py   # AI-powered fallacy detection logic
│   ├── models.py             # Data models and schemas
│   └── speech_processor.py   # Speech processing utilities
├── frontend/                  # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AudioCapture.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FallacyAlert.tsx
│   │   │   └── VisualFeedback.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useWebSocket.ts
│   │   └── types.ts         # TypeScript type definitions
│   └── package.json
├── tests/                    # Test suite
├── main.py                   # Flask application entry point
├── requirements.txt          # Python dependencies
├── Dockerfile                # Backend Docker image configuration
├── docker-compose.yml        # Docker Compose orchestration
├── env.example               # Environment variable template
├── ngrok.yml.example         # Ngrok configuration template
├── install.bat               # Windows installation script
├── install.ps1               # PowerShell installation script
├── run.bat                   # Windows startup script
├── run.ps1                   # PowerShell startup script
├── run-ngrok.bat             # Ngrok startup script
└── README.md                 # This file
```

## Development

### Running Tests

**Backend tests**:
```bash
pytest
```

**Frontend tests**:
```bash
cd frontend
npm test
```

### Building for Production

**Frontend production build**:
```bash
cd frontend
npm run build
```

The production build output will be in `frontend/build/`.

**Docker production build**:
```bash
docker-compose build
```

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend code
- Write tests for new features
- Update documentation for API changes
- Follow semantic versioning for releases

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Docker Deployment

1. **Build production images**:
   ```bash
   docker-compose build
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Monitor service health**:
   ```bash
   docker-compose logs -f
   docker-compose ps
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Browser Compatibility

| Browser | Support Level |
|---------|---------------|
| Chrome/Edge | Full support (recommended) |
| Safari | Full support |
| Firefox | Limited Web Speech API support |

## Security Considerations

- Environment variables are excluded from version control
- Sensitive configuration files (ngrok.yml) are gitignored
- CORS is configured for development and production environments
- All user input is sanitized and validated

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
