import DOMPurify from 'isomorphic-dompurify';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

/**
 * Content sanitization middleware
 */
export const sanitizeContent = (req, res, next) => {
  if (!req.body) {
    return next();
  }

  try {
    // Recursively sanitize all string values in the request body
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
            'width', 'height', 'style', 'colspan', 'rowspan'
          ],
          ALLOW_DATA_ATTR: false,
          ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|^#/,
          ADD_ATTR: ['target'],
          FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
        });
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
      code: 'SANITIZATION_ERROR'
    });
  }
};

/**
 * Advanced XSS protection
 */
export const xssProtection = (req, res, next) => {
  const dangerousPatterns = [
    // Script injection patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    
    // Event handler patterns
    /on\w+\s*=/gi,
    /fscommand/gi,
    /seeksegmenttime/gi,
    
    // Meta refresh and other dangerous tags
    /<meta[^>]*http-equiv[^>]*refresh/gi,
    /<iframe[^>]*src\s*=\s*["'](?!https?:\/\/)/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    
    // CSS expression attacks
    /expression\s*\(/gi,
    /url\s*\(\s*["']?\s*javascript:/gi,
    
    // SQL injection patterns in content
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi
  ];

  const contentString = JSON.stringify(req.body);
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(contentString)) {
      return res.status(400).json({
        success: false,
        message: 'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø¹Ù†Ø§ØµØ± ØºÙŠØ± Ø¢Ù…Ù†Ø©',
        code: 'XSS_DETECTED'
      });
    }
  }

  next();
};

/**
 * File upload security validation
 */
export const validateFileUpload = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'text/plain', 'application/json'
  ];
  
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const maxTotalSize = 200 * 1024 * 1024; // 200MB total
  
  let totalSize = 0;
  
  for (const file of files) {
    // Check file size
    if (file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ${file.originalname} ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 50MB)`,
        code: 'FILE_TOO_LARGE'
      });
    }
    
    totalSize += file.size;
    
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ${file.originalname} ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…`,
        code: 'INVALID_FILE_TYPE',
        allowedTypes: allowedMimeTypes
      });
    }
    
    // Check file extension matches MIME type
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const mimeTypeExtensions = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
      'image/svg+xml': ['svg'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/ogg': ['ogg'],
      'application/pdf': ['pdf'],
      'text/plain': ['txt'],
      'application/json': ['json']
    };
    
    const validExtensions = mimeTypeExtensions[file.mimetype] || [];
    if (!validExtensions.includes(extension)) {
      return res.status(400).json({
        success: false,
        message: `Ø§Ù…ØªØ¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù ${file.originalname} Ù„Ø§ ÙŠØªØ·Ø§Ø¨Ù‚ Ù…Ø¹ Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù`,
        code: 'EXTENSION_MISMATCH'
      });
    }
    
    // Check for dangerous file names
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
      /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app)$/i  // Executable extensions
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.originalname)) {
        return res.status(400).json({
          success: false,
          message: `Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ${file.originalname} ØºÙŠØ± Ø¢Ù…Ù†`,
          code: 'UNSAFE_FILENAME'
        });
      }
    }
  }
  
  // Check total upload size
  if (totalSize > maxTotalSize) {
    return res.status(400).json({
      success: false,
      message: 'Ø§Ù„Ø­Ø¬Ù… Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù„Ù„Ù…Ù„ÙØ§Øª ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 200MB)',
      code: 'TOTAL_SIZE_EXCEEDED'
    });
  }
  
  next();
};

/**
 * Rate limiting for different operations
 */
export const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø§Ù„Ø·Ù„Ø¨Ø§Øª',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use admin ID if available, otherwise IP
      return req.admin?.id || req.ip;
    }
  };
  
  return rateLimit({ ...defaults, ...options });
};

// Specific rate limiters
export const contentRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 content operations per 5 minutes
  message: {
    success: false,
    message: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
    code: 'CONTENT_RATE_LIMIT'
  }
});

export const uploadRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 uploads per 10 minutes
  message: {
    success: false,
    message: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø±ÙØ¹',
    code: 'UPLOAD_RATE_LIMIT'
  }
});

export const bulkOperationRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 bulk operations per hour
  message: {
    success: false,
    message: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø¬Ù…Ø¹Ø©',
    code: 'BULK_OPERATION_RATE_LIMIT'
  }
});

/**
 * Content size validation
 */
export const validateContentSize = (maxSize = 10 * 1024 * 1024) => { // 10MB default
  return (req, res, next) => {
    const contentString = JSON.stringify(req.body);
    const sizeInBytes = Buffer.byteLength(contentString, 'utf8');
    
    if (sizeInBytes > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Ø­Ø¬Ù… Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹',
        code: 'CONTENT_TOO_LARGE',
        maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
        currentSize: `${Math.round(sizeInBytes / 1024 / 1024 * 100) / 100}MB`
      });
    }
    
    next();
  };
};

/**
 * CSRF protection for content operations
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Ø±Ù…Ø² Ø§Ù„Ø­Ù…Ø§ÙŠØ© ØºÙŠØ± ØµØ­ÙŠØ­',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next();
};

/**
 * Input validation using express-validator
 */
export const validateContentInput = [
  body('pageType')
    .isIn(['homepage', 'about', 'howToOrder', 'how-to-order', 'policies', 'hero', 'foundational', 'services', 'contact'])
    .withMessage('Ù†ÙˆØ¹ Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± ØµØ­ÙŠØ­'),
  
  body('content.sections')
    .isArray({ max: 100 })
    .withMessage('Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø£Ù‚Ù„ Ù…Ù† 100'),
  
  body('content.sections.*.id')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Ù…Ø¹Ø±Ù Ø§Ù„Ù‚Ø³Ù… ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø­Ø±Ù ÙˆØ£Ø±Ù‚Ø§Ù… ÙÙ‚Ø·'),
  
  body('content.sections.*.type')
    .isIn(['text', 'richText', 'image', 'gallery', 'form', 'video', 'embed', 'cta', 'custom'])
    .withMessage('Ù†ÙˆØ¹ Ø§Ù„Ù‚Ø³Ù… ØºÙŠØ± ØµØ­ÙŠØ­'),
  
  body('content.metadata.title.ar')
    .isLength({ min: 1, max: 60 })
    .withMessage('Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØµÙØ­Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ù…Ø·Ù„ÙˆØ¨ (1-60 Ø­Ø±Ù)'),
  
  body('content.metadata.title.en')
    .isLength({ min: 1, max: 60 })
    .withMessage('Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØµÙØ­Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ù…Ø·Ù„ÙˆØ¨ (1-60 Ø­Ø±Ù)'),
  
  body('content.metadata.description.ar')
    .isLength({ max: 160 })
    .withMessage('ÙˆØµÙ Ø§Ù„ØµÙØ­Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø£Ù‚Ù„ Ù…Ù† 160 Ø­Ø±Ù'),
  
  body('content.metadata.description.en')
    .isLength({ max: 160 })
    .withMessage('ÙˆØµÙ Ø§Ù„ØµÙØ­Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø£Ù‚Ù„ Ù…Ù† 160 Ø­Ø±Ù'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Audit logging for security events
 */
export const auditSecurityEvent = (eventType, details = {}) => {
  return (req, res, next) => {
    // Log security event
    // In production, this would write to a security audit log
    // and potentially trigger alerts for critical events
    
    next();
  };
};

export default {
  sanitizeContent,
  xssProtection,
  validateFileUpload,
  contentRateLimit,
  uploadRateLimit,
  bulkOperationRateLimit,
  validateContentSize,
  csrfProtection,
  validateContentInput,
  securityHeaders,
  auditSecurityEvent
};
