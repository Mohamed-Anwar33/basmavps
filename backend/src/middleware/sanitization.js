import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Sanitize HTML content
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize text content
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return validator.escape(text.trim());
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  
  return validator.normalizeEmail(email.toLowerCase().trim());
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  const trimmed = url.trim();
  if (!validator.isURL(trimmed)) return null;
  
  return trimmed;
};

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj, options = {}) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      // Determine sanitization method based on key name or options
      if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.includes('url') || key.includes('link')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.includes('html') || key.includes('content') || key.includes('description')) {
        sanitized[key] = options.allowHTML ? sanitizeHTML(value) : sanitizeText(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (options = {}) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = () => {
  return (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, { allowHTML: false });
    }
    next();
  };
};
