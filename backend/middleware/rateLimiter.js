import rateLimit from 'express-rate-limit';

// Standard rate limiter for most API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for ticket validation (more lenient for check-in scenarios)
export const validationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Allow 30 ticket validations per minute
  message: 'Too many validation requests, please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for creating resources
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 resource creations per hour
  message: 'Too many resources created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
