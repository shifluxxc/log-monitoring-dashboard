import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    return res.status(statusCode).json(response);
  }
  
  static error(res: Response, error: string, details?: any, statusCode: number = 400) {
    const response: ApiResponse = {
      success: false,
      error,
      details
    };
    return res.status(statusCode).json(response);
  }
  
  static created<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message, 201);
  }
  
  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, undefined, 404);
  }
  
  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, undefined, 401);
  }
  
  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, undefined, 403);
  }
  
  static validationError(res: Response, details: any) {
    return this.error(res, 'Validation failed', details, 400);
  }
  
  static serverError(res: Response, message: string = 'Internal server error') {
    return this.error(res, message, undefined, 500);
  }
} 