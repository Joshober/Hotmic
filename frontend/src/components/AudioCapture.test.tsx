import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioCapture from './AudioCapture';

// Mock Web Speech API
const mockRecognition = {
  continuous: false,
  interimResults: false,
  lang: '',
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null as any,
  onerror: null as any,
  onend: null as any,
};

describe('AudioCapture', () => {
  let mockOnTranscript: jest.Mock;
  let mockOnError: jest.Mock;

  beforeEach(() => {
    mockOnTranscript = jest.fn();
    mockOnError = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Web Speech API
    (global as any).SpeechRecognition = jest.fn(() => mockRecognition);
    (global as any).webkitSpeechRecognition = jest.fn(() => mockRecognition);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders audio capture component when supported', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    expect(screen.getByText('Live Transcription')).toBeInTheDocument();
    expect(screen.getByText(/Start Recording|Stop Recording/)).toBeInTheDocument();
  });

  it('shows error message when Web Speech API is not supported', () => {
    delete (global as any).SpeechRecognition;
    delete (global as any).webkitSpeechRecognition;
    
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    expect(screen.getByText(/Web Speech API is not supported/)).toBeInTheDocument();
  });

  it('starts listening when start button is clicked', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    const startButton = screen.getByText('▶ Start Recording');
    fireEvent.click(startButton);
    
    expect(mockRecognition.start).toHaveBeenCalled();
    expect(screen.getByText('⏹ Stop Recording')).toBeInTheDocument();
  });

  it('stops listening when stop button is clicked', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    const startButton = screen.getByText('▶ Start Recording');
    fireEvent.click(startButton);
    
    const stopButton = screen.getByText('⏹ Stop Recording');
    fireEvent.click(stopButton);
    
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect(screen.getByText('▶ Start Recording')).toBeInTheDocument();
  });

  it('clears transcript when clear button is clicked', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    // Simulate transcript
    if (mockRecognition.onresult) {
      const mockResult = [{ transcript: 'Hello world', confidence: 0.9 }];
      (mockResult as any).isFinal = true;
      const mockEvent = {
        resultIndex: 0,
        results: [mockResult] as any,
      };
      mockRecognition.onresult(mockEvent);
    }
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    // Transcript should be cleared
    expect(screen.getByText(/Transcript will appear here/)).toBeInTheDocument();
  });

  it('calls onTranscript when final result is received', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    // Wait for recognition to be initialized
    waitFor(() => {
      expect(mockRecognition.onresult).toBeDefined();
    });
    
    // Simulate final transcript
    if (mockRecognition.onresult) {
      const mockEvent = {
        resultIndex: 0,
        results: [
          [{ transcript: 'Hello world', confidence: 0.9 }],
        ],
      };
      (mockEvent.results[0] as any).isFinal = true;
      mockRecognition.onresult(mockEvent);
    }
    
    expect(mockOnTranscript).toHaveBeenCalledWith('Hello world ');
  });

  it('calls onError when recognition error occurs', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    waitFor(() => {
      expect(mockRecognition.onerror).toBeDefined();
    });
    
    if (mockRecognition.onerror) {
      mockRecognition.onerror({ error: 'not-allowed' });
    }
    
    expect(mockOnError).toHaveBeenCalled();
  });

  it('disables clear button when transcript is empty', () => {
    render(<AudioCapture onTranscript={mockOnTranscript} onError={mockOnError} />);
    
    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeDisabled();
  });
});

