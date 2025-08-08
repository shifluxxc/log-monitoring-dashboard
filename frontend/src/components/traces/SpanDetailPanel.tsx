// src/components/traces/SpanDetailPanel.tsx
import { Span } from '../../types/trace';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Clock, Activity, Tag } from 'lucide-react';
import color from 'string-to-color';

interface SpanDetailPanelProps {
  span: Span;
  onClose: () => void;
}

export const SpanDetailPanel = ({ span, onClose }: SpanDetailPanelProps) => {
  const serviceColor = color(span.serviceName);
  const hasError = span.tags?.error;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Span Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Operation</div>
            <div className="font-medium">{span.name}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Service</div>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: serviceColor,
                color: serviceColor,
                backgroundColor: `${serviceColor}10`
              }}
            >
              {span.serviceName}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Duration</div>
              <div className="flex items-center gap-1 font-mono text-sm">
                <Clock className="h-3 w-3" />
                {span.duration.toFixed(2)}ms
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Span ID</div>
              <div className="font-mono text-xs">{span.id.substring(0, 12)}...</div>
            </div>
          </div>

          {hasError && (
            <div>
              <Badge variant="destructive" className="mb-2">
                Error Detected
              </Badge>
              {span.tags?.['error.message'] && (
                <div className="text-sm text-destructive">
                  {span.tags['error.message']}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timing Info */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Activity className="h-4 w-4" />
            Timing
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-mono">{new Date(span.startTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Time:</span>
              <span className="font-mono">{new Date(span.endTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {span.tags && Object.keys(span.tags).length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Tag className="h-4 w-4" />
              Tags
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <pre className="text-xs text-foreground/90 whitespace-pre-wrap break-all">
                {JSON.stringify(span.tags, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-3 border-t">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>Trace ID: {span.traceId}</div>
            {span.parentId && <div>Parent ID: {span.parentId}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};