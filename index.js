import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectedDB from './db/connectDB.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import createError from 'http-errors';
import fs from 'fs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectedDB();

// Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static files and handle client routing BEFORE API routes
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'dist')));

  // Handle client-side routing - should come BEFORE API routes
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}  

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL // Ensure this is set correctly in production
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Prevent embedding the page in an iframe (Security)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Root route for server status
app.use('/', (req, res) => {
  res.status(200).json({ message: 'careful this is server' });
});

// 404 handler for API routes (catch-all for unhandled routes)
app.use('/api/*', (req, res, next) => {
  next(createError(404, 'Route not found'));
});


// Serve uploads (receipts)
app.use(
  '/uploads/receipts',
  express.static(path.join(__dirname, 'uploads', 'receipts'))
);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Safely clean up uploaded file if there’s an error
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) console.error('Error deleting file:', unlinkError);
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

export default app;
