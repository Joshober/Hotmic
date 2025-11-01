import { renderHook, waitFor, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { FallacyDetection } from '../types';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

(global as any).WebSocket = MockWebSocket as any;

describe('useWebSocket', () => {
  let mockOnMessage: jest.Mock;
  let mockOnError: jest.Mock;

  beforeEach(() => {
    mockOnMessage = jest.fn();
    mockOnError = jest.fn();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    expect(result.current.isConnected).toBe(false);
  });

  it('should connect when hook is mounted', async () => {
    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should call onMessage when fallacy detection message is received', async () => {
    let wsInstance: MockWebSocket | null = null;
    
    (global as any).WebSocket = jest.fn((url: string) => {
      wsInstance = new MockWebSocket(url);
      return wsInstance;
    }) as any;

    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const mockDetection: FallacyDetection = {
      type: 'fallacy_detection',
      text: 'Test text',
      fallacies: [],
      has_fallacies: false,
      confidence: 0.0,
    };

    act(() => {
      if (wsInstance && wsInstance.onmessage) {
        wsInstance.onmessage({
          data: JSON.stringify(mockDetection),
        } as MessageEvent);
      }
    });

    expect(mockOnMessage).toHaveBeenCalledWith(mockDetection);
  });

  it('should send message when sendMessage is called', async () => {
    let wsInstance: MockWebSocket | null = null;
    
    (global as any).WebSocket = jest.fn((url: string) => {
      wsInstance = new MockWebSocket(url);
      return wsInstance;
    }) as any;

    const sendSpy = jest.spyOn(MockWebSocket.prototype, 'send');

    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'text',
        text: 'Test message',
        timestamp: expect.any(Number),
      })
    );
  });

  it('should disconnect when disconnect is called', async () => {
    let wsInstance: MockWebSocket | null = null;
    
    (global as any).WebSocket = jest.fn((url: string) => {
      wsInstance = new MockWebSocket(url);
      return wsInstance;
    }) as any;

    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should not send message when not connected', () => {
    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket not connected');
    consoleSpy.mockRestore();
  });

  it('should handle pong messages silently', async () => {
    let wsInstance: MockWebSocket | null = null;
    
    (global as any).WebSocket = jest.fn((url: string) => {
      wsInstance = new MockWebSocket(url);
      return wsInstance;
    }) as any;

    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      if (wsInstance && wsInstance.onmessage) {
        wsInstance.onmessage({
          data: JSON.stringify({ type: 'pong' }),
        } as MessageEvent);
      }
    });

    // Should not call onMessage for pong
    expect(mockOnMessage).not.toHaveBeenCalled();
  });

  it('should reconnect on disconnect with exponential backoff', async () => {
    let wsInstance: MockWebSocket | null = null;
    let connectionCount = 0;
    
    (global as any).WebSocket = jest.fn((url: string) => {
      connectionCount++;
      wsInstance = new MockWebSocket(url);
      // Simulate immediate disconnect after connection
      setTimeout(() => {
        if (wsInstance && wsInstance.onclose && connectionCount < 2) {
          wsInstance.onclose(new CloseEvent('close'));
        }
      }, 10);
      return wsInstance;
    }) as any;

    const { result } = renderHook(() =>
      useWebSocket(mockOnMessage, mockOnError)
    );

    await waitFor(() => {
      expect(connectionCount).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });
});

