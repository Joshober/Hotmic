from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from dotenv import load_dotenv
import os
import asyncio
import json

from app.fallacy_detector import FallacyDetector
from app.models import Fallacy

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallacy-detection-secret-key')

# CORS configuration for React frontend
# Allow all origins for ngrok compatibility (wildcards don't work in Flask-CORS)
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins for ngrok compatibility
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize SocketIO for WebSocket support (with async_mode='threading' for compatibility)
# Allow all origins for ngrok compatibility
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",  # Allow all origins for ngrok compatibility
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    allow_upgrades=True,
    ping_timeout=60,
    ping_interval=25
)

# Initialize fallacy detector
fallacy_detector = FallacyDetector()


@app.route("/")
def root():
    return jsonify({"message": "Real-time Fallacy Detection API is running"})


@app.route("/health")
def health():
    return jsonify({"status": "healthy"})


@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('connected', {'status': 'connected'})


@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


@socketio.on('message')
def handle_message(data):
    """Handle incoming messages from client"""
    try:
        # If data is a string, parse it
        if isinstance(data, str):
            data = json.loads(data)
        
        message_type = data.get("type")
        
        if message_type == "text":
            text = data.get("text", "")
            if text:
                # Run async fallacy detection
                result = asyncio.run(fallacy_detector.detect_fallacies(text))
                
                # Convert Fallacy objects to dict for JSON serialization
                fallacies_dict = []
                for fallacy in result.get("fallacies", []):
                    if isinstance(fallacy, Fallacy):
                        fallacies_dict.append({
                            "type": fallacy.type,
                            "name": fallacy.name,
                            "severity": fallacy.severity,
                            "confidence": fallacy.confidence,
                            "explanation": fallacy.explanation,
                            "text_span": fallacy.text_span,
                            "start_index": fallacy.start_index,
                            "end_index": fallacy.end_index
                        })
                    elif isinstance(fallacy, dict):
                        fallacies_dict.append(fallacy)
                    else:
                        fallacies_dict.append(fallacy)
                
                # Send fallacy detection result back to client
                emit('fallacy_detection', {
                    "type": "fallacy_detection",
                    "text": text,
                    "fallacies": fallacies_dict,
                    "has_fallacies": result.get("has_fallacies", False),
                    "confidence": result.get("confidence", 0.0)
                })
        elif message_type == "ping":
            # Keep-alive ping
            emit('pong', {"type": "pong"})
            
    except Exception as e:
        print(f"Error handling message: {e}")
        emit('error', {"error": str(e)})


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
