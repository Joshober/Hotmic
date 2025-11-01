import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FallacyStats } from '../types';
import './Dashboard.css';

interface DashboardProps {
  stats: FallacyStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }));

  const severityData = [
    { name: 'High', value: stats.bySeverity.high, color: '#ef4444' },
    { name: 'Medium', value: stats.bySeverity.medium, color: '#f59e0b' },
    { name: 'Low', value: stats.bySeverity.low, color: '#eab308' },
  ];

  // Speaker leaderboard - sorted by total fallacies (most "shit" first)
  const speakerLeaderboard = useMemo(() => {
    return Object.entries(stats.bySpeaker)
      .map(([speaker, total]) => ({
        speaker,
        total,
        high: stats.speakerDetails[speaker]?.bySeverity.high || 0,
        medium: stats.speakerDetails[speaker]?.bySeverity.medium || 0,
        low: stats.speakerDetails[speaker]?.bySeverity.low || 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 speakers
  }, [stats.bySpeaker, stats.speakerDetails]);

  const speakerChartData = speakerLeaderboard.map((entry, index) => ({
    name: entry.speaker || 'Unknown',
    value: entry.total,
    rank: index + 1,
    high: entry.high,
    medium: entry.medium,
    low: entry.low,
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Fallacy Statistics Dashboard</h2>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Fallacies</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value">{stats.bySeverity.high}</div>
          <div className="stat-label">High Severity</div>
        </div>
        <div className="stat-card medium">
          <div className="stat-value">{stats.bySeverity.medium}</div>
          <div className="stat-label">Medium Severity</div>
        </div>
        <div className="stat-card low">
          <div className="stat-value">{stats.bySeverity.low}</div>
          <div className="stat-label">Low Severity</div>
        </div>
      </div>

      {/* Speaker Leaderboard - Most "Shit" Speaking */}
      {speakerLeaderboard.length > 0 && (
        <div className="speaker-leaderboard">
          <div className="leaderboard-header">
            <h3>🚨 Speaker Leaderboard - Most Fallacies Detected</h3>
            <span className="leaderboard-subtitle">Who's saying the most problematic stuff?</span>
          </div>
          <div className="leaderboard-container">
            {speakerLeaderboard.map((entry, index) => {
              const isTop = index === 0;
              const percentage = stats.total > 0 ? ((entry.total / stats.total) * 100).toFixed(1) : '0';
              return (
                <div key={entry.speaker} className={`leaderboard-item ${isTop ? 'top-speaker' : ''}`}>
                  <div className="leaderboard-rank">
                    {index === 0 && <span className="trophy">🏆</span>}
                    <span className="rank-number">#{index + 1}</span>
                  </div>
                  <div className="leaderboard-info">
                    <div className="speaker-name">{entry.speaker || 'Unknown'}</div>
                    <div className="speaker-stats">
                      <span className="total-count">{entry.total} fallacies</span>
                      <span className="percentage">({percentage}% of total)</span>
                    </div>
                    <div className="severity-breakdown">
                      {entry.high > 0 && (
                        <span className="severity-badge high" title="High severity">
                          🔴 {entry.high} High
                        </span>
                      )}
                      {entry.medium > 0 && (
                        <span className="severity-badge medium" title="Medium severity">
                          🟠 {entry.medium} Medium
                        </span>
                      )}
                      {entry.low > 0 && (
                        <span className="severity-badge low" title="Low severity">
                          🟡 {entry.low} Low
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="leaderboard-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: isTop ? '#ef4444' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="charts-grid">
        {speakerChartData.length > 0 && (
          <div className="chart-container">
            <h3>Fallacies by Speaker</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speakerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Severity" />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Severity" />
                <Bar dataKey="low" stackId="a" fill="#eab308" name="Low Severity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {typeData.length > 0 && (
          <div className="chart-container">
            <h3>Fallacies by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-container">
          <h3>Fallacies by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, value, percent } = props;
                  return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

