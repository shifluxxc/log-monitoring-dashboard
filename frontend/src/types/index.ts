// Core type definitions for the log monitoring dashboard

export interface Log {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  api_key: string;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LogFilters {
  level: string[];
  searchTerm: string;
}

export interface LogState {
  logs: Log[];
  filteredLogs: Log[];
  filters: LogFilters;
}

export type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

export type LogAction = 
  | { type: 'ADD_LOG'; payload: Log }
  | { type: 'SET_FILTER'; payload: Partial<LogFilters> };

export interface ChartData {
  timestamp: string;
  count: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}