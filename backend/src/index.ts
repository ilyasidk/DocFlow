import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedAdminUser } from './config/seed.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
// @ts-ignore
import cors from 'cors';

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware для парсинга JSON
app.use(express.json());

// CORS middleware
app.use(cors());

// Healthcheck endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Централизованный обработчик ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize admin user if needed
    await seedAdminUser();
    
    // Start the server
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})(); 