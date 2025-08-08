import { pool } from '../config/database.js';
import { Log, CreateLogRequest } from '../types/index.js';

export class LogModel {
  static async create(userId: string, logData: CreateLogRequest): Promise<Log> {
    const { level, message, metadata } = logData;
    
    const query = `
      INSERT INTO logs (timestamp, user_id, level, message, metadata)
      VALUES (NOW(), $1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, level, message, metadata]);
    return result.rows[0];
  }
  
  static async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<Log[]> {
    const query = `
      SELECT * FROM logs 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
  
  static async findByUserIdAndLevel(userId: string, level: string, limit: number = 100, offset: number = 0): Promise<Log[]> {
    const query = `
      SELECT * FROM logs 
      WHERE user_id = $1 AND level = $2
      ORDER BY timestamp DESC 
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [userId, level, limit, offset]);
    return result.rows;
  }
  
  static async findByUserIdAndTimeRange(
    userId: string, 
    startTime: Date, 
    endTime: Date, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<Log[]> {
    const query = `
      SELECT * FROM logs 
      WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp DESC 
      LIMIT $4 OFFSET $5
    `;
    
    const result = await pool.query(query, [userId, startTime, endTime, limit, offset]);
    return result.rows;
  }
  
  static async getLogLevelsCount(userId: string): Promise<{ level: string; count: number }[]> {
    const query = `
      SELECT level, COUNT(*) as count 
      FROM logs 
      WHERE user_id = $1 
      GROUP BY level 
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
  
  static async getLogsPerMinute(userId: string, minutes: number = 60): Promise<{ time_bucket: string; count: number }[]> {
    const query = `
      SELECT time_bucket('1 minute', timestamp) as time_bucket, COUNT(*) as count
      FROM logs 
      WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${minutes} minutes'
      GROUP BY time_bucket 
      ORDER BY time_bucket DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
  
  static async deleteByUserId(userId: string): Promise<number> {
    const query = 'DELETE FROM logs WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }
} 