import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectedDB from "./db/connectDB.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import createError from "http-errors";
import fs from "fs";
import rateLimit from "express-rate-limit";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectedDB();

// Configure trust proxy based on environment
if (process.env.NODE_ENV === "production") {
  // Trust the first proxy (useful for services like AWS ELB, nginx, etc.)
  app.set("trust proxy", 1);

  // Alternatively, you can trust multiple proxies if needed:
  // app.set('trust proxy', 2); // Trust first 2 proxies
  // Or use a function for more complex scenarios:
  // app.set('trust proxy', (ip) => {
  //   if (ip === '127.0.0.1' || ip === '123.123.123.123') return true;
  //   else return false;
  // });
} else {
  // In development, you might not need to trust proxy
  // But if you're using a reverse proxy locally, set accordingly
  app.set("trust proxy", "loopback"); // Trust localhost only
}

// Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Serve static files and handle client routing BEFORE API routes
if (process.env.NODE_ENV === "production") {
  // Serve static files
  app.use(express.static(path.join(__dirname, "dist")));
}

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "http://localhost:5173"
        : "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Forwarded-For"],
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Rate limiting middleware (place this after trust proxy configuration)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use the client's real IP address (considering the proxy)
    return req.ip;
  },
});

// Apply rate limiting to all requests
app.use(generalLimiter);

// More specific rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message:
    "Too many authentication attempts from this IP, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // start blocking after 3 requests
  message:
    "Too many password reset attempts from this IP, please try again after an hour",
  skipSuccessfulRequests: true, // Don't count successful requests
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/expenses", expenseRoutes);

// API health check (without rate limiting)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    ip: req.ip,
    forwardedFor: req.headers["x-forwarded-for"],
  });
});

// Serve uploads (receipts)
app.use(
  "/uploads/receipts",
  express.static(path.join(__dirname, "uploads", "receipts"))
);

// Handle client-side routing for SPA (should be after API routes)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res, next) => {
  next(createError(404, "API route not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Safely clean up uploaded file if there's an error
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) console.error("Error deleting file:", unlinkError);
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
  console.log(`Trust proxy setting: ${app.get("trust proxy")}`);
});

export default app;
