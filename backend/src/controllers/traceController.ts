import { Request, Response } from 'express';
import { TraceService } from '../services/traceService.js';
import { ResponseUtil } from '../utils/response.js';

export class TraceController {
  static async getTraces(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.unauthorized(res, 'User not authenticated');
      }
      const traces = await TraceService.getTraces(userId);
      return ResponseUtil.success(res, traces);
    } catch (error) {
      console.error('❌ Error fetching traces:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch traces');
    }
  }

  static async getTraceById(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.unauthorized(res, 'User not authenticated');
      }
      const { traceId } = req.params;
      const trace = await TraceService.getTraceById(userId, traceId);
      if (!trace) {
        return ResponseUtil.notFound(res, 'Trace not found');
      }
      return ResponseUtil.success(res, trace);
    } catch (error) {
      console.error('❌ Error fetching trace by ID:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch trace');
    }
  }
}
