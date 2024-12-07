import rateLimit from 'express-rate-limit';

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // start blocking after 3 requests
  message: "Too many password reset attempts from this IP, please try again after an hour"
});

 