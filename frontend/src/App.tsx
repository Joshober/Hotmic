import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import Navigation from './components/Navigation';
import AnalysisPage from './pages/AnalysisPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
    setIsConnected(false);
  }, []);

  const { isConnected: wsConnected } = useWebSocket(
    () => {}, // Empty handler since we're just checking connection
    handleWebSocketError
  );

  React.useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  return (
    <Router>
      <div className="App">
        <Navigation isConnected={isConnected} />
        <Routes>
          <Route path="/" element={<AnalysisPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
