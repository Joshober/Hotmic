import pytest
from flask import Flask
from flask.testing import FlaskClient
from unittest.mock import AsyncMock, patch
from main import app, socketio


class TestAPIEndpoints:
    """Tests for Flask endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create a test client"""
        return app.test_client()
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()
        assert "message" in data
        assert "Real-time Fallacy Detection API" in data["message"]
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "healthy"}
    
    def test_websocket_connection(self, client):
        """Test Socket.IO connection"""
        # Note: Socket.IO testing requires socketio.test_client()
        # For now, we just verify the endpoint exists
        # Full Socket.IO integration tests would require socketio.test_client()
        socketio_client = socketio.test_client(app)
        assert socketio_client.is_connected()
        socketio_client.disconnect()
    
    def test_websocket_text_message(self):
        """Test Socket.IO text message handling"""
        from main import fallacy_detector
        from unittest.mock import AsyncMock
        
        # Patch the fallacy detector for testing
        original_detect = fallacy_detector.detect_fallacies
        
        try:
            fallacy_detector.detect_fallacies = AsyncMock(return_value={
                "has_fallacies": False,
                "fallacies": [],
                "confidence": 0.0
            })
            
            socketio_client = socketio.test_client(app)
            socketio_client.emit('message', {
                "type": "text",
                "text": "Hello world"
            })
            
            # Note: Socket.IO test client doesn't easily return responses
            # This is a basic connectivity test
            assert socketio_client.is_connected()
            socketio_client.disconnect()
        finally:
            fallacy_detector.detect_fallacies = original_detect


