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
            try:
                data = json.loads(data)
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON message: {e}")
                emit('error', {"error": "Invalid message format"})
                return
        
        message_type = data.get("type")
        
        if message_type == "text":
            text = data.get("text", "").strip()
            
            # Validate text before processing
            if not text or len(text) < 3:
                # Too short, skip processing
                return
            
            # Prevent processing duplicate/very similar messages
            # This helps during pauses when same text might be sent multiple times
            
            try:
                # Run async fallacy detection with timeout
                result = asyncio.run(fallacy_detector.detect_fallacies(text))
                
                # Safely convert Fallacy objects to dict for JSON serialization
                fallacies_dict = []
                if result and isinstance(result, dict):
                    fallacies = result.get("fallacies", [])
                    if fallacies:
                        for fallacy in fallacies:
                            try:
                                if isinstance(fallacy, Fallacy):
                                    fallacies_dict.append({
                                        "type": fallacy.type or "unknown",
                                        "name": fallacy.name or "Unknown Fallacy",
                                        "severity": fallacy.severity or "low",
                                        "confidence": float(fallacy.confidence) if fallacy.confidence is not None else 0.0,
                                        "explanation": fallacy.explanation or "",
                                        "text_span": fallacy.text_span or "",
                                        "start_index": fallacy.start_index,
                                        "end_index": fallacy.end_index
                                    })
                                elif isinstance(fallacy, dict):
                                    fallacies_dict.append(fallacy)
                            except Exception as e:
                                print(f"Error processing fallacy: {e}")
                                continue
                
                # Safely get confidence
                confidence = result.get("confidence", 0.0) if result else 0.0
                try:
                    confidence = float(confidence) if confidence else 0.0
                except (ValueError, TypeError):
                    confidence = 0.0
                
                # Send fallacy detection result back to client
                emit('fallacy_detection', {
                    "type": "fallacy_detection",
                    "text": text,
                    "fallacies": fallacies_dict,
                    "has_fallacies": result.get("has_fallacies", False) if result else False,
                    "confidence": confidence
                })
            except Exception as e:
                print(f"Error detecting fallacies: {e}")
                import traceback
                traceback.print_exc()
                
                # Send error response but don't crash
                emit('error', {
                    "error": str(e),
                    "text": text[:100] if text else ""  # Include text for debugging
                })
                
                # Still send a response with no fallacies so frontend knows processing completed
                emit('fallacy_detection', {
                    "type": "fallacy_detection",
                    "text": text,
                    "fallacies": [],
                    "has_fallacies": False,
                    "confidence": 0.0,
                    "error": str(e)
                })
                
        elif message_type == "ping":
            # Keep-alive ping
            emit('pong', {"type": "pong"})
        else:
            print(f"Unknown message type: {message_type}")
            
    except Exception as e:
        print(f"Error handling message: {e}")
        import traceback
        traceback.print_exc()
        try:
            emit('error', {"error": str(e)})
        except:
            # If even emitting error fails, just log it
            print("Critical error: Could not emit error to client")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
