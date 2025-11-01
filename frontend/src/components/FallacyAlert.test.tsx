import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FallacyAlert from './FallacyAlert';
import { Fallacy } from '../types';

describe('FallacyAlert', () => {
  const mockFallacy: Fallacy = {
    type: 'ad_hominem',
    name: 'Ad Hominem Attack',
    severity: 'high',
    confidence: 0.95,
    explanation: 'Attacking the person instead of their argument',
    text_span: "You're an idiot",
    start_index: 0,
    end_index: 15,
  };

  it('renders fallacy alert with correct information', () => {
    render(<FallacyAlert fallacy={mockFallacy} />);
    
    expect(screen.getByText('Ad Hominem Attack')).toBeInTheDocument();
    expect(screen.getByText(/Attacking the person/)).toBeInTheDocument();
    expect(screen.getByText(/"You're an idiot"/)).toBeInTheDocument();
    expect(screen.getByText(/95.0%/)).toBeInTheDocument();
  });

  it('displays correct severity badge', () => {
    render(<FallacyAlert fallacy={mockFallacy} />);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const mockOnDismiss = jest.fn();
    render(<FallacyAlert fallacy={mockFallacy} onDismiss={mockOnDismiss} />);
    
    const dismissButton = screen.getByText('×');
    fireEvent.click(dismissButton);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    render(<FallacyAlert fallacy={mockFallacy} />);
    
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('displays correct severity icon for high severity', () => {
    render(<FallacyAlert fallacy={mockFallacy} />);
    
    // Should have red icon for high severity
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('displays correct severity icon for medium severity', () => {
    const mediumFallacy: Fallacy = {
      ...mockFallacy,
      severity: 'medium',
    };
    
    render(<FallacyAlert fallacy={mediumFallacy} />);
    
    expect(screen.getByText('🟠')).toBeInTheDocument();
  });

  it('displays correct severity icon for low severity', () => {
    const lowFallacy: Fallacy = {
      ...mockFallacy,
      severity: 'low',
    };
    
    render(<FallacyAlert fallacy={lowFallacy} />);
    
    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('formats fallacy type correctly', () => {
    render(<FallacyAlert fallacy={mockFallacy} />);
    
    // Type should be formatted (replace underscores with spaces)
    expect(screen.getByText(/Type: ad hominem/i)).toBeInTheDocument();
  });
});

