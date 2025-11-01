import React, { useEffect, useState, useRef } from 'react';
import './AudioCapture.css';

interface AudioCaptureProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onTranscript, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        
        // Send final results to parent
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Not an error, just silence
          return;
        }
        if (onError) {
          onError(`Speech recognition error: ${event.error}`);
        }
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart if we're still supposed to be listening
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      if (onError) {
        onError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError, isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="audio-capture">
        <div className="error-message">
          Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.
        </div>
      </div>
    );
  }

  return (
    <div className="audio-capture">
      <div className="transcript-container">
        <div className="transcript-header">
          <h3>Live Transcription</h3>
          <div className="status-indicator">
            <span className={`status-dot ${isListening ? 'listening' : 'stopped'}`}></span>
            <span>{isListening ? 'Listening...' : 'Stopped'}</span>
          </div>
        </div>
        <div className="transcript-text">
          {transcript || <span className="placeholder">Transcript will appear here...</span>}
        </div>
      </div>
      <div className="controls">
        <button
          className={`btn btn-primary ${isListening ? 'active' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
        >
          {isListening ? '⏹ Stop Recording' : '▶ Start Recording'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={clearTranscript}
          disabled={!transcript}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default AudioCapture;

