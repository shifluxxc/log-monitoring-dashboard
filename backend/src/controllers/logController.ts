import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { z } from 'zod';

const getLogsQuerySchema = z.object({
  limit: z.string().optional().default('100'),
  offset: z.string().optional().default('0'),
});

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { limit, offset } = getLogsQuerySchema.parse(req.query);
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

    const result = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT $1 OFFSET $2', [limitInt, offsetInt]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};
