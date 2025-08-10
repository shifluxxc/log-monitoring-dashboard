import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLog } from '@/context/LogContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Log } from '@/types';
import { useAuth } from '@/context/AuthContext';

const getLogLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'warn':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'info':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'debug':
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    default:
      return 'text-white bg-gray-500/10 border-gray-500/20';
  }
};

const getLogLevelIcon = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return '❌';
    case 'warn':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'debug':
      return '🔍';
    default:
      return '📝';
  }
};

export const LogStream: React.FC = () => {
  const { state: authState } = useAuth();
  const { dispatch } = useLog();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleNewLog = useCallback((newLog: Log) => {
    // Only add logs for the current user
    if (authState.user?.id === newLog.user_id) {
      dispatch({ type: 'ADD_LOG', payload: newLog });
      
      // Auto-scroll to bottom if enabled
      if (autoScroll && scrollAreaRef.current) {
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      }
    }
  }, [authState.user?.id, dispatch, autoScroll]);

  const onConnect = useCallback(() => {
    toast({
      title: 'Connected',
      description: 'Real-time log streaming is active',
    });
  }, [toast]);

  const onDisconnect = useCallback(() => {
    toast({
      title: 'Disconnected',
      description: 'Attempting to reconnect...',
      variant: 'destructive',
    });
  }, [toast]);

  const onError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    setWsError(error.message || 'Failed to connect to log stream');
    toast({
      title: 'Connection Error',
      description: 'Failed to connect to log stream',
      variant: 'destructive',
    });
  }, [toast]);

  const { isConnected: wsConnected } = useWebSocket({
    onMessage: handleNewLog,
    onConnect,
    onDisconnect,
    onError,
  });

  // Fetch initial logs
  useEffect(() => {
    const fetchInitialLogs = async () => {
      if (!authState.token) {
        setError('Not authenticated to fetch logs.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const initialLogs = await apiService.getLogs(100); // Fetch last 100 logs
        dispatch({ type: 'SET_LOGS', payload: initialLogs });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch initial logs:', err);
        setError('Failed to load historical logs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialLogs();
  }, [authState.token, dispatch]);

  const { filteredLogs } = useLog().state;

  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Log Stream</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={wsConnected ? "default" : "destructive"}
              className="text-xs"
            >
              {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs px-2 py-1 rounded ${
                autoScroll 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {wsConnected 
            ? 'Real-time log streaming is active' 
            : wsError || 'Connecting to log stream...'
          }
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No logs received yet</p>
                  <p className="text-sm text-muted-foreground">
                    Send some logs using your API key to see them here!
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div 
                    key={`${log.timestamp}-${index}`} 
                    className="font-mono text-sm p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLogLevelColor(log.level)}`}
                        >
                          {getLogLevelIcon(log.level)} {log.level.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-foreground break-words">
                      {log.message}
                    </div>
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <details>
                          <summary className="cursor-pointer hover:text-foreground">
                            Metadata ({Object.keys(log.metadata).length} items)
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
