# Real-Time Fallacy Detection - Frontend

React TypeScript frontend for the real-time fallacy detection website.

## Features

- Real-time speech-to-text using Web Speech API
- Live fallacy detection with visual feedback
- Color-coded text highlighting
- Real-time statistics dashboard
- Animated alerts and notifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```
REACT_APP_WS_URL=ws://localhost:8000/ws
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Browser Compatibility

- Chrome/Edge: Full support (recommended)
- Safari: Full support
- Firefox: Limited Web Speech API support

## Project Structure

```
src/
  components/
    AudioCapture.tsx      # Speech-to-text component
    VisualFeedback.tsx   # Color-coded text highlighting
    FallacyAlert.tsx      # Real-time fallacy alerts
    Dashboard.tsx         # Statistics dashboard
  hooks/
    useWebSocket.ts      # WebSocket connection hook
  types.ts               # TypeScript type definitions
  App.tsx                # Main application component
```

## Technologies Used

- React 18 with TypeScript
- Web Speech API for speech-to-text
- WebSocket for real-time communication
- Recharts for data visualization
- CSS3 for animations and styling
