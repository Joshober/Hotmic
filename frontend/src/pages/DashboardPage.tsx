import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { FallacyStats } from '../types';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  
  // Get stats from location state if available (from AnalysisPage)
  const statsFromState = (location.state as { stats?: FallacyStats })?.stats;
  
  // For now, we'll create empty stats or load from localStorage
  const [stats] = useState<FallacyStats>(() => {
    if (statsFromState) {
      return statsFromState;
    }
    
    // Try to load from localStorage
    const savedStats = localStorage.getItem('fallacyStats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        console.error('Error parsing saved stats:', e);
      }
    }
    
    // Return empty stats
    return {
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
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Fallacy Detection Dashboard</h1>
        <p className="dashboard-subtitle">
          Comprehensive analytics and insights from your fallacy detection sessions
        </p>
      </div>
      
      <Dashboard stats={stats} />
    </div>
  );
};

export default DashboardPage;
