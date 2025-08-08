// src/pages/traces/TraceDetailPage.tsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTraces } from '../../context/TraceContext';
import { TraceSummary } from '../../components/traces/TraceSummary';
import { WaterfallChart } from '../../components/traces/WaterfallChart';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export const TraceDetailPage = () => {
  const { traceId } = useParams<{ traceId: string }>();
  const { state, dispatch } = useTraces();

  useEffect(() => {
    if (!traceId) return;

    const fetchTrace = async () => {
      dispatch({ type: 'FETCH_TRACE_START' });
      try {
        // For development, generate a mock trace with the specific traceId
        const mockTrace = generateMockTraceDetail(traceId);
        dispatch({ type: 'FETCH_TRACE_SUCCESS', payload: mockTrace });
      } catch (error) {
        dispatch({ type: 'FETCH_TRACE_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch trace' });
      }
    };

    fetchTrace();
  }, [traceId, dispatch]);

  if (state.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
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
            <Link to="/traces" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Traces
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state.selectedTrace) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Trace not found</p>
            <Link to="/traces" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Traces
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link to="/traces">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Traces
          </Button>
        </Link>
      </div>
      
      <TraceSummary trace={state.selectedTrace} />
      <WaterfallChart trace={state.selectedTrace} />
    </div>
  );
};

// Mock trace detail generator
function generateMockTraceDetail(traceId: string) {
  const services = ['api-gateway', 'user-service', 'auth-service', 'payment-service', 'notification-service'];
  const operations = [
    'HTTP GET /api/users',
    'Database Query',
    'Redis Cache Lookup',
    'JWT Validation',
    'Payment Processing',
    'Email Notification',
    'Audit Log Write'
  ];
  
  const timestamp = Date.now() - Math.random() * 3600000;
  const spans = [];
  
  // Create root span
  spans.push({
    id: `span-${traceId}-0`,
    traceId,
    name: 'HTTP GET /api/users',
    startTime: timestamp,
    endTime: timestamp + 500,
    duration: 500,
    serviceName: 'api-gateway',
    tags: {
      'http.method': 'GET',
      'http.url': '/api/users',
      'http.status_code': 200,
      'user.id': 123,
    },
  });

  // Create child spans
  for (let i = 1; i < 8; i++) {
    const parentIndex = Math.floor(i / 2);
    const startOffset = i * 30 + Math.random() * 20;
    const duration = 20 + Math.random() * 100;
    
    spans.push({
      id: `span-${traceId}-${i}`,
      traceId,
      parentId: `span-${traceId}-${parentIndex}`,
      name: operations[i % operations.length],
      startTime: timestamp + startOffset,
      endTime: timestamp + startOffset + duration,
      duration,
      serviceName: services[i % services.length],
      tags: {
        'component': 'http',
        'span.kind': 'server',
        'peer.service': services[(i + 1) % services.length],
        ...(i % 3 === 0 && { 'error': true, 'error.message': 'Timeout occurred' }),
      },
    });
  }

  const totalDuration = Math.max(...spans.map(s => s.endTime)) - Math.min(...spans.map(s => s.startTime));
  
  return {
    traceId,
    spans,
    rootSpanName: spans[0].name,
    totalDuration,
    timestamp,
  };
}