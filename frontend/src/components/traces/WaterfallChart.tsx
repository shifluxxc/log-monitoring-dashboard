// src/components/traces/WaterfallChart.tsx
import { useMemo, useState } from 'react';
import { Trace, SpanNode, Span } from '../../types/trace';
import { SpanRow } from './SpanRow';
import { SpanDetailPanel } from './SpanDetailPanel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Utility function to build span tree
export const buildSpanTree = (spans: Span[]): SpanNode[] => {
  const spanMap = new Map<string, SpanNode>();
  const rootSpans: SpanNode[] = [];

  // Create nodes
  spans.forEach(span => {
    spanMap.set(span.id, { ...span, children: [] });
  });

  // Build tree structure
  spans.forEach(span => {
    const node = spanMap.get(span.id)!;
    if (span.parentId && spanMap.has(span.parentId)) {
      spanMap.get(span.parentId)!.children.push(node);
    } else {
      rootSpans.push(node);
    }
  });

  // Sort children by start time
  const sortChildren = (node: SpanNode) => {
    node.children.sort((a, b) => a.startTime - b.startTime);
    node.children.forEach(sortChildren);
  };

  rootSpans.forEach(sortChildren);
  return rootSpans.sort((a, b) => a.startTime - b.startTime);
};

export const WaterfallChart = ({ trace }: { trace: Trace }) => {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);

  const spanTree = useMemo(() => buildSpanTree(trace.spans), [trace.spans]);
  const selectedSpan = useMemo(
    () => trace.spans.find(s => s.id === selectedSpanId) || null,
    [selectedSpanId, trace.spans]
  );

  // Calculate timeline markers
  const timelineMarkers = useMemo(() => {
    const markers = [];
    const stepCount = 10;
    for (let i = 0; i <= stepCount; i++) {
      const percent = (i / stepCount) * 100;
      const timeMs = (trace.totalDuration * i) / stepCount;
      markers.push({ percent, timeMs });
    }
    return markers;
  }, [trace.totalDuration]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Request Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Timeline Chart */}
            <div className="flex-1">
              {/* Timeline Header */}
              <div className="relative h-8 bg-muted border-b mb-2">
                {timelineMarkers.map((marker, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex flex-col justify-between text-xs"
                    style={{ left: `${marker.percent}%` }}
                  >
                    <div className="border-l border-muted-foreground/30 h-2" />
                    <div className="text-muted-foreground text-center transform -translate-x-1/2">
                      {marker.timeMs.toFixed(0)}ms
                    </div>
                  </div>
                ))}
              </div>

              {/* Span Rows */}
              <div className="space-y-1">
                {spanTree.map(rootSpan => (
                  <SpanRow
                    key={rootSpan.id}
                    span={rootSpan}
                    traceStartTime={trace.timestamp}
                    totalDuration={trace.totalDuration}
                    onSelectSpan={setSelectedSpanId}
                    selectedSpanId={selectedSpanId}
                    depth={0}
                  />
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="w-80">
              <div className="sticky top-4">
                {selectedSpan ? (
                  <SpanDetailPanel 
                    span={selectedSpan} 
                    onClose={() => setSelectedSpanId(null)} 
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Select a span to see details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};