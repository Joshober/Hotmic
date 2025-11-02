import React, { useState, useRef } from 'react';
import './Mp3Import.css';

interface Mp3ImportProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
}

const Mp3Import: React.FC<Mp3ImportProps> = ({ onTranscript, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      onError('Please select a valid audio file');
      return;
    }

    setFileName(file.name);
    processAudioFile(file);
  };

  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create audio element for playback
      const audioUrl = URL.createObjectURL(file);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
      }

      // Use Web Speech API for transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          onTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          onError(`Speech recognition error: ${event.error}`);
          setIsProcessing(false);
        };

        recognition.onend = () => {
          setIsProcessing(false);
        };

        // Start recognition and play audio
        recognition.start();
        if (audioRef.current) {
          audioRef.current.play();
          
          audioRef.current.onended = () => {
            recognition.stop();
            setIsProcessing(false);
          };
        }
      } else {
        onError('Speech recognition not supported in this browser');
        setIsProcessing(false);
      }
    } catch (error) {
      onError(`Error processing audio file: ${error}`);
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setFileName(file.name);
      processAudioFile(file);
    } else {
      onError('Please drop a valid audio file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="mp3-import">
      <h3>Import Audio File</h3>
      
      <div 
        className={`drop-zone ${isProcessing ? 'processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing {fileName}...</p>
          </div>
        ) : (
          <div className="drop-content">
            <div className="upload-icon">📁</div>
            <p>Click to select or drag & drop an audio file</p>
            <small>Supports MP3, WAV, M4A, and other audio formats</small>
            {fileName && <p className="selected-file">Selected: {fileName}</p>}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        controls={false}
      />
    </div>
  );
};

export default Mp3Import;