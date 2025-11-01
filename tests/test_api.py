import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from main import app


class TestAPIEndpoints:
    """Tests for FastAPI endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create a test client"""
        return TestClient(app)
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
        assert "Real-time Fallacy Detection API" in response.json()["message"]
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
    
    def test_websocket_connection(self, client):
        """Test WebSocket connection"""
        with client.websocket_connect("/ws") as websocket:
            # Send a ping to verify connection
            websocket.send_json({"type": "ping"})
            data = websocket.receive_json()
            assert data["type"] == "pong"
    
    def test_websocket_text_message(self, client):
        """Test WebSocket text message handling"""
        with patch("main.fallacy_detector") as mock_detector:
            mock_detector.detect_fallacies = AsyncMock(return_value={
                "has_fallacies": False,
                "fallacies": [],
                "confidence": 0.0
            })
            
            # We need to patch the actual instance
            from main import fallacy_detector
            original_detect = fallacy_detector.detect_fallacies
            
            try:
                fallacy_detector.detect_fallacies = AsyncMock(return_value={
                    "has_fallacies": False,
                    "fallacies": [],
                    "confidence": 0.0
                })
                
                with client.websocket_connect("/ws") as websocket:
                    websocket.send_json({"type": "text", "text": "Hello world"})
                    data = websocket.receive_json()
                    assert data["type"] == "fallacy_detection"
                    assert data["text"] == "Hello world"
                    assert data["has_fallacies"] is False
            finally:
                fallacy_detector.detect_fallacies = original_detect
    
    def test_websocket_with_fallacies(self, client):
        """Test WebSocket with detected fallacies"""
        from app.models import Fallacy
        from main import fallacy_detector
        original_detect = fallacy_detector.detect_fallacies
        
        test_fallacy = Fallacy(
            type="ad_hominem",
            name="Ad Hominem",
            severity="high",
            confidence=0.9,
            explanation="Test",
            text_span="You're wrong",
            start_index=0,
            end_index=10
        )
        
        try:
            fallacy_detector.detect_fallacies = AsyncMock(return_value={
                "has_fallacies": True,
                "fallacies": [test_fallacy],
                "confidence": 0.9
            })
            
            with client.websocket_connect("/ws") as websocket:
                websocket.send_json({"type": "text", "text": "You're wrong"})
                data = websocket.receive_json()
                assert data["type"] == "fallacy_detection"
                assert data["has_fallacies"] is True
                assert len(data["fallacies"]) == 1
                assert data["fallacies"][0]["type"] == "ad_hominem"
        finally:
            fallacy_detector.detect_fallacies = original_detect
    
    def test_websocket_disconnect(self, client):
        """Test WebSocket disconnect handling"""
        with client.websocket_connect("/ws") as websocket:
            # Connection should work
            websocket.send_json({"type": "ping"})
            data = websocket.receive_json()
            assert data["type"] == "pong"
        
        # After exiting context, connection should be closed gracefully

