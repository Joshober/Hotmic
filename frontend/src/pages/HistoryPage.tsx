import React, { useState, useEffect } from 'react';
import { Fallacy } from '../types';
import './HistoryPage.css';

interface HistorySession {
  id: string;
  timestamp: Date;
  transcript: string;
  fallacies: Fallacy[];
  totalFallacies: number;
}

const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

  useEffect(() => {
    // Load history from localStorage
    const historyData = localStorage.getItem('fallacyHistory');
    if (historyData) {
      try {
        const parsed = JSON.parse(historyData);
        const sessionsWithDates = parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
        setSessions(sessionsWithDates.sort((a: HistorySession, b: HistorySession) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('fallacyHistory', JSON.stringify(updated));
    if (selectedSession?.id === id) {
      setSelectedSession(null);
    }
  };

  const handleClearAll = () => {
    setSessions([]);
    setSelectedSession(null);
    localStorage.removeItem('fallacyHistory');
  };

  return (
    <div className="history-page">
      <div className="history-page-header">
        <h1>Detection History</h1>
        <p className="history-subtitle">
          View past fallacy detection sessions and their results
        </p>
      </div>

      <div className="history-content">
        <div className="history-sessions">
          <div className="history-sessions-header">
            <h2>Sessions ({sessions.length})</h2>
            {sessions.length > 0 && (
              <button className="btn-clear-all" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="no-sessions">
              <div className="no-sessions-icon">📜</div>
              <h3>No History Available</h3>
              <p>Your past fallacy detection sessions will appear here.</p>
              <p className="no-sessions-hint">Start analyzing speech on the Analysis page to create history.</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`session-card ${selectedSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-card-header">
                    <div className="session-info">
                      <div className="session-date">{formatDate(session.timestamp)}</div>
                      <div className="session-stats">
                        {session.totalFallacies} {session.totalFallacies === 1 ? 'fallacy' : 'fallacies'} detected
                      </div>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      title="Delete session"
                    >
                      ×
                    </button>
                  </div>
                  <div className="session-preview">
                    {session.transcript.substring(0, 150)}
                    {session.transcript.length > 150 && '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSession && (
          <div className="history-details">
            <div className="history-details-header">
              <h2>Session Details</h2>
              <button
                className="btn-close"
                onClick={() => setSelectedSession(null)}
              >
                ×
              </button>
            </div>
            
            <div className="session-details">
              <div className="detail-section">
                <h3>Session Information</h3>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedSession.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Fallacies:</span>
                  <span className="detail-value">{selectedSession.totalFallacies}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Full Transcript</h3>
                <div className="transcript-display">
                  {selectedSession.transcript || 'No transcript available'}
                </div>
              </div>

              {selectedSession.fallacies.length > 0 && (
                <div className="detail-section">
                  <h3>Detected Fallacies</h3>
                  <div className="fallacies-list">
                    {selectedSession.fallacies.map((fallacy, index) => (
                      <div key={index} className="fallacy-item">
                        <div className="fallacy-item-header">
                          <span className={`severity-badge severity-${fallacy.severity}`}>
                            {fallacy.severity.toUpperCase()}
                          </span>
                          <span className="fallacy-name">{fallacy.name}</span>
                        </div>
                        <div className="fallacy-type">Type: {fallacy.type.replace(/_/g, ' ')}</div>
                        <div className="fallacy-explanation">{fallacy.explanation}</div>
                        <div className="fallacy-text">"{fallacy.text_span}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
