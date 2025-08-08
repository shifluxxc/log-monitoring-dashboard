import { pool } from '../config/database.js';
import { Trace, CreateTraceRequest } from '../types/index.js';

export class TraceModel {
  static async create(userId: string, traceData: CreateTraceRequest): Promise<Trace> {
    const { root_span_name, start_time_unix_nano, duration_nano, span_count } = traceData;
    
    const query = `
      INSERT INTO traces (user_id, root_span_name, start_time_unix_nano, duration_nano, span_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, root_span_name, start_time_unix_nano, duration_nano, span_count]);
    return result.rows[0];
  }
  
  static async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Trace[]> {
    const query = `
      SELECT * FROM traces 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
  
  static async findById(traceId: string): Promise<Trace | null> {
    const query = 'SELECT * FROM traces WHERE trace_id = $1';
    const result = await pool.query(query, [traceId]);
    return result.rows[0] || null;
  }
  
  static async findByUserIdAndTimeRange(
    userId: string, 
    startTime: Date, 
    endTime: Date, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<Trace[]> {
    const query = `
      SELECT * FROM traces 
      WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC 
      LIMIT $4 OFFSET $5
    `;
    
    const result = await pool.query(query, [userId, startTime, endTime, limit, offset]);
    return result.rows;
  }
  
  static async getTraceStats(userId: string): Promise<{
    total_traces: number;
    avg_duration: number;
    total_spans: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_traces,
        AVG(duration_nano) as avg_duration,
        SUM(span_count) as total_spans
      FROM traces 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  static async deleteByUserId(userId: string): Promise<number> {
    const query = 'DELETE FROM traces WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }
} 