import React, { useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { LogStream } from '@/components/LogStream';
import { ApiKeyDisplay } from '@/components/ApiKeyDisplay';
import { useLog } from '@/context/LogContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Log } from '@/types';

export const Dashboard: React.FC = () => {
  const { dispatch } = useLog();
  const { toast } = useToast();

  const handleNewLog = useCallback((log: Log) => {
    dispatch({ type: 'ADD_LOG', payload: log });
  }, [dispatch]);

  const handleWebSocketConnect = useCallback(() => {
    toast({
      title: 'Connected',
      description: 'Real-time log streaming is active',
    });
  }, [toast]);

  const handleWebSocketDisconnect = useCallback(() => {
    toast({
      title: 'Disconnected',
      description: 'Attempting to reconnect...',
      variant: 'destructive',
    });
  }, [toast]);

  const handleWebSocketError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    toast({
      title: 'Connection Error',
      description: 'Failed to connect to log stream',
      variant: 'destructive',
    });
  }, [toast]);

  // Use WebSocket for real-time logs (with fallback for demo)
  const { isConnected } = useWebSocket({
    url: process.env.NODE_ENV === 'production' 
      ? 'wss://api.example.com' 
      : 'ws://localhost:3001',
    onMessage: handleNewLog,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
    onError: handleWebSocketError,
  });

  // Generate demo logs if WebSocket is not connected (for development)
  useEffect(() => {
    if (!isConnected && process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const mockLogs = apiService.generateMockLogs(1);
        handleNewLog(mockLogs[0]);
      }, 2000);

      // Generate initial batch
      const initialLogs = apiService.generateMockLogs(25);
      initialLogs.forEach(log => handleNewLog(log));

      return () => clearInterval(interval);
    }
  }, [isConnected, handleNewLog]);

  return (
    <div className="h-screen flex flex-col bg-dashboard-bg">
      <Header />
      <FilterBar />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          <div className="lg:col-span-3">
            <LogStream />
          </div>
          <div className="lg:col-span-1">
            <ApiKeyDisplay />
          </div>
        </div>
      </div>
    </div>
  );
};