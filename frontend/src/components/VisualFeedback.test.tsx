import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisualFeedback from './VisualFeedback';
import { Fallacy, FallacyStats } from '../types';

describe('VisualFeedback', () => {
  const mockFallacies: Fallacy[] = [
    {
      type: 'ad_hominem',
      name: 'Ad Hominem',
      severity: 'high',
      confidence: 0.9,
      explanation: 'Test',
      text_span: 'You are wrong',
      start_index: 0,
      end_index: 14,
    },
  ];

  const mockStats: FallacyStats = {
    total: 1,
    byType: { ad_hominem: 1 },
    bySeverity: {
      low: 0,
      medium: 0,
      high: 1,
    },
    bySpeaker: {},
    speakerDetails: {},
  };

  it('renders visual feedback component', () => {
    render(
      <VisualFeedback
        text="You are wrong about that"
        fallacies={mockFallacies}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText('Live Feedback')).toBeInTheDocument();
  });

  it('displays text with highlights', () => {
    render(
      <VisualFeedback
        text="You are wrong about that"
        fallacies={mockFallacies}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText(/You are wrong about that/)).toBeInTheDocument();
  });

  it('displays fallacy count', () => {
    render(
      <VisualFeedback
        text="You are wrong"
        fallacies={mockFallacies}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText('1 Fallacy')).toBeInTheDocument();
  });

  it('displays severity breakdown when fallacies exist', () => {
    render(
      <VisualFeedback
        text="You are wrong"
        fallacies={mockFallacies}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText(/High:/)).toBeInTheDocument();
    expect(screen.getByText(/Medium:/)).toBeInTheDocument();
    expect(screen.getByText(/Low:/)).toBeInTheDocument();
  });

  it('does not show severity breakdown when no fallacies', () => {
    const emptyStats: FallacyStats = {
      total: 0,
      byType: {},
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
      },
      bySpeaker: {},
      speakerDetails: {},
    };

    render(
      <VisualFeedback
        text="This is fine"
        fallacies={[]}
        stats={emptyStats}
      />
    );
    
    expect(screen.queryByText(/High:/)).not.toBeInTheDocument();
  });

  it('handles empty text', () => {
    render(
      <VisualFeedback
        text=""
        fallacies={[]}
        stats={{
          total: 0,
          byType: {},
          bySeverity: { low: 0, medium: 0, high: 0 },
          bySpeaker: {},
          speakerDetails: {},
        }}
      />
    );
    
    expect(screen.getByText('Live Feedback')).toBeInTheDocument();
  });

  it('sorts fallacies by start index', () => {
    const multipleFallacies: Fallacy[] = [
      {
        type: 'strawman',
        name: 'Strawman',
        severity: 'medium',
        confidence: 0.8,
        explanation: 'Test',
        text_span: 'middle',
        start_index: 10,
        end_index: 16,
      },
      {
        type: 'ad_hominem',
        name: 'Ad Hominem',
        severity: 'high',
        confidence: 0.9,
        explanation: 'Test',
        text_span: 'start',
        start_index: 0,
        end_index: 5,
      },
    ];

    render(
      <VisualFeedback
        text="start text middle text end"
        fallacies={multipleFallacies}
        stats={{
          total: 2,
          byType: {},
          bySeverity: { low: 0, medium: 1, high: 1 },
          bySpeaker: {},
          speakerDetails: {},
        }}
      />
    );
    
    expect(screen.getByText(/start text middle text end/)).toBeInTheDocument();
  });
});

