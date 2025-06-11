import rateLimit from 'express-rate-limit';

// Rate limit for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

// Rate limit for chat messages
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Increased to 50 messages per minute
  message: { error: 'Too many messages, please slow down' }
});

// Rate limit for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please try again later' }
}); 