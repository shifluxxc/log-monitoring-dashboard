import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = await AuthService.validateToken(token);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    const userId = await AuthService.validateApiKey(apiKey);
    
    // Get user details for the request
    const { UserModel } = await import('../models/User.js');
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    req.user = {
      userId: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await AuthService.validateToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    } else if (apiKey) {
      const userId = await AuthService.validateApiKey(apiKey);
      const { UserModel } = await import('../models/User.js');
      const user = await UserModel.findById(userId);
      
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 