import pytest
from pydantic import ValidationError
from app.models import TextMessage, Fallacy, FallacyDetectionResult, PingMessage


class TestTextMessage:
    """Tests for TextMessage model"""
    
    def test_valid_text_message(self):
        """Test creating a valid TextMessage"""
        message = TextMessage(type="text", text="Hello world", timestamp=1234567890.0)
        assert message.type == "text"
        assert message.text == "Hello world"
        assert message.timestamp == 1234567890.0
    
    def test_text_message_without_timestamp(self):
        """Test creating TextMessage without timestamp"""
        message = TextMessage(type="text", text="Hello world")
        assert message.timestamp is None
    
    def test_invalid_text_message_type(self):
        """Test that invalid type raises ValidationError"""
        with pytest.raises(ValidationError):
            TextMessage(type="invalid", text="Hello")


class TestFallacy:
    """Tests for Fallacy model"""
    
    def test_valid_fallacy(self):
        """Test creating a valid Fallacy"""
        fallacy = Fallacy(
            type="ad_hominem",
            name="Ad Hominem Attack",
            severity="high",
            confidence=0.95,
            explanation="Attacking the person",
            text_span="You're an idiot",
            start_index=0,
            end_index=15
        )
        assert fallacy.type == "ad_hominem"
        assert fallacy.severity == "high"
        assert fallacy.confidence == 0.95
        assert fallacy.start_index == 0
        assert fallacy.end_index == 15
    
    def test_fallacy_without_indices(self):
        """Test creating Fallacy without start/end indices"""
        fallacy = Fallacy(
            type="strawman",
            name="Strawman",
            severity="medium",
            confidence=0.8,
            explanation="Misrepresenting argument",
            text_span="Some text"
        )
        assert fallacy.start_index is None
        assert fallacy.end_index is None
    
    def test_invalid_severity(self):
        """Test that invalid severity raises ValidationError"""
        with pytest.raises(ValidationError):
            Fallacy(
                type="ad_hominem",
                name="Test",
                severity="invalid",
                confidence=0.5,
                explanation="Test",
                text_span="Test"
            )
    
    def test_confidence_bounds(self):
        """Test that confidence can be any float value"""
        fallacy_low = Fallacy(
            type="test",
            name="Test",
            severity="low",
            confidence=0.0,
            explanation="Test",
            text_span="Test"
        )
        fallacy_high = Fallacy(
            type="test",
            name="Test",
            severity="high",
            confidence=1.0,
            explanation="Test",
            text_span="Test"
        )
        assert fallacy_low.confidence == 0.0
        assert fallacy_high.confidence == 1.0


class TestFallacyDetectionResult:
    """Tests for FallacyDetectionResult model"""
    
    def test_valid_result_with_fallacies(self):
        """Test creating a result with fallacies"""
        fallacies = [
            Fallacy(
                type="ad_hominem",
                name="Ad Hominem",
                severity="high",
                confidence=0.9,
                explanation="Attack on person",
                text_span="You're wrong"
            )
        ]
        result = FallacyDetectionResult(
            has_fallacies=True,
            fallacies=fallacies,
            confidence=0.9,
            analysis="Found one fallacy"
        )
        assert result.has_fallacies is True
        assert len(result.fallacies) == 1
        assert result.confidence == 0.9
    
    def test_result_without_fallacies(self):
        """Test creating a result without fallacies"""
        result = FallacyDetectionResult(
            has_fallacies=False,
            fallacies=[],
            confidence=0.0,
            analysis=None
        )
        assert result.has_fallacies is False
        assert len(result.fallacies) == 0
        assert result.analysis is None


class TestPingMessage:
    """Tests for PingMessage model"""
    
    def test_valid_ping_message(self):
        """Test creating a valid PingMessage"""
        message = PingMessage(type="ping")
        assert message.type == "ping"
    
    def test_invalid_ping_message_type(self):
        """Test that invalid type raises ValidationError"""
        with pytest.raises(ValidationError):
            PingMessage(type="pong")

