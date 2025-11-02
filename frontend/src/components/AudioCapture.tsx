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
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const lastInterimRef = useRef('');
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestartingRef = useRef(false);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      // Increase max alternatives for better recognition during pauses
      if ('maxAlternatives' in recognition) {
        (recognition as any).maxAlternatives = 1;
      }

      recognition.onstart = () => {
        console.log('Speech recognition started');
        isRestartingRef.current = false;
        // Clear any pending restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';

        // Process all results from the last resultIndex
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Add to accumulated final transcript
            finalTranscriptRef.current += transcript + ' ';
            // Clear interim when we get final results
            lastInterimRef.current = '';
          } else {
            // Keep interim transcript for this event
            interimTranscript += transcript;
          }
        }

        // Save last interim result to preserve during pauses
        if (interimTranscript) {
          lastInterimRef.current = interimTranscript;
        }

        // Combine accumulated final transcript with current interim results
        const fullTranscript = finalTranscriptRef.current + interimTranscript;
        setTranscript(fullTranscript);
        
        // Send the full accumulated transcript (final + interim) to parent for live updates
        // This ensures parent always gets the complete transcript including interim results
        // Only send if there's actual content
        const trimmedTranscript = fullTranscript.trim();
        if (trimmedTranscript) {
          onTranscript(trimmedTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Not an error, just silence - recognition will continue
          return;
        }
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
          if (onError) {
            onError('Microphone permission denied. Please allow microphone access and try again.');
          }
        } else if (event.error === 'aborted') {
          // Recognition was stopped, don't treat as error
          return;
        } else {
          if (onError) {
            onError(`Speech recognition error: ${event.error}`);
          }
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended (pause or natural stop), isListening:', isListeningRef.current);
        
        // Preserve interim results during pause - show last interim result in transcript
        if (lastInterimRef.current && isListeningRef.current) {
          const fullTranscript = finalTranscriptRef.current + lastInterimRef.current;
          setTranscript(fullTranscript);
        }
        
        // Use ref to avoid stale closure
        if (isListeningRef.current && !isRestartingRef.current) {
          // Longer delay to handle natural pauses in speech (500ms)
          // This prevents rapid restarts during brief pauses
          isRestartingRef.current = true;
          
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Restarted speech recognition after pause');
                isRestartingRef.current = false;
              } catch (e: any) {
                // If it's already started, that's fine - ignore the error
                if (e.message && !e.message.includes('already started')) {
                  console.error('Error restarting recognition:', e);
                  isRestartingRef.current = false;
                  // Try again after a longer delay if it wasn't already started
                  if (isListeningRef.current) {
                    setTimeout(() => {
                      if (isListeningRef.current && recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                          console.log('Restarted speech recognition (retry)');
                        } catch (e2) {
                          console.error('Error on second restart attempt:', e2);
                          isRestartingRef.current = false;
                        }
                      }
                    }, 300);
                  }
                } else {
                  isRestartingRef.current = false;
                }
              }
            } else {
              isRestartingRef.current = false;
            }
          }, 500);
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
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
  }, [onTranscript, onError]);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
        console.log('Starting speech recognition...');
      } catch (e) {
        console.error('Error starting recognition:', e);
        if (onError) {
          onError(`Failed to start speech recognition: ${e}`);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      // Clear any pending restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      isRestartingRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      isListeningRef.current = false;
      console.log('Stopped speech recognition');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    finalTranscriptRef.current = '';
    lastInterimRef.current = '';
    onTranscript('');
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

