import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectedDB from './db/connectDB.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import morgan from 'morgan';
import path from 'path'; 
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import createError from 'http-errors';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectedDB();

const app = express();

// Middleware
app.use(morgan('dev'));  

// // Basic CORS configuration
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
//   credentials: true,
// }));

// Serve static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'dist')));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


 
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve static files
// app.use(express.static(path.join(__dirname, './dist'))); 

// API root route 
app.get('/api', (req, res) => {
  res.send('Apna Khata API is running');
});
app.get('/', (req, res) => { 
  res.send('server is running on port ' + PORT + '.'); 
});

// Catch 404 for API routes
app.use('/api/*', (req, res, next) => {
  next(createError(404, ' route not found'));
});

// Serve index.html for any other route
// Handle React routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development route
  app.get('/', (req, res) => {
    res.send('something went wrong');
  });
}

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  }); 
}); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

export default app;
