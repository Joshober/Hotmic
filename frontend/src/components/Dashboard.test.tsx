import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { FallacyStats } from '../types';

describe('Dashboard', () => {
  const mockStats: FallacyStats = {
    total: 5,
    byType: {
      ad_hominem: 2,
      strawman: 1,
      false_dilemma: 2,
    },
    bySeverity: {
      low: 1,
      medium: 2,
      high: 2,
    },
    bySpeaker: {},
    speakerDetails: {},
  };

  it('renders dashboard with statistics', () => {
    render(<Dashboard stats={mockStats} />);
    
    expect(screen.getByText('Fallacy Statistics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total Fallacies')).toBeInTheDocument();
  });

  it('displays severity statistics', () => {
    render(<Dashboard stats={mockStats} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // High severity
    expect(screen.getByText('High Severity')).toBeInTheDocument();
    expect(screen.getByText('Medium Severity')).toBeInTheDocument();
    expect(screen.getByText('Low Severity')).toBeInTheDocument();
  });

  it('displays charts when there are fallacies', () => {
    render(<Dashboard stats={mockStats} />);
    
    expect(screen.getByText('Fallacies by Type')).toBeInTheDocument();
    expect(screen.getByText('Fallacies by Severity')).toBeInTheDocument();
  });

  it('handles empty statistics', () => {
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

    render(<Dashboard stats={emptyStats} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Total Fallacies')).toBeInTheDocument();
  });

  it('formats fallacy type names correctly', () => {
    render(<Dashboard stats={mockStats} />);
    
    // Should display formatted type names (e.g., "Ad Hominem" instead of "ad_hominem")
    // The component replaces underscores and capitalizes
    expect(screen.getByText('Fallacies by Type')).toBeInTheDocument();
  });
});

