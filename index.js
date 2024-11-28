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

// Load environment variables first
dotenv.config(); 
 
// Connect to database
connectedDB(); 

// Security middleware
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to load
//   })
// );


// Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL].filter(Boolean)
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
 
// Static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}


// Serve uploads with proper headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// 404 handler for API routes
app.use('/api/*', (req, res, next) => {
  next(createError(404, ' route not found'));
});
app.use('/api', (req, res) => {
  res.status(200).json({ message: 'server running' });
});
app.use('/', (req, res) => {
  res.status(200).json({ message: 'welcome server' });
});

// Production route handler
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Clean up uploaded file if there's an error
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

export default app;
  