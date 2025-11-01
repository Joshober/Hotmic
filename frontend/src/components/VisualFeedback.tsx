import React, { useMemo } from 'react';
import { Fallacy, FallacyStats } from '../types';
import './VisualFeedback.css';

interface VisualFeedbackProps {
  text: string;
  fallacies: Fallacy[];
  stats: FallacyStats;
}

const VisualFeedback: React.FC<VisualFeedbackProps> = ({ text, fallacies, stats }) => {
  const highlightedText = useMemo(() => {
    if (!text || fallacies.length === 0) {
      return text;
    }

    // Sort fallacies by start index
    const sortedFallacies = [...fallacies].sort((a, b) => {
      const aStart = a.start_index ?? 0;
      const bStart = b.start_index ?? 0;
      return aStart - bStart;
    });

    let result: (string | { text: string; type: string; severity: string })[] = [];
    let lastIndex = 0;

    sortedFallacies.forEach((fallacy) => {
      const start = fallacy.start_index ?? text.indexOf(fallacy.text_span);
      const end = fallacy.end_index ?? start + fallacy.text_span.length;

      if (start >= lastIndex && start < text.length) {
        // Add text before fallacy
        if (start > lastIndex) {
          result.push(text.substring(lastIndex, start));
        }

        // Add highlighted fallacy text
        result.push({
          text: text.substring(start, Math.min(end, text.length)),
          type: fallacy.type,
          severity: fallacy.severity,
        });

        lastIndex = Math.max(lastIndex, end);
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result.length > 0 ? result : text;
  }, [text, fallacies]);

  const getSeverityClass = (severity: string) => {
    return `highlight-${severity}`;
  };

  return (
    <div className="visual-feedback">
      <div className="feedback-header">
        <h3>Live Feedback</h3>
        <div className="feedback-stats">
          <span className={`stat-badge ${stats.total > 0 ? 'has-fallacies' : 'no-fallacies'}`}>
            {stats.total} {stats.total === 1 ? 'Fallacy' : 'Fallacies'}
          </span>
        </div>
      </div>
      <div className="highlighted-text">
        {Array.isArray(highlightedText) ? (
          highlightedText.map((part, index) => {
            if (typeof part === 'string') {
              return <span key={index}>{part}</span>;
            } else {
              return (
                <span
                  key={index}
                  className={`highlight ${getSeverityClass(part.severity)}`}
                  title={`${part.type} (${part.severity} severity)`}
                >
                  {part.text}
                </span>
              );
            }
          })
        ) : (
          <span>{highlightedText}</span>
        )}
      </div>
      {stats.total > 0 && (
        <div className="severity-breakdown">
          <div className="severity-item high">
            <span className="severity-label">High:</span>
            <span className="severity-count">{stats.bySeverity.high}</span>
          </div>
          <div className="severity-item medium">
            <span className="severity-label">Medium:</span>
            <span className="severity-count">{stats.bySeverity.medium}</span>
          </div>
          <div className="severity-item low">
            <span className="severity-label">Low:</span>
            <span className="severity-count">{stats.bySeverity.low}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualFeedback;

