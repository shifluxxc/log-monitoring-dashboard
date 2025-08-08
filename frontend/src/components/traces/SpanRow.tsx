// src/components/traces/SpanRow.tsx
import { memo, useCallback } from 'react';
import { SpanNode } from '../../types/trace';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import color from 'string-to-color';

interface SpanRowProps {
  span: SpanNode;
  traceStartTime: number;
  totalDuration: number;
  onSelectSpan: (id: string) => void;
  selectedSpanId: string | null;
  depth?: number;
}

export const SpanRow = memo(({
  span,
  traceStartTime,
  totalDuration,
  onSelectSpan,
  selectedSpanId,
  depth = 0
}: SpanRowProps) => {
  const offsetPercent = ((span.startTime - traceStartTime) / totalDuration) * 100;
  const widthPercent = Math.max((span.duration / totalDuration) * 100, 0.5); // min width for visibility
  const serviceColor = color(span.serviceName);
  const isSelected = selectedSpanId === span.id;
  const hasError = span.tags?.error;

  const handleClick = useCallback(() => {
    onSelectSpan(span.id);
  }, [span.id, onSelectSpan]);

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer rounded-sm hover:bg-muted/50 transition-colors",
          isSelected && "bg-muted ring-2 ring-primary/50"
        )}
        onClick={handleClick}
      >
        {/* Service and Operation Name */}
        <div className="w-80 pr-4 flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Badge 
              variant="outline" 
              className="text-xs whitespace-nowrap"
              style={{ 
                borderColor: serviceColor,
                color: serviceColor,
                backgroundColor: `${serviceColor}10`
              }}
            >
              {span.serviceName}
            </Badge>
            <span className="truncate text-sm font-medium">
              {span.name}
            </span>
            {hasError && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="flex-1 min-w-0">
          <div className="relative w-full h-6 bg-muted/30 rounded-sm">
            <div
              className={cn(
                "absolute h-full rounded-sm transition-opacity hover:opacity-80",
                hasError && "bg-destructive"
              )}
              style={{
                left: `${offsetPercent}%`,
                width: `${widthPercent}%`,
                backgroundColor: hasError ? undefined : serviceColor,
              }}
              title={`${span.duration.toFixed(2)}ms`}
            />
            
            {/* Duration Label */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 text-xs font-mono text-foreground/80 px-1"
              style={{ 
                left: `${Math.min(offsetPercent + widthPercent + 0.5, 85)}%`,
              }}
            >
              {span.duration.toFixed(1)}ms
            </div>
          </div>
        </div>
      </div>

      {/* Render Children */}
      {span.children.map(child => (
        <SpanRow
          key={child.id}
          span={child}
          traceStartTime={traceStartTime}
          totalDuration={totalDuration}
          onSelectSpan={onSelectSpan}
          selectedSpanId={selectedSpanId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
});

SpanRow.displayName = 'SpanRow';