import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { redisSubscriber } from '../config/redis.js';
import { AuthService } from './authService.js';
import { Log, TracePayload } from '../types/index.js';

// --- TYPE DEFINITIONS ---

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  email?: string;
}

// Interface for messages on 'logs:*' channels
interface RedisLogMessage {
  type: 'log:new';
  data: Log;
  userId: string;
  timestamp: string;
}

// Interface for messages on 'traces:*' channels
interface RedisTraceMessage {
  type: 'trace:new';
  data: TracePayload;
  userId: string;
  timestamp: string;
}

const WEBSOCKET_PATH = '/ws/realtime';

export class WebSocketService {
  private wss: WebSocketServer;
  private redisSubscriber: typeof redisSubscriber;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: WEBSOCKET_PATH,
      perMessageDeflate: false
    }); 
    
    this.redisSubscriber = redisSubscriber;
    this.setupWebSocketServer();
    this.setupRedisSubscription();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
      console.log(`🔌 WebSocket client connected to ${WEBSOCKET_PATH}`);
      
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || 
                   req.headers['authorization']?.toString().replace('Bearer ', '');

      if (!token) {
        console.log('❌ No token provided, closing connection');
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        const decoded = await AuthService.validateToken(token);
        ws.userId = decoded.userId;
        ws.email = decoded.email;
        
        console.log(`✅ WebSocket authenticated for user: ${decoded.email} (${decoded.userId})`);
        ws.send(JSON.stringify({ type: 'auth:success', message: 'Authenticated successfully' }));

      } catch (error) {
        console.error('❌ WebSocket authentication failed:', error);
        ws.close(1008, 'Authentication failed');
        return;
      }

      ws.on('close', () => console.log(`🔌 WebSocket client disconnected: ${ws.email}`));
      ws.on('error', (error) => console.error('❌ WebSocket error:', error));
    });

    console.log(`🚀 WebSocket server initialized on ${WEBSOCKET_PATH}`);
  }

  private setupRedisSubscription() {
    this.redisSubscriber.on('error', (error) => {
      console.error('❌ Redis subscriber error:', error);
    });

    // A single handler for all pattern-based subscriptions
    this.redisSubscriber.on('pmessage', (pattern, channel, message) => {
      // --- LOG HANDLING ---
      if (pattern === 'logs:*') {
        try {
          const redisMessage: RedisLogMessage = JSON.parse(message);
          const wsMessage = {
            type: 'log:new',
            data: redisMessage.data,
            timestamp: redisMessage.timestamp
          };
          this.sendToUser(redisMessage.userId, wsMessage);
          console.log(`📤 Sent log to user ${redisMessage.userId}`);
        } catch (error) {
          console.error(`❌ Error processing message from ${channel}:`, error);
        }
      }

      // --- TRACE HANDLING ---
      if (pattern === 'traces:*') {
        try {
          const redisMessage: RedisTraceMessage = JSON.parse(message);
          const wsMessage = {
            type: 'trace:new',
            data: redisMessage.data, // This is the full TracePayload
            timestamp: redisMessage.timestamp
          };
          this.sendToUser(redisMessage.userId, wsMessage);
          console.log(`📤 Sent trace ${redisMessage.data.traceId} to user ${redisMessage.userId}`);
        } catch (error) {
          console.error(`❌ Error processing message from ${channel}:`, error);
        }
      }
    });

    // Subscribe to both patterns
    const patterns = ['logs:*', 'traces:*'];
    this.redisSubscriber.psubscribe(...patterns, (err, count) => {
      if (err) {
        console.error('❌ Failed to subscribe to Redis patterns:', err);
        return;
      }
      console.log(`📡 Subscribed to Redis patterns: [${patterns.join(', ')}]. Total subscriptions: ${count}`);
    });
  }

  // Method to send message to a specific user
  public sendToUser(userId: string, message: any) {
    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  }
}