import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import AudioCapture from './components/AudioCapture';
import VisualFeedback from './components/VisualFeedback';
import FallacyAlert from './components/FallacyAlert';
import Dashboard from './components/Dashboard';
import SpeakerSelector from './components/SpeakerSelector';
import { useWebSocket } from './hooks/useWebSocket';
import { Fallacy, FallacyDetection, FallacyStats } from './types';

function App() {
  const [transcript, setTranscript] = useState('');
  const [fallacies, setFallacies] = useState<Fallacy[]>([]);
  const [detectedFallacies, setDetectedFallacies] = useState<Fallacy[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState('');
  const [speakers, setSpeakers] = useState<string[]>(['Speaker 1', 'Speaker 2']);

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  const handleFallacyDetection = useCallback((data: FallacyDetection) => {
    if (data.has_fallacies && data.fallacies.length > 0) {
      // Add speaker info to fallacies
      const fallaciesWithSpeaker = data.fallacies.map(fallacy => ({
        ...fallacy,
        speaker: currentSpeaker || data.speaker || 'Unknown'
      }));

      setFallacies(prev => {
        // Avoid duplicates based on text span and speaker
        const newFallacies = fallaciesWithSpeaker.filter(
          newFallacy => !prev.some(
            existing => existing.text_span === newFallacy.text_span && 
                       existing.type === newFallacy.type &&
                       existing.speaker === newFallacy.speaker
          )
        );
        return [...prev, ...newFallacies];
      });
      
      // Add to detected fallacies for alerts (with auto-dismiss after 10 seconds)
      setDetectedFallacies(prev => [...prev, ...fallaciesWithSpeaker]);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setDetectedFallacies(prev => prev.slice(1));
      }, 10000);
    }
  }, [currentSpeaker]);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
    setIsConnected(false);
  }, []);

  const { isConnected: wsConnected, sendMessage } = useWebSocket(
    handleFallacyDetection,
    handleWebSocketError
  );

  React.useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  // Send transcript chunks to WebSocket when new text is available
  React.useEffect(() => {
    if (transcript && isConnected) {
      // Send full transcript every 2 seconds or when significant change
      const timer = setTimeout(() => {
        if (transcript.trim().length > 10) {
          sendMessage(transcript, currentSpeaker);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [transcript, isConnected, sendMessage, currentSpeaker]);

  const stats: FallacyStats = useMemo(() => {
    const byType: Record<string, number> = {};
    const bySeverity = {
      low: 0,
      medium: 0,
      high: 0,
    };
    const bySpeaker: Record<string, number> = {};
    const speakerDetails: Record<string, {
      total: number;
      bySeverity: { low: number; medium: number; high: number };
    }> = {};

    fallacies.forEach(fallacy => {
      byType[fallacy.type] = (byType[fallacy.type] || 0) + 1;
      bySeverity[fallacy.severity] = (bySeverity[fallacy.severity] as number) + 1;
      
      const speaker = fallacy.speaker || 'Unknown';
      bySpeaker[speaker] = (bySpeaker[speaker] || 0) + 1;
      
      if (!speakerDetails[speaker]) {
        speakerDetails[speaker] = {
          total: 0,
          bySeverity: { low: 0, medium: 0, high: 0 }
        };
      }
      speakerDetails[speaker].total += 1;
      speakerDetails[speaker].bySeverity[fallacy.severity] = 
        (speakerDetails[speaker].bySeverity[fallacy.severity] as number) + 1;
    });

    return {
      total: fallacies.length,
      byType,
      bySeverity,
      bySpeaker,
      speakerDetails,
    };
  }, [fallacies]);

  const handleDismissAlert = useCallback((index: number) => {
    setDetectedFallacies(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setTranscript('');
    setFallacies([]);
    setDetectedFallacies([]);
  }, []);

  const handleSpeakerChange = useCallback((speaker: string) => {
    setCurrentSpeaker(speaker);
  }, []);

  const handleAddSpeaker = useCallback((speaker: string) => {
    setSpeakers(prev => {
      if (!prev.includes(speaker)) {
        return [...prev, speaker];
      }
      return prev;
    });
    setCurrentSpeaker(speaker);
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Real-Time Fallacy Detection</h1>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          <div className="left-panel">
            <SpeakerSelector
              currentSpeaker={currentSpeaker}
              speakers={speakers}
              onSpeakerChange={handleSpeakerChange}
              onAddSpeaker={handleAddSpeaker}
            />
            <AudioCapture
              onTranscript={handleTranscript}
              onError={(error) => console.error('Audio capture error:', error)}
            />
            
            <VisualFeedback
              text={transcript}
              fallacies={fallacies}
              stats={stats}
            />
          </div>

          <div className="right-panel">
            <Dashboard stats={stats} />
            
            <div className="alerts-panel">
              <h2>Live Alerts</h2>
              <div className="alerts-container">
                {detectedFallacies.length === 0 ? (
                  <div className="no-alerts">No fallacies detected yet</div>
                ) : (
                  detectedFallacies.map((fallacy, index) => (
                    <FallacyAlert
                      key={`${fallacy.type}-${fallacy.text_span}-${index}`}
                      fallacy={fallacy}
                      onDismiss={() => handleDismissAlert(index)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {fallacies.length > 0 && (
        <div className="clear-all">
          <button className="btn-clear" onClick={handleClearAll}>
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
