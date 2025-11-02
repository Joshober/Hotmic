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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        try {
          let interimTranscript = '';
          let finalTranscript = '';

          if (!event.results || event.results.length === 0) {
            return;
          }

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i] || !event.results[i][0]) {
              continue;
            }
            
            const transcript = event.results[i][0].transcript || '';
            if (event.results[i].isFinal && transcript.trim()) {
              finalTranscript += transcript + ' ';
            } else if (!event.results[i].isFinal) {
              interimTranscript += transcript;
            }
          }

          // Combine final and interim, but prioritize final results
          const fullTranscript = finalTranscript.trim() || interimTranscript.trim();
          
          // Only update if we have meaningful content
          if (fullTranscript) {
            setTranscript(fullTranscript);
            
            // Only send final results (not interim) to parent to avoid spam
            // Final results are sent on natural pauses
            if (finalTranscript.trim() && finalTranscript.trim().length >= 5) {
              onTranscript(finalTranscript.trim());
            }
          }
        } catch (error) {
          console.error('Error processing speech recognition result:', error);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle different error types
        if (event.error === 'no-speech') {
          // Not an error, just silence/pause - this is normal, don't show error
          // Don't stop listening, just continue
          return;
        }
        
        if (event.error === 'aborted') {
          // Recognition was stopped - this is expected, don't treat as error
          return;
        }
        
        let errorMsg = '';
        let shouldStop = false;
        
        if (event.error === 'not-allowed') {
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          shouldStop = true;
        } else if (event.error === 'network') {
          errorMsg = 'Network error. Please check your internet connection.';
          shouldStop = true;
        } else if (event.error === 'service-not-allowed') {
          errorMsg = 'Speech recognition service not available.';
          shouldStop = true;
        } else if (event.error === 'audio-capture') {
          errorMsg = 'No microphone found or microphone access denied.';
          shouldStop = true;
        } else if (event.error === 'bad-grammar') {
          // Grammar errors are usually recoverable, don't stop
          console.warn('Grammar error in speech recognition (recoverable)');
          return;
        } else {
          // For other errors, log but don't necessarily stop
          errorMsg = `Speech recognition error: ${event.error}`;
        }
        
        if (errorMsg) {
          setErrorMessage(errorMsg);
          if (onError) {
            onError(errorMsg);
          }
          if (shouldStop) {
            setIsListening(false);
            isListeningRef.current = false;
          }
        }
      };

      recognition.onend = () => {
        // Use ref to check if we should still be listening
        if (isListeningRef.current && recognitionRef.current) {
          // Add a small delay before restarting to prevent rapid restart loops
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e: any) {
                // If we get an error starting (e.g., already started), ignore it
                if (e.name !== 'InvalidStateError' && e.message?.includes('already')) {
                  console.error('Error restarting recognition:', e);
                }
                // Only stop if it's a real error
                if (e.name === 'NotAllowedError') {
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }
          }, 100); // Small delay to prevent restart loops
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      const msg = 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.';
      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
        recognitionRef.current = null;
      }
      isListeningRef.current = false;
    };
  }, [onTranscript, onError]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    // Check for microphone permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setErrorMessage('');
    } catch (err: any) {
      const msg = 'Microphone permission denied. Please allow microphone access and try again.';
      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
      return;
    }

    if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
        setErrorMessage('');
      } catch (e: any) {
        console.error('Error starting recognition:', e);
        const msg = e.message || 'Failed to start speech recognition. Please try again.';
        setErrorMessage(msg);
        setIsListening(false);
        isListeningRef.current = false;
        if (onError) {
          onError(msg);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        isListeningRef.current = false;
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
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
      {errorMessage && (
        <div className="error-message" style={{color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px'}}>
          {errorMessage}
        </div>
      )}
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

