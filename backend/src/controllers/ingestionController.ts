import { Request, Response } from 'express';
import { LogModel } from '../models/Log.js';
import { CreateLogRequest, Log } from '../types/index.js';
import { redisPublisher } from '../config/redis.js';
import { ResponseUtil } from '../utils/response.js';

export class IngestionController {
  static async ingestLog(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.unauthorized(res, 'User not authenticated');
      }

      const logData: CreateLogRequest = req.body;

      // Validate required fields
      if (!logData.level || !logData.message) {
        return ResponseUtil.validationError(res, {
          error: 'Log level and message are required',
          details: {
            level: logData.level ? 'valid' : 'missing',
            message: logData.message ? 'valid' : 'missing'
          }
        });
      }

      // Validate log level
      const validLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
      if (!validLevels.includes(logData.level.toUpperCase())) {
        return ResponseUtil.validationError(res, {
          error: 'Invalid log level',
          details: {
            level: logData.level,
            validLevels
          }
        });
      }

      // Create log in database
      const newLog: Log = await LogModel.create(userId, {
        ...logData,
        level: logData.level.toUpperCase()
      });

      // Publish to Redis for real-time updates
      const redisMessage = {
        type: 'log:new',
        data: newLog,
        userId: userId,
        timestamp: new Date().toISOString()
      };

      await redisPublisher.publish(`logs:${userId}`, JSON.stringify(redisMessage));
      console.log(`📤 Published log to Redis channel logs:${userId}`);

      return ResponseUtil.created(res, newLog, 'Log ingested successfully');
    } catch (error) {
      console.error('❌ Log ingestion error:', error);
      return ResponseUtil.serverError(res, 'Failed to ingest log');
    }
  }

  static async ingestTrace(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.unauthorized(res, 'User not authenticated');
      }

      const tracePayload: TracePayload = req.body;

      if (!tracePayload.traceId || !tracePayload.spans || tracePayload.spans.length === 0) {
        return ResponseUtil.validationError(res, {
          error: 'Trace ID and at least one span are required',
        });
      }

      const redisMessage = {
        type: 'trace:new',
        data: tracePayload,
        userId: userId,
        timestamp: new Date().toISOString()
      };

      await redisPublisher.publish(`traces:${userId}`, JSON.stringify(redisMessage));
      console.log(`📤 Published trace to Redis channel traces:${userId}`);

      return ResponseUtil.accepted(res, 'Trace accepted for processing');
    } catch (error) {
      console.error('❌ Trace ingestion error:', error);
      return ResponseUtil.serverError(res, 'Failed to ingest trace');
    }
  }
}
import { TracePayload } from '../types/index.js';
