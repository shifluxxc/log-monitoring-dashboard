import { pool } from '../config/database.js';
import { Trace, Span } from '../types/index.js';

export class TraceService {
  static async getTraces(userId: string): Promise<Trace[]> {
    const query = `
      SELECT
          trace_id,
          user_id,
          root_span_name,
          start_time_unix_nano,
          duration_nano,
          span_count,
          created_at
      FROM
          traces
      WHERE
          user_id = $1
      ORDER BY
          created_at DESC
      LIMIT 100;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async getTraceById(userId: string, traceId: string): Promise<{ trace: Trace; spans: Span[] } | null> {
    const traceQuery = 'SELECT * FROM traces WHERE user_id = $1 AND trace_id = $2';
    const spansQuery = 'SELECT * FROM spans WHERE trace_id = $1 ORDER BY start_time_unix_nano ASC';

    const traceResult = await pool.query(traceQuery, [userId, traceId]);
    if (traceResult.rows.length === 0) {
      return null;
    }

    const spansResult = await pool.query(spansQuery, [traceId]);

    return {
      trace: traceResult.rows[0],
      spans: spansResult.rows,
    };
  }
}
