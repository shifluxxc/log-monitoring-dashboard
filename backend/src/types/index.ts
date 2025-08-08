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
  start_time_unix_nano: number;
  duration_nano: number;
  span_count: number;
  created_at: Date;
}

export interface CreateTraceRequest {
  root_span_name: string;
  start_time_unix_nano: number;
  duration_nano: number;
  span_count: number;
}

export interface Span {
  span_id: string;
  trace_id: string;
  parent_span_id?: string;
  name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  attributes?: Record<string, any>;
}

export interface CreateSpanRequest {
  trace_id: string;
  parent_span_id?: string;
  name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  attributes?: Record<string, any>;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
} 