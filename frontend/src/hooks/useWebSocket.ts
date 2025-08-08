import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Log } from '@/types';

interface UseWebSocketOptions {
  url: string;
  onMessage: (data: Log) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useWebSocket = ({ 
  url, 
  onMessage, 
  onConnect, 
  onDisconnect, 
  onError 
}: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io(url, {
        transports: ['websocket'],
        autoConnect: true,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        onConnect?.();
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      });

      socketRef.current.on('log', (data: Log) => {
        onMessage(data);
      });

      socketRef.current.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        onError?.(new Error(error.message || 'WebSocket error'));
      });

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      onError?.(error as Error);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    isConnected: socketRef.current?.connected || false,
  };
};