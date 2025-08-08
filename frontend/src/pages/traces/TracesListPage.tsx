// src/pages/traces/TracesListPage.tsx
import { useEffect } from 'react';
import { useTraces } from '../../context/TraceContext';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Activity, Clock, Layers } from 'lucide-react';

export const TracesListPage = () => {
  const { state, dispatch } = useTraces();

  useEffect(() => {
    const fetchTraces = async () => {
      dispatch({ type: 'FETCH_TRACES_START' });
      try {
        // Generate mock trace data for development
        const mockTraces = generateMockTraces(20);
        dispatch({ type: 'FETCH_TRACES_SUCCESS', payload: mockTraces });
      } catch (error) {
        dispatch({ type: 'FETCH_TRACES_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch traces' });
      }
    };

    fetchTraces();
  }, [dispatch]);

  if (state.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {state.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Distributed Traces</h1>
        <p className="text-muted-foreground">Monitor and analyze request flows across your services</p>
      </div>

      <div className="space-y-4">
        {state.traces.map(trace => (
          <Card key={trace.traceId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Link 
                    to={`/traces/${trace.traceId}`} 
                    className="text-lg font-semibold text-primary hover:underline block mb-2"
                  >
                    {trace.rootSpanName}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      <span>Trace ID: {trace.traceId.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{trace.totalDuration.toFixed(2)}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      <span>{trace.spans.length} spans</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {new Date(trace.timestamp).toLocaleString()}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {getUniqueServices(trace.spans).length} services
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Utility function to generate mock trace data
function generateMockTraces(count: number) {
  const services = ['api-gateway', 'user-service', 'auth-service', 'payment-service', 'notification-service'];
  const operations = ['GET /users', 'POST /login', 'GET /orders', 'POST /payment', 'PUT /profile'];
  
  return Array.from({ length: count }, (_, i) => {
    const traceId = `trace-${Date.now()}-${i}`;
    const timestamp = Date.now() - Math.random() * 3600000;
    const spanCount = 3 + Math.floor(Math.random() * 8);
    
    const spans = Array.from({ length: spanCount }, (_, j) => {
      const startTime = timestamp + j * 10 + Math.random() * 50;
      const duration = 10 + Math.random() * 200;
      
      return {
        id: `span-${traceId}-${j}`,
        traceId,
        parentId: j > 0 ? `span-${traceId}-${Math.floor(j / 2)}` : undefined,
        name: operations[Math.floor(Math.random() * operations.length)],
        startTime,
        endTime: startTime + duration,
        duration,
        serviceName: services[Math.floor(Math.random() * services.length)],
        tags: {
          'http.method': j % 2 === 0 ? 'GET' : 'POST',
          'http.status_code': 200,
          'user.id': Math.floor(Math.random() * 1000),
        },
      };
    });

    const totalDuration = Math.max(...spans.map(s => s.endTime)) - Math.min(...spans.map(s => s.startTime));
    
    return {
      traceId,
      spans,
      rootSpanName: spans[0]?.name || 'Unknown Operation',
      totalDuration,
      timestamp,
    };
  });
}

function getUniqueServices(spans: any[]) {
  return [...new Set(spans.map(span => span.serviceName))];
}