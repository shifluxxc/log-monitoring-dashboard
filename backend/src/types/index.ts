export interface User {
  id: string;
  email: string;
  password_hash: string;
  api_key: string;
  created_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  api_key: string;
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}

export interface Log {
  timestamp: Date;
  user_id: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface CreateLogRequest {
  level: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Trace {
  trace_id: string;
  user_id: string;
  root_span_name: string;
  start_time_unix_nano: string;
  duration_nano: string;
  span_count: number;
  created_at: Date;
}

export interface Span {
  span_id: string;
  trace_id: string;
  parent_span_id?: string;
  name: string;
  start_time_unix_nano: string;
  end_time_unix_nano: string;
  attributes?: Record<string, any>;
  serviceName?: string;
}

export interface TracePayload {
  traceId: string;
  spans: SpanPayload[];
}

export interface SpanPayload {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  serviceName: string;
  tags?: Record<string, any>;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
