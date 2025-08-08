import { pool } from '../config/database.js';
import { Span, CreateSpanRequest } from '../types/index.js';

export class SpanModel {
  static async create(spanData: CreateSpanRequest): Promise<Span> {
    const { trace_id, parent_span_id, name, start_time_unix_nano, end_time_unix_nano, attributes } = spanData;
    
    const query = `
      INSERT INTO spans (trace_id, parent_span_id, name, start_time_unix_nano, end_time_unix_nano, attributes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [trace_id, parent_span_id, name, start_time_unix_nano, end_time_unix_nano, attributes]);
    return result.rows[0];
  }
  
  static async findByTraceId(traceId: string): Promise<Span[]> {
    const query = `
      SELECT * FROM spans 
      WHERE trace_id = $1 
      ORDER BY start_time_unix_nano ASC
    `;
    
    const result = await pool.query(query, [traceId]);
    return result.rows;
  }
  
  static async findById(spanId: string): Promise<Span | null> {
    const query = 'SELECT * FROM spans WHERE span_id = $1';
    const result = await pool.query(query, [spanId]);
    return result.rows[0] || null;
  }
  
  static async findChildrenByParentId(parentSpanId: string): Promise<Span[]> {
    const query = `
      SELECT * FROM spans 
      WHERE parent_span_id = $1 
      ORDER BY start_time_unix_nano ASC
    `;
    
    const result = await pool.query(query, [parentSpanId]);
    return result.rows;
  }
  
  static async findRootSpansByTraceId(traceId: string): Promise<Span[]> {
    const query = `
      SELECT * FROM spans 
      WHERE trace_id = $1 AND parent_span_id IS NULL
      ORDER BY start_time_unix_nano ASC
    `;
    
    const result = await pool.query(query, [traceId]);
    return result.rows;
  }
  
  static async getSpanTree(traceId: string): Promise<{
    span: Span;
    children: Span[];
  }[]> {
    // Get all spans for the trace
    const allSpans = await this.findByTraceId(traceId);
    
    // Create a map for quick lookup
    const spanMap = new Map<string, Span>();
    allSpans.forEach(span => spanMap.set(span.span_id, span));
    
    // Build the tree structure
    const spanTree: { span: Span; children: Span[] }[] = [];
    
    allSpans.forEach(span => {
      if (!span.parent_span_id) {
        // This is a root span
        const children = allSpans.filter(s => s.parent_span_id === span.span_id);
        spanTree.push({ span, children });
      }
    });
    
    return spanTree;
  }
  
  static async deleteByTraceId(traceId: string): Promise<number> {
    const query = 'DELETE FROM spans WHERE trace_id = $1';
    const result = await pool.query(query, [traceId]);
    return result.rowCount;
  }
} 