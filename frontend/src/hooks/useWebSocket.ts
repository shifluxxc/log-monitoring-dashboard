import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Log } from '@/types';

interface UseWebSocketOptions {
  onMessage: (data: Log) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useWebSocket = ({ 
  onMessage, 
  onConnect, 
  onDisconnect, 
  onError 
}: UseWebSocketOptions) => {
  const { state } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    // Check if we've exceeded max reconnection attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, stopping reconnection');
      onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    if (!state.token) {
      console.log('No authentication token available for WebSocket connection');
      onError?.(new Error('No authentication token available'));
      return;
    }

    try {
      console.log('🔌 Attempting WebSocket connection...');
      const wsUrl = `ws://localhost:7000/ws/logs?token=${state.token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'log:new':
              onMessage(message.data);
              break;
            case 'message':
              onMessage(message.data);
              break;
            case 'auth:success':
              console.log('✅ WebSocket authenticated successfully');
              break;
            case 'connection:status':
              console.log('📡 WebSocket connection status:', message.message);
              break;
            case 'pong':
              console.log('🏓 WebSocket ping-pong');
              break;
            case 'error':
              console.error('❌ WebSocket server error:', message.message);
              onError?.(new Error(message.message || 'WebSocket server error'));
              break;
            default:
              console.log('📨 Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        onDisconnect?.();
        
        // Only attempt reconnection for certain close codes
        if (event.code !== 1000 && event.code !== 1001) { // Normal closure and going away
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 3000);
          } else {
            console.log('❌ Max reconnection attempts reached');
            onError?.(new Error('Failed to reconnect after multiple attempts'));
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        // Don't call onError here as onclose will handle reconnection
      };

    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      onError?.(error as Error);
    }
  }, [state.token, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Reset reconnection attempts
    reconnectAttemptsRef.current = 0;
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect'); // Normal closure
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    // Only connect if we have a token
    if (state.token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [state.token, connect, disconnect]);

  return {
    ws: wsRef.current,
    connect,
    disconnect,
    sendMessage,
    isConnected,
  };
};
