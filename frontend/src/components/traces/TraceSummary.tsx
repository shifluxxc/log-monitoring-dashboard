// src/components/traces/TraceSummary.tsx
import { Trace } from '../../types/trace';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, Clock, Layers, Calendar } from 'lucide-react';

export const TraceSummary = ({ trace }: { trace: Trace }) => {
  const uniqueServices = [...new Set(trace.spans.map(span => span.serviceName))];
  const errorSpans = trace.spans.filter(span => span.tags?.error);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {trace.rootSpanName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Trace ID</div>
              <div className="font-mono text-sm">{trace.traceId}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
              <div className="font-semibold">{trace.totalDuration.toFixed(2)}ms</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Spans</div>
              <div className="font-semibold">{trace.spans.length}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Timestamp</div>
              <div className="text-sm">{new Date(trace.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Services:</span>
            {uniqueServices.map(service => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))}
          </div>
          
          {errorSpans.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Errors:</span>
              <Badge variant="destructive">
                {errorSpans.length} error{errorSpans.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};