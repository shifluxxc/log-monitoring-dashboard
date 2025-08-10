import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { redisSubscriber } from '../config/redis.js';
import { AuthService } from './authService.js';
import { Log } from '../types/index.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  email?: string;
}

interface RedisMessage {
  type: string;
  data: Log;
  userId: string;
  timestamp: string;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private redisSubscriber: typeof redisSubscriber;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/logs',
      perMessageDeflate: false
    }); 
    
    this.redisSubscriber = redisSubscriber;
    this.setupWebSocketServer();
    this.setupRedisSubscription();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
      console.log('🔌 WebSocket client connected');
      console.log('📡 Request URL:', req.url);
      console.log('📡 Request headers:', req.headers);

      // Extract token from query parameters or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || 
                   req.headers['authorization']?.toString().replace('Bearer ', '');

      console.log('🔑 Token extracted:', token ? 'Present' : 'Missing');

      if (!token) {
        console.log('❌ No token provided, closing connection');
        ws.send(JSON.stringify({ 
          type: 'error',
          error: 'Authentication required',
          message: 'No token provided'
        }));
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        // Validate JWT token
        const decoded = await AuthService.validateToken(token);
        ws.userId = decoded.userId;
        ws.email = decoded.email;
        
        console.log(`✅ WebSocket authenticated for user: ${decoded.email} (${decoded.userId})`);
        
        ws.send(JSON.stringify({ 
          type: 'auth:success',
          message: 'Authenticated successfully',
          userId: decoded.userId,
          email: decoded.email
        }));

        // Send connection status
        ws.send(JSON.stringify({
          type: 'connection:status',
          message: 'Connected to real-time log stream',
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error('❌ WebSocket authentication failed:', error);
        ws.send(JSON.stringify({ 
          type: 'error',
          error: 'Authentication failed',
          message: 'Invalid or expired token'
        }));
        ws.close(1008, 'Authentication failed');
        return;
      }

      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`📨 Received message from client:`, data);
          
          // Handle different message types
          switch (data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
              break;
            case 'subscribe':
              // Client can subscribe to specific channels
              ws.send(JSON.stringify({ 
                type: 'subscribe:success',
                message: 'Subscribed to log stream'
              }));
              break;
            default:
              console.log(`📨 Unknown message type: ${data.type}`);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket client disconnected: ${reason} (code: ${code})`);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });

    console.log('🚀 WebSocket server initialized on /ws/logs');
  }

  private setupRedisSubscription() {
    // Handle Redis subscription errors
    this.redisSubscriber.on('error', (error) => {
      console.error('❌ Redis subscriber error:', error);
    });

    // Handle Redis messages
    this.redisSubscriber.on('message', (channel, message) => {
      try {
        const redisMessage: RedisMessage = JSON.parse(message);
        
        console.log(`📤 Received Redis message on channel ${channel}:`, redisMessage.type);

        // Send to the specific user
        if (redisMessage.userId) {
          const wsMessage = {
            type: 'log:new',
            data: redisMessage.data,
            timestamp: redisMessage.timestamp
          };
          this.sendToUser(redisMessage.userId, wsMessage);
          console.log(`📤 Sent log to WebSocket client for user ${redisMessage.userId}`);
        } else {
            this.broadcast(redisMessage)
        }
      } catch (error) {
        console.error('❌ Error processing Redis message:', error);
      }
    });

    // Subscribe to Redis channels for all users
    this.redisSubscriber.subscribe('logs', (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to Redis channels:', err);
        return;
      }
      console.log(`📡 Subscribed to Redis pattern 'logs'`);
    });
  }

  // Method to broadcast message to all connected clients
  public broadcast(message: any) {
    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Method to send message to specific user
  public sendToUser(userId: string, message: any) {
    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Get connection stats
  public getStats() {
    return {
      totalConnections: this.wss.clients.size,
      readyState: 'running'
    };
  }
}
