import { User, Log } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com' 
  : 'http://localhost:7000';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      user: response.user,
      token: response.accessToken,
    };
  }

  async signup(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      user: response.user,
      token: response.accessToken,
    };
  }

  // Logs
  async getLogs(limit: number = 100, offset: number = 0): Promise<Log[]> {
    return this.request(`/api/logs?limit=${limit}&offset=${offset}`);
  }

  // Metrics
  async getLogsOverTime(startDate: string, endDate: string) {
    return this.request(`/metrics/logs-over-time?start=${startDate}&end=${endDate}`);
  }

  async getLogLevelDistribution(startDate: string, endDate: string) {
    return this.request(`/metrics/log-levels?start=${startDate}&end=${endDate}`);
  }

  async getErrorsPerMinute() {
    return this.request('/metrics/errors-per-minute');
  }

  // Traces
  async getTraces() {
    return this.request('/traces');
  }

  async getTrace(traceId: string) {
    return this.request(`/traces/${traceId}`);
  }

  // Generate mock data for development
  generateMockLogs(count: number = 50) {
    const levels = ['INFO', 'WARN', 'ERROR'] as const;
    const messages = [
      'User authentication successful',
      'Database connection established',
      'Cache miss for user data',
      'API rate limit exceeded',
      'File upload completed',
      'Memory usage threshold reached',
      'SSL certificate expires soon',
      'Backup process failed',
      'New user registration',
      'Session timeout warning',
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      metadata: {
        userId: Math.floor(Math.random() * 1000),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: `/api/v1/${Math.random() > 0.5 ? 'users' : 'orders'}`,
      },
    }));
  }
}

export const apiService = new ApiService();
