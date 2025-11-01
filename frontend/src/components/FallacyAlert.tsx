import React, { useEffect, useState } from 'react';
import { Fallacy } from '../types';
import './FallacyAlert.css';

interface FallacyAlertProps {
  fallacy: Fallacy;
  onDismiss?: () => void;
}

const FallacyAlert: React.FC<FallacyAlertProps> = ({ fallacy, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div
      className={`fallacy-alert ${isVisible ? 'visible' : ''} severity-${fallacy.severity}`}
      style={{
        borderLeftColor: getSeverityColor(fallacy.severity),
        animation: 'slideInRight 0.5s ease-out'
      }}
    >
      <div className="alert-header">
        <div className="alert-title">
          <span className="severity-icon">{getSeverityIcon(fallacy.severity)}</span>
          <span className="fallacy-name">{fallacy.name}</span>
          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(fallacy.severity) }}>
            {fallacy.severity.toUpperCase()}
          </span>
        </div>
        {onDismiss && (
          <button className="dismiss-btn" onClick={onDismiss}>×</button>
        )}
      </div>
      <div className="alert-body">
        <div className="fallacy-type">Type: {fallacy.type.replace(/_/g, ' ')}</div>
        <div className="fallacy-explanation">{fallacy.explanation}</div>
        <div className="fallacy-text">
          <strong>Text:</strong> "{fallacy.text_span}"
        </div>
        <div className="fallacy-confidence">
          Confidence: {(fallacy.confidence * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default FallacyAlert;

