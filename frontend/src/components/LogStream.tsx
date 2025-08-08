import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { LogRow } from './LogRow';
import { useLog } from '@/context/LogContext';

export const LogStream: React.FC = () => {
  const { state } = useLog();
  const { filteredLogs } = state;

  // Create a ref for the parent element
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Create the virtualizer
  const virtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated height of each log row
    overscan: 10, // Render extra items for smoother scrolling
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Memoize empty state to prevent unnecessary re-renders
  const emptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-muted-foreground mb-2">No logs to display</div>
      <div className="text-sm text-muted-foreground">
        {state.logs.length === 0 
          ? 'Waiting for logs to arrive...' 
          : 'Try adjusting your filters'
        }
      </div>
    </div>
  ), [state.logs.length]);

  if (filteredLogs.length === 0) {
    return (
      <Card className="flex-1 bg-card border-border">
        {emptyState}
      </Card>
    );
  }

  return (
    <Card className="flex-1 bg-card border-border overflow-hidden">
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const log = filteredLogs[virtualItem.index];
            return (
              <LogRow
                key={log.id}
                log={log}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
};