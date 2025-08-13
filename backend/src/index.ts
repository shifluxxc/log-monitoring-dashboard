import express, { Application, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import http from 'http';
import { initializeDatabase } from './config/init-db.js';
import authRoutes from './routes/auth.js';
import ingestionRoutes from './routes/ingestion.js';
import logRoutes from './routes/logs.js';
import traceRoutes from './routes/traces.js';
import { WebSocketService } from './services/websocketService.js';

const app: Application = express();
const PORT = process.env.PORT || 7000;

// * Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// * Routes
app.use('/auth', authRoutes);
app.use('/', ingestionRoutes);
app.use('/api', logRoutes);
app.use('/api/traces', traceRoutes);

// * Health check endpoint
app.get("/", (req: Request, res: Response) => {
  return res.send("Log Management Dashboard API is working 🙌");
});

// * Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

/*// * 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});*/

// * Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket service
    const wsService = new WebSocketService(server);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth/`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws/logs`);
      console.log(`📤 Ingestion endpoints: http://localhost:${PORT}/ingest/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
