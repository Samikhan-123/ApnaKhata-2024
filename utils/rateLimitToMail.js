import rateLimit from 'express-rate-limit';

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 2, // start blocking after 5 requests
  message: "Too many password reset attempts from this IP, please try again after an hour"
});

// Use this limiter in your route
 