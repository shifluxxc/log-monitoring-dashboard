import { pool } from '../config/database.js';
// Assuming TracePayload and Span are defined in your types file
// This payload should come from your ingestion endpoint
import { Trace, Span, TracePayload } from '../types/index.js';

export class TraceModel {
  /**
   * Creates a new trace and all its associated spans in a single transaction.
   * This is the main method for inserting new trace data.
   * @param userId - The ID of the user who owns the trace.
   * @param tracePayload - The full trace object, including the array of spans.
   * @returns The summary of the newly created trace.
   */
  static async create(userId: string, tracePayload: TracePayload): Promise<Trace> {
    const { spans, traceId } = tracePayload;
    if (!spans || spans.length === 0) {
      throw new Error('Cannot create a trace with no spans.');
    }

    // Find the root span (the one with no parentId) to get summary info
    const rootSpan = spans.find(s => !s.parentId);
    if (!rootSpan) {
      throw new Error('Trace data must contain at least one root span (a span with no parentId).');
    }

    const client = await pool.connect();

    try {
      // Start a database transaction
      await client.query('BEGIN');

      // 1. Insert the trace summary into the 'traces' table
      const traceQuery = `
        INSERT INTO traces (trace_id, user_id, root_span_name, start_time_unix_nano, duration_nano, span_count)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const traceValues = [
        traceId,
        userId,
        rootSpan.name,
        rootSpan.startTime, // Assuming startTime is in nanoseconds
        rootSpan.duration,  // Assuming duration is in nanoseconds
        spans.length
      ];
      const traceResult = await client.query(traceQuery, traceValues);
      const newTraceSummary: Trace = traceResult.rows[0];

      // 2. Insert all individual spans into the 'spans' table
      const spanQuery = `
        INSERT INTO spans (span_id, trace_id, parent_span_id, name, start_time_unix_nano, end_time_unix_nano, attributes)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      // Use Promise.all to run all insert queries concurrently for performance
      await Promise.all(spans.map(span => {
        const spanValues = [
          span.id,
          traceId,
          span.parentId || null,
          span.name,
          span.startTime,
          span.endTime,
          span.tags ? JSON.stringify(span.tags) : null
        ];
        return client.query(spanQuery, spanValues);
      }));

      // Commit the transaction
      await client.query('COMMIT');

      return newTraceSummary;

    } catch (error) {
      // If any query fails, roll back the entire transaction
      await client.query('ROLLBACK');
      console.error('Error creating trace, transaction rolled back:', error);
      throw new Error('Failed to save trace data.');
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }

  /**
   * Finds a trace summary by its ID.
   * For a list view, you typically don't need all the spans.
   */
  static async findTraceSummaryById(traceId: string): Promise<Trace | null> {
    const query = 'SELECT * FROM traces WHERE trace_id = $1';
    const result = await pool.query(query, [traceId]);
    return result.rows[0] || null;
  }

  /**
   * Finds a complete trace by its ID, including all of its spans.
   * This is the method you'd use for the trace detail/waterfall view.
   */
  static async findTraceWithSpansById(traceId: string): Promise<{ trace: Trace; spans: Span[] } | null> {
    const traceSummary = await this.findTraceSummaryById(traceId);
    if (!traceSummary) {
      return null;
    }

    const spansQuery = 'SELECT * FROM spans WHERE trace_id = $1 ORDER BY start_time_unix_nano ASC';
    const spansResult = await pool.query(spansQuery, [traceId]);

    return {
      trace: traceSummary,
      spans: spansResult.rows
    };
  }

  /**
   * Finds all trace summaries for a given user.
   * This is suitable for the main traces list page.
   */
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
  
  /**
   * Deletes all traces and their associated spans for a given user.
   * It's crucial to delete from both tables.
   * NOTE: A better approach is to set ON DELETE CASCADE on the foreign key in your database.
   */
  static async deleteByUserId(userId: string): Promise<{ deletedSpansCount: number; deletedTracesCount: number }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, delete the spans associated with the user's traces
      const deleteSpansQuery = `
        DELETE FROM spans 
        WHERE trace_id IN (SELECT trace_id FROM traces WHERE user_id = $1)
      `;
      const spansResult = await client.query(deleteSpansQuery, [userId]);

      // Second, delete the trace summaries
      const deleteTracesQuery = 'DELETE FROM traces WHERE user_id = $1';
      const tracesResult = await client.query(deleteTracesQuery, [userId]);

      await client.query('COMMIT');

      return {
        deletedSpansCount: spansResult.rowCount || 0,
        deletedTracesCount: tracesResult.rowCount || 0,
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user data, transaction rolled back:', error);
      throw new Error('Failed to delete user trace data.');
    } finally {
      client.release();
    }
  }

  // Other methods like findByUserIdAndTimeRange and getTraceStats operate on the
  // traces summary table and are likely correct as they were.
}
