import pytest
import os
from unittest.mock import AsyncMock, MagicMock, patch
from app.fallacy_detector import FallacyDetector
from app.models import Fallacy


class TestFallacyDetector:
    """Tests for FallacyDetector class"""
    
    def test_initialization(self):
        """Test FallacyDetector initialization"""
        detector = FallacyDetector()
        assert detector.api_base == "http://localhost:11434"
        assert detector.model_name == "llama3.2"
        assert len(detector.fallacy_types) > 0
    
    def test_initialization_with_env_vars(self):
        """Test initialization with environment variables"""
        with patch.dict(os.environ, {
            "LOCAL_API_BASE": "http://custom:11434",
            "LOCAL_MODEL_NAME": "custom-model",
            "USE_OLLAMA": "false"
        }):
            detector = FallacyDetector()
            assert detector.api_base == "http://custom:11434"
            assert detector.model_name == "custom-model"
            assert detector.use_ollama is False
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_empty_text(self):
        """Test detection with empty text"""
        detector = FallacyDetector()
        result = await detector.detect_fallacies("")
        assert result["has_fallacies"] is False
        assert len(result["fallacies"]) == 0
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_short_text(self):
        """Test detection with text too short"""
        detector = FallacyDetector()
        result = await detector.detect_fallacies("hi")
        assert result["has_fallacies"] is False
        assert len(result["fallacies"]) == 0
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_with_ollama_success(self):
        """Test detection with Ollama API (successful response)"""
        detector = FallacyDetector()
        detector.use_ollama = True
        
        mock_response = {
            "message": {
                "content": """{
                    "has_fallacies": true,
                    "fallacies": [
                        {
                            "type": "ad_hominem",
                            "name": "Ad Hominem Attack",
                            "severity": "high",
                            "confidence": 0.95,
                            "explanation": "Attacking the person",
                            "text_span": "You're an idiot",
                            "start_index": 0,
                            "end_index": 15
                        }
                    ],
                    "confidence": 0.95,
                    "analysis": "Found one fallacy"
                }"""
            }
        }
        
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = mock_response
            mock_response_obj.raise_for_status = MagicMock()
            mock_client.post = AsyncMock(return_value=mock_response_obj)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_class.return_value = mock_client
            
            result = await detector.detect_fallacies("You're an idiot if you think that")
            
            assert result["has_fallacies"] is True
            assert len(result["fallacies"]) == 1
            assert result["fallacies"][0].type == "ad_hominem"
            assert result["fallacies"][0].severity == "high"
            assert result["confidence"] == 0.95
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_with_openai_format(self):
        """Test detection with OpenAI-compatible API"""
        detector = FallacyDetector()
        detector.use_ollama = False
        
        mock_response = {
            "choices": [{
                "message": {
                    "content": """{
                        "has_fallacies": false,
                        "fallacies": [],
                        "confidence": 0.0,
                        "analysis": "No fallacies found"
                    }"""
                }
            }]
        }
        
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = mock_response
            mock_response_obj.raise_for_status = MagicMock()
            mock_client.post = AsyncMock(return_value=mock_response_obj)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_class.return_value = mock_client
            
            result = await detector.detect_fallacies("This is a perfectly valid argument.")
            
            assert result["has_fallacies"] is False
            assert len(result["fallacies"]) == 0
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_with_json_code_block(self):
        """Test detection when response is wrapped in code blocks"""
        detector = FallacyDetector()
        detector.use_ollama = True
        
        mock_response = {
            "message": {
                "content": "```json\n{\"has_fallacies\": false, \"fallacies\": [], \"confidence\": 0.0}\n```"
            }
        }
        
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = mock_response
            mock_response_obj.raise_for_status = MagicMock()
            mock_client.post = AsyncMock(return_value=mock_response_obj)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_class.return_value = mock_client
            
            result = await detector.detect_fallacies("Valid text that is long enough")
            
            assert result["has_fallacies"] is False
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_api_error(self):
        """Test detection when API call fails"""
        detector = FallacyDetector()
        detector.use_ollama = True
        
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(side_effect=Exception("API Error"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_class.return_value = mock_client
            
            result = await detector.detect_fallacies("Some text that should cause an error")
            
            assert result["has_fallacies"] is False
            assert "error" in result
    
    @pytest.mark.asyncio
    async def test_detect_fallacies_invalid_json(self):
        """Test detection when API returns invalid JSON"""
        detector = FallacyDetector()
        detector.use_ollama = True
        
        mock_response = {
            "message": {
                "content": "This is not valid JSON"
            }
        }
        
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = mock_response
            mock_response_obj.raise_for_status = MagicMock()
            mock_client.post = AsyncMock(return_value=mock_response_obj)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_class.return_value = mock_client
            
            result = await detector.detect_fallacies("Some text")
            
            # Should handle error gracefully
            assert "error" in result or result["has_fallacies"] is False

