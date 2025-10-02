/**
 * Production Security Configuration
 * Enhanced security settings for production deployment
 */

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';

// Rate limiting configurations
export const rateLimitConfig = {
  // General API rate limiting - زودت الحد للخدمات والصفحات
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // زودت من 100 إلى 500 طلب كل 15 دقيقة
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
      success: false,
      error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Payment endpoints rate limiting
  payment: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 payment attempts per hour
    message: {
      success: false,
      error: 'Too many payment attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Contact form rate limiting
  contact: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 contact submissions per hour
    message: {
      success: false,
      error: 'Too many contact form submissions, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Admin endpoints rate limiting - زودت الحد للأدمن
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // زودت من 200 إلى 1000 للعمليات الإدارية
    message: {
      success: false,
      error: 'Too many admin requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Checkout endpoints rate limiting (more lenient for user flows)
  checkout: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 checkout requests per windowMs
    message: {
      success: false,
      error: 'Too many checkout requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
};

// Speed limiting (slow down responses) - خففت القيود
export const speedLimitConfig = {
  general: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 200, // زودت من 50 إلى 200 طلب بدون تأخير
    delayMs: () => 200, // قللت التأخير من 500ms إلى 200ms
    validate: { delayMs: false } // Disable warning
  }),

  auth: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2, // allow 2 requests per windowMs without delay
    delayMs: () => 1000, // Fixed: new express-slow-down v2 format
    validate: { delayMs: false } // Disable warning
  })
};

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paypal.com", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://www.paypal.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for PayPal compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// CORS configuration for production
export const corsConfig = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost and 127.0.0.1 origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'https://basmadesign.com',
      'https://www.basmadesign.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Add your production domains here
    ].filter(Boolean);
    
    console.log('🔍 CORS Check:', { origin, allowedOrigins, nodeEnv: process.env.NODE_ENV });
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS Rejected:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
  // Remove null bytes
  if (req.body) {
    req.body = JSON.parse(JSON.stringify(req.body).replace(/\0/g, ''));
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/\0/g, '');
      }
    });
  }
  
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].replace(/\0/g, '');
      }
    });
  }
  
  next();
};

// IP whitelist for admin endpoints (optional)
export const adminIPWhitelist = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
  
  if (allowedIPs.length === 0) {
    return next(); // No IP restriction if not configured
  }
  
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (allowedIPs.includes(clientIP)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied from this IP address'
    });
  }
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
  ];
  
  const requestString = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
  
  if (isSuspicious) {
    // Security alert - remove in production
  }
  
  next();
};

export default {
  rateLimitConfig,
  speedLimitConfig,
  helmetConfig,
  corsConfig,
  securityHeaders,
  sanitizeRequest,
  adminIPWhitelist,
  securityLogger
};
