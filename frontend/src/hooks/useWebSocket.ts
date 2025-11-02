import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { FallacyDetection } from '../types';

// Socket.IO connects to base URL (will append /socket.io/ automatically)
// REST API calls should use /api prefix
const getBackendUrl = () => {
  // Always check environment variable first (allows override for testing)
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  // Default to localhost for local development
  // For production/ngrok, set REACT_APP_WS_URL environment variable
  return 'http://localhost:8000';
};

const WS_URL = getBackendUrl();

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let globalListeners: Map<string, Set<(data: any) => void>> = new Map();

const getOrCreateSocket = (): Socket => {
  if (globalSocket?.connected) {
    return globalSocket;
  }

  if (globalSocket) {
    globalSocket.disconnect();
  }

  const socket = io(WS_URL, {
    transports: ['polling', 'websocket'],  // Try polling first for ngrok compatibility
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: false,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('fallacy_detection', (data: FallacyDetection) => {
    const listeners = globalListeners.get('fallacy_detection') || new Set();
    listeners.forEach(listener => listener(data));
  });

  socket.on('pong', () => {
    // Keep-alive response
  });

  socket.on('error', (error: any) => {
    console.error('Socket.IO error:', error);
    const listeners = globalListeners.get('error') || new Set();
    listeners.forEach(listener => listener(error));
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Socket.IO connection error:', error);
    const listeners = globalListeners.get('error') || new Set();
    listeners.forEach(listener => listener(error));
  });

  globalSocket = socket;
  return socket;
};

export const useWebSocket = (
  onMessage: (data: FallacyDetection) => void,
  onError?: (error: Event) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onMessage, onError]);

  useEffect(() => {
    const socket = getOrCreateSocket();

    // Add listeners to global map
    const messageHandler = (data: FallacyDetection) => {
      if (data.type === 'fallacy_detection') {
        onMessageRef.current(data);
      }
    };
    const errorHandler = (error: Event) => {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    };

    if (!globalListeners.has('fallacy_detection')) {
      globalListeners.set('fallacy_detection', new Set());
    }
    if (!globalListeners.has('error')) {
      globalListeners.set('error', new Set());
    }

    globalListeners.get('fallacy_detection')!.add(messageHandler);
    globalListeners.get('error')!.add(errorHandler);

    // Update connection status
    const updateConnection = () => setIsConnected(socket.connected);
    socket.on('connect', updateConnection);
    socket.on('disconnect', updateConnection);
    updateConnection(); // Set initial state

    // Cleanup: remove listeners when component unmounts
    return () => {
      socket.off('connect', updateConnection);
      socket.off('disconnect', updateConnection);
      globalListeners.get('fallacy_detection')?.delete(messageHandler);
      globalListeners.get('error')?.delete(errorHandler);
      
      // Only disconnect if no listeners remain
      const hasListeners = Array.from(globalListeners.values()).some(listeners => listeners.size > 0);
      if (!hasListeners && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, []); // Empty deps - only run once per component mount

  const sendMessage = useCallback((text: string, speaker?: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('message', {
        type: 'text',
        text: text,
        speaker: speaker || undefined,
        timestamp: Date.now()
      });
    } else {
      console.warn('Socket.IO not connected');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
    setIsConnected(false);
  }, []);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected || !globalSocket?.connected) return;
    
    const pingInterval = setInterval(() => {
      if (globalSocket?.connected) {
        globalSocket.emit('message', { type: 'ping' });
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return { isConnected, sendMessage, disconnect };
};
