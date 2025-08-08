import express, { Application, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { initializeDatabase } from './config/init-db.js';
import authRoutes from './routes/auth.js';

const app: Application = express();
const PORT = process.env.PORT || 7000;

// * Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// * Routes
app.use('/auth', authRoutes);

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
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
