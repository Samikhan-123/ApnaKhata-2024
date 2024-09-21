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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectedDB();

const app = express();

// Middleware
app.use(morgan('dev'));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*', // Allow all origins in development
  credentials: process.env.NODE_ENV === 'production', // Set credentials only in production
}));

// app.options('*', cors());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(helmet({ 
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  }
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, './dist')));

// API root route
app.get('/api', (req, res) => {
  res.send('Apna Khata API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.message);
  res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// Catch-all handler to serve the index.html for any route not handled by the API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`
  );
});

export default app;