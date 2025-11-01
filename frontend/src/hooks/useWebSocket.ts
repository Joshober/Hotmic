import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { FallacyDetection } from '../types';

// Determine backend URL based on environment
// If accessed via ngrok frontend URL, use backend ngrok URL
// Otherwise use localhost or env variable
const getBackendUrl = () => {
  // Check if frontend is accessed via ngrok
  if (window.location.hostname.includes('ngrok-free.dev') || window.location.hostname.includes('ngrok.io')) {
    // Frontend is on ngrok, use backend ngrok URL
    return process.env.REACT_APP_WS_URL || 'https://speak.ngrok.app';
  }
  // Frontend is on localhost, use env var or localhost
  return process.env.REACT_APP_WS_URL || 'http://localhost:8000';
};

const WS_URL = getBackendUrl();

export const useWebSocket = (
  onMessage: (data: FallacyDetection) => void,
  onError?: (error: Event) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      const socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        setIsConnected(false);
      });

      socket.on('fallacy_detection', (data: FallacyDetection) => {
        if (data.type === 'fallacy_detection') {
          onMessage(data);
        }
      });

      socket.on('pong', () => {
        // Keep-alive response
      });

      socket.on('error', (error: any) => {
        console.error('Socket.IO error:', error);
        if (onError) {
          onError(error as Event);
        }
      });

      socket.on('connect_error', (error: Error) => {
        console.error('Socket.IO connection error:', error);
        if (onError) {
          onError(error as any);
        }
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Error creating Socket.IO connection:', error);
    }
  }, [onMessage, onError]);

  const sendMessage = useCallback((text: string, speaker?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', {
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
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;
    
    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message', { type: 'ping' });
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return { isConnected, sendMessage, disconnect };
};
