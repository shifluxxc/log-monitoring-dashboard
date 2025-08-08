// src/types/trace.ts
export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number; // Unix timestamp in milliseconds
  endTime: number;
  duration: number;  // in milliseconds
  serviceName: string; // e.g., 'api-gateway', 'user-service'
  tags?: { [key: string]: string | number | boolean };
}

// This is a processed span node for building the tree structure
export interface SpanNode extends Span {
  children: SpanNode[];
}

export interface Trace {
  traceId: string;
  spans: Span[];
  rootSpanName: string;
  totalDuration: number;
  timestamp: number;
}

export interface TraceState {
  traces: Trace[];
  selectedTrace: Trace | null;
  isLoading: boolean;
  error: string | null;
}

export type TraceAction = 
  | { type: 'FETCH_TRACES_START' }
  | { type: 'FETCH_TRACES_SUCCESS'; payload: Trace[] }
  | { type: 'FETCH_TRACES_ERROR'; payload: string }
  | { type: 'FETCH_TRACE_START' }
  | { type: 'FETCH_TRACE_SUCCESS'; payload: Trace }
  | { type: 'FETCH_TRACE_ERROR'; payload: string }
  | { type: 'CLEAR_SELECTED_TRACE' };