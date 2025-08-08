import { pool } from '../config/database.js';
import { User, CreateUserRequest, UserResponse } from '../types/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserModel {
  static async create(userData: CreateUserRequest): Promise<UserResponse> {
    const { email, password } = userData;
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO users (email, password_hash, api_key)
      VALUES ($1, $2, $3)
      RETURNING id, email, api_key, created_at
    `;
    
    const result = await pool.query(query, [email, passwordHash, apiKey]);
    return result.rows[0];
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }
  
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  static async findByApiKey(apiKey: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE api_key = $1';
    const result = await pool.query(query, [apiKey]);
    return result.rows[0] || null;
  }
  
  static async updateApiKey(userId: string): Promise<string> {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const query = 'UPDATE users SET api_key = $1 WHERE id = $2 RETURNING api_key';
    const result = await pool.query(query, [apiKey, userId]);
    return result.rows[0].api_key;
  }
  
  static async delete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }
} 