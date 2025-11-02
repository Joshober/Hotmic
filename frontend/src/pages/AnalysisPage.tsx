import React, { useState, useCallback, useMemo } from 'react';
import AudioCapture from '../components/AudioCapture';
import VisualFeedback from '../components/VisualFeedback';
import FallacyAlert from '../components/FallacyAlert';
import SpeakerSelector from '../components/SpeakerSelector';
import { useWebSocket } from '../hooks/useWebSocket';
import { Fallacy, FallacyDetection, FallacyStats } from '../types';
import './AnalysisPage.css';

const AnalysisPage: React.FC = () => {
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
      const fallaciesWithSpeaker = data.fallacies.map(fallacy => ({
        ...fallacy,
        speaker: currentSpeaker || data.speaker || 'Unknown'
      }));

      setFallacies(prev => {
        const newFallacies = fallaciesWithSpeaker.filter(
          newFallacy => !prev.some(
            existing => existing.text_span === newFallacy.text_span && 
                       existing.type === newFallacy.type &&
                       existing.speaker === newFallacy.speaker
          )
        );
        return [...prev, ...newFallacies];
      });
      
      setDetectedFallacies(prev => [...prev, ...fallaciesWithSpeaker]);
      
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

  const transcriptTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSentTranscriptRef = React.useRef<string>('');

  React.useEffect(() => {
    if (!transcript || !isConnected) {
      return;
    }

    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
    }

    const trimmed = transcript.trim();
    if (trimmed.length < 10) {
      return;
    }

    if (trimmed === lastSentTranscriptRef.current) {
      return;
    }

    transcriptTimeoutRef.current = setTimeout(() => {
      const currentTrimmed = transcript.trim();
      if (currentTrimmed.length >= 10 && currentTrimmed !== lastSentTranscriptRef.current) {
        try {
          sendMessage(currentTrimmed, currentSpeaker);
          lastSentTranscriptRef.current = currentTrimmed;
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }, 3000);

    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
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
    <div className="analysis-page">
      <div className="analysis-content">
        <div className="analysis-main">
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

        {fallacies.length > 0 && (
          <div className="clear-all">
            <button className="btn-clear" onClick={handleClearAll}>
              Clear All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
