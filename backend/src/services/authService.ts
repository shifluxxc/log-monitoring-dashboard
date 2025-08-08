import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { CreateUserRequest, LoginRequest, LoginResponse, UserResponse, JwtPayload } from '../types/index.js';

const JWT_SECRET = (process.env.JWT_SECRET || 'your-secret-key') ;
const JWT_EXPIRES_IN =  24 * 60 * 60 ;

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<UserResponse> {
    const { email, password } = userData;
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Create new user
    const newUser = await UserModel.create(userData);
    return newUser;
  }
  
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginData;
    
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };
    
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, options);
    
    // Return user info (without password) and token
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      api_key: user.api_key,
      created_at: user.created_at
    };
    
    return {
      accessToken,
      user: userResponse
    };
  }
  
  static async validateToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  static async refreshApiKey(userId: string): Promise<string> {
    const newApiKey = await UserModel.updateApiKey(userId);
    return newApiKey;
  }
  
  static async validateApiKey(apiKey: string): Promise<string> {
    const user = await UserModel.findByApiKey(apiKey);
    if (!user) {
      throw new Error('Invalid API key');
    }
    return user.id;
  }
} 