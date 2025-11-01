# Audio processing utilities for future backend speech-to-text
# Currently, we're using Web Speech API in the browser for real-time transcription

from typing import Optional
import os

class SpeechProcessor:
    """Placeholder for future backend audio processing"""
    
    def __init__(self):
        self.whisper_api_key = os.getenv("OPENAI_API_KEY")
    
    async def transcribe_audio(self, audio_data: bytes) -> Optional[str]:
        """
        Future: Transcribe audio using Whisper API
        Currently not implemented - using Web Speech API in browser instead
        """
        # TODO: Implement Whisper API integration for backend transcription
        return None
    
    def process_audio_stream(self, audio_stream):
        """Process audio stream for real-time transcription"""
        # TODO: Implement streaming audio processing
        pass

