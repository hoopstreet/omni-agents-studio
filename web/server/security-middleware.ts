/**
 * Omni-Agents Security Middleware
 * Implements rate limiting, CORS, request validation, and API protection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';

// ============================================
// 1. RATE LIMITING
// ============================================

export const createRateLimiter = (windowMs: number, maxRequests: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise use IP
      return (req.user?.id as string) || req.ip || 'unknown';
    },
  });
};

// Rate limiters for different endpoints
export const publicLimiter = createRateLimiter(60 * 1000, 10); // 10 requests per minute
export const authLimiter = createRateLimiter(60 * 1000, 100); // 100 requests per minute
export const adminLimiter = createRateLimiter(60 * 1000, 1000); // 1000 requests per minute

// ============================================
// 2. CORS CONFIGURATION
// ============================================

export const corsOptions = {
  origin: [
    'https://omni-agents.app',
    'https://omniagents-zycdtw8o.manus.space',
    'https://expo.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Webhook-Signature',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// ============================================
// 3. SECURITY HEADERS
// ============================================

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openrouter.ai'],
      fontSrc: ["'self'", 'https://fonts.googleapis.com'],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
});

// ============================================
// 4. REQUEST VALIDATION
// ============================================

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid Content-Type. Expected application/json',
      });
    }
  }
  next();
};

// ============================================
// 5. API KEY VALIDATION
// ============================================

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  try {
    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Check if API key is in database and active
    // This would be implemented with your database
    // const credential = await db.credentials.findOne({ apiKey });
    // if (!credential || credential.status !== 'active') {
    //   return res.status(401).json({ error: 'Invalid or revoked API key' });
    // }

    // Attach credential to request
    // req.credential = credential;

    next();
  } catch (error) {
    res.status(500).json({ error: 'API key validation failed' });
  }
};

// ============================================
// 6. WEBHOOK SIGNATURE VERIFICATION
// ============================================

export const verifyWebhookSignature = (
  secret: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-webhook-signature'] as string;

    if (!signature) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    try {
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Signature verification failed' });
    }
  };
};

// ============================================
// 7. INPUT SANITIZATION
// ============================================

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      const value = req.query[key];
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    });
  }

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

// ============================================
// 8. AUTHENTICATION MIDDLEWARE
// ============================================

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    // Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated first
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user is admin
  if ((req.user as any).role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};

// ============================================
// 9. HELPER FUNCTIONS
// ============================================

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

function isValidApiKeyFormat(apiKey: string): boolean {
  // API key should be alphanumeric and at least 32 characters
  return /^[a-zA-Z0-9]{32,}$/.test(apiKey);
}

// ============================================
// 10. ERROR HANDLING
// ============================================

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Log error to audit trail
  // await logError(err, req);

  // Don't expose internal error details
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: message,
    requestId: req.id,
  });
};

// ============================================
// 11. REQUEST LOGGING
// ============================================

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Generate request ID
  req.id = crypto.randomUUID();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    // Log to file or service
    console.log(JSON.stringify(log));
  });

  next();
};

// ============================================
// 12. SETUP FUNCTION
// ============================================

export const setupSecurityMiddleware = (app: any) => {
  // Apply security headers
  app.use(securityHeaders);

  // CORS
  app.use(cors(corsOptions));

  // Request logging
  app.use(requestLogger);

  // Content type validation
  app.use(validateContentType);

  // Input sanitization
  app.use(sanitizeInput);

  // Rate limiting (public endpoints)
  app.use('/api/public', publicLimiter);

  // Rate limiting (authenticated endpoints)
  app.use('/api/auth', authLimiter);

  // Rate limiting (admin endpoints)
  app.use('/api/admin', adminLimiter);

  // Error handling (must be last)
  app.use(errorHandler);
};

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: any;
      credential?: any;
    }
  }
}
