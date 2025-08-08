import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { CreateUserRequest, LoginRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData: CreateUserRequest = req.body;
      
      const newUser = await AuthService.register(userData);
      
      // Generate JWT token for immediate login
      const loginData: LoginRequest = {
        email: userData.email,
        password: userData.password
      };
      
      const loginResult = await AuthService.login(loginData);
      
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser,
        accessToken: loginResult.accessToken
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('Password must be')) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async login(req: Request, res: Response) {
    try {
      const loginData: LoginRequest = req.body;
      
      const result = await AuthService.login(loginData);
      
      return res.status(200).json({
        message: 'Login successful',
        accessToken: result.accessToken,
        user: result.user
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          return res.status(401).json({ error: error.message });
        }
      }
      
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async refreshApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const newApiKey = await AuthService.refreshApiKey(req.user.userId);
      
      return res.status(200).json({
        message: 'API key refreshed successfully',
        api_key: newApiKey
      });
    } catch (error) {
      console.error('API key refresh error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { UserModel } = await import('../models/User.js');
      const user = await UserModel.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userResponse = {
        id: user.id,
        email: user.email,
        api_key: user.api_key,
        created_at: user.created_at
      };
      
      return res.status(200).json({
        user: userResponse
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 