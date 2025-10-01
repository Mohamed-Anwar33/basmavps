import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import sharp from 'sharp';

/**
 * Enhanced image processing and optimization
 */
export const processAndOptimizeImage = async (buffer, filename) => {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    // Create multiple optimized versions
    const sizes = {
      thumbnail: { width: 300, height: 300, quality: 85 },
      medium: { width: 800, height: 600, quality: 90 },
      large: { width: 1200, height: 900, quality: 95 }
    };

    const processedImages = {};

    for (const [sizeName, config] of Object.entries(sizes)) {
      const processed = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: config.quality, progressive: true })
        .toBuffer();

      processedImages[sizeName] = {
        buffer: processed,
        filename: `${sizeName}_${filename}`,
        size: processed.length
      };
    }

    return processedImages;
  } catch (error) {
    throw new Error('ÙØ´Ù„ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ØµÙˆØ±Ø©');
  }
};

/**
 * Enhanced Cloudinary storage with multiple size support
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}_${randomString}`;

    return {
      folder: 'basma-design/service-images',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1200, height: 900, crop: 'limit' }
      ]
    };
  }
});

/**
 * Enhanced file filter for image uploads with comprehensive security checks
 */
const fileFilter = (req, file, cb) => {
  try {
    // Allowed MIME types - strictly defined
    const allowedMimeTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/webp'
    ];
    
    // Allowed file extensions - strictly defined
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Enhanced MIME type validation
    if (!file.mimetype || !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      return cb(new Error('Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…. ÙŠÙØ³Ù…Ø­ ÙÙ‚Ø· Ø¨Ù€ JPG, PNG, WebP'), false);
    }
    
    // Enhanced file extension validation
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Ø§Ù…ØªØ¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…. ÙŠÙØ³Ù…Ø­ ÙÙ‚Ø· Ø¨Ù€ .jpg, .jpeg, .png, .webp'), false);
    }
    
    // Enhanced security: Check for suspicious file names and patterns
    const suspiciousPatterns = [
      /\.php$/i,
      /\.js$/i,
      /\.html$/i,
      /\.htm$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.sh$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.vbs$/i,
      /\.jar$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.asp$/i,
      /\.aspx$/i,
      /\.jsp$/i,
      /\.py$/i,
      /\.rb$/i,
      /\.pl$/i,
      /\.cgi$/i,
      // Double extension attacks
      /\.(jpg|jpeg|png|webp)\.(php|js|html|exe|bat|sh|cmd)$/i,
      // Null byte attacks
      /\x00/,
      // Path traversal attempts
      /\.\./,
      /__/,
      // Script injection attempts
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+=/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
      return cb(new Error('Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø­Ø±Ù Ø£Ùˆ Ø£Ù†Ù…Ø§Ø· ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­Ø©'), false);
    }
    
    // File name length validation
    if (!file.originalname || file.originalname.length === 0) {
      return cb(new Error('Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ù…Ø·Ù„ÙˆØ¨'), false);
    }
    
    if (file.originalname.length > 255) {
      return cb(new Error('Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 255 Ø­Ø±Ù)'), false);
    }
    
    // Check for minimum file name length (at least 5 characters including extension)
    if (file.originalname.length < 5) {
      return cb(new Error('Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ù‚ØµÙŠØ± Ø¬Ø¯Ø§Ù‹'), false);
    }
    
    // Additional validation: Check for dangerous characters only (more permissive for Arabic)
    const dangerousPatterns = [
      /[<>:"|?*\x00-\x1f]/,  // Control characters and dangerous symbols
      /\.\./,                // Directory traversal
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
      /<script/i,            // Script injection
      /javascript:/i,        // JavaScript protocol
      /vbscript:/i          // VBScript protocol
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
      return cb(new Error('Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø­Ø±Ù Ø®Ø·ÙŠØ±Ø© ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­Ø©'), false);
    }
    
    // Log successful file validation
    cb(null, true);
  } catch (error) {
    return cb(new Error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…Ù„Ù'), false);
  }
};

/**
 * Multer configuration for service images
 */
export const uploadServiceImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter
});

/**
 * Enhanced security validation middleware for image uploads
 */
export const validateImageUploadSecurity = (req, res, next) => {
  try {
    // Check if user is authenticated admin
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø¯ÙŠØ± Ù„Ù„ÙˆØµÙˆÙ„ Ù„Ù‡Ø°Ù‡ Ø§Ù„Ù…ÙŠØ²Ø©',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Enhanced admin permissions check
    const allowedRoles = ['admin', 'super_admin', 'superadmin'];
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Enhanced rate limiting check - max 50 uploads per hour per admin
    const uploadKey = `upload_rate_${req.user._id}`;
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Initialize rate limit storage if not exists
    if (!global.uploadRateLimit) {
      global.uploadRateLimit = new Map();
    }
    
    const userUploads = global.uploadRateLimit.get(uploadKey) || [];
    const recentUploads = userUploads.filter(time => currentTime - time < oneHour);
    
    if (recentUploads.length >= 50) {
      return res.status(429).json({
        success: false,
        error: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ø±ÙØ¹ Ø§Ù„ØµÙˆØ± (50 ØµÙˆØ±Ø© ÙÙŠ Ø§Ù„Ø³Ø§Ø¹Ø©). Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¨Ø¹Ø¯ Ø³Ø§Ø¹Ø©',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 3600 // seconds
      });
    }
    
    // Add current upload time
    recentUploads.push(currentTime);
    global.uploadRateLimit.set(uploadKey, recentUploads);

    // Clean up old entries periodically (every 100 requests)
    if (Math.random() < 0.01) {
      for (const [key, uploads] of global.uploadRateLimit.entries()) {
        const validUploads = uploads.filter(time => currentTime - time < oneHour);
        if (validUploads.length === 0) {
          global.uploadRateLimit.delete(key);
        } else {
          global.uploadRateLimit.set(key, validUploads);
        }
      }
    }

    // Security validation passed - all browsers supported

    // Log successful security validation
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£Ù…Ø§Ù†',
      code: 'SECURITY_VALIDATION_ERROR'
    });
  }
};

/**
 * Enhanced error handling middleware for multer with detailed security logging
 */
export const handleUploadErrors = (error, req, res, next) => {
  // Enhanced security logging for upload attempts
  if (error) {
    const logData = {
      adminId: req.user?._id,
      adminRole: req.user?.role,
      error: error.message,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      serviceId: req.params.id
    };
    
    // Log to audit system if available
    if (req.user?._id) {
      import('../models/AuditLog.js').then(({ default: AuditLog }) => {
        AuditLog.logAction(
          req.user._id,
          'upload_failed',
          'service_images',
          req.params.id,
          { error: error.message, code: error.code },
          req
        ).catch(console.error);
      }).catch(console.error);
    }
  }

  // Enhanced Multer error handling
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 5 Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª Ù„ÙƒÙ„ Ù…Ù„Ù',
          code: 'FILE_TOO_LARGE',
          maxSize: '5MB',
          details: 'ÙŠØ±Ø¬Ù‰ Ø¶ØºØ· Ø§Ù„ØµÙˆØ±Ø© Ø£Ùˆ Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© Ø£ØµØºØ± Ø­Ø¬Ù…Ø§Ù‹'
        });
        
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù„ÙØ§Øª ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 10 Ù…Ù„ÙØ§Øª ÙÙŠ Ø§Ù„Ù…Ø±Ø© Ø§Ù„ÙˆØ§Ø­Ø¯Ø©',
          code: 'TOO_MANY_FILES',
          maxFiles: 10,
          details: 'ÙŠØ±Ø¬Ù‰ ØªÙ‚Ù„ÙŠÙ„ Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©'
        });
        
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Ø­Ù‚Ù„ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ Ø£Ùˆ ØºÙŠØ± ØµØ­ÙŠØ­',
          code: 'UNEXPECTED_FIELD',
          details: 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø­Ù‚Ù„ Ø§Ù„ØµØ­ÙŠØ­ Ù„Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±'
        });
        
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Ø¹Ø¯Ø¯ Ø£Ø¬Ø²Ø§Ø¡ Ø§Ù„Ù…Ù„Ù ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹',
          code: 'TOO_MANY_PARTS',
          details: 'Ø§Ù„Ù…Ù„Ù Ù…Ø¹Ù‚Ø¯ Ø¬Ø¯Ø§Ù‹ Ø£Ùˆ ØªØ§Ù„Ù'
        });
        
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          error: 'Ø§Ø³Ù… Ø­Ù‚Ù„ Ø§Ù„Ù…Ù„Ù Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹',
          code: 'FIELD_NAME_TOO_LONG'
        });
        
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          error: 'Ù‚ÙŠÙ…Ø© Ø§Ù„Ø­Ù‚Ù„ Ø·ÙˆÙŠÙ„Ø© Ø¬Ø¯Ø§Ù‹',
          code: 'FIELD_VALUE_TOO_LONG'
        });
        
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Ø¹Ø¯Ø¯ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹',
          code: 'TOO_MANY_FIELDS'
        });
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Ø®Ø·Ø£ ÙÙŠ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù',
          code: 'MULTER_ERROR',
          details: error.message
        });
    }
  }
  
  // Enhanced custom file filter error handling
  const fileFilterErrors = [
    'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…',
    'Ø§Ù…ØªØ¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…',
    'Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø­Ø±Ù ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­Ø©',
    'Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø­Ø±Ù Ø£Ùˆ Ø£Ù†Ù…Ø§Ø· ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­Ø©',
    'Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹',
    'Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ù‚ØµÙŠØ± Ø¬Ø¯Ø§Ù‹',
    'Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù Ù…Ø·Ù„ÙˆØ¨',
    'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…Ù„Ù'
  ];
  
  if (fileFilterErrors.some(errorText => error.message.includes(errorText))) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'INVALID_FILE',
      allowedTypes: ['JPG', 'JPEG', 'PNG', 'WebP'],
      maxSize: '5MB',
      details: 'ÙŠÙØ³Ù…Ø­ ÙÙ‚Ø· Ø¨Ù…Ù„ÙØ§Øª Ø§Ù„ØµÙˆØ± Ø¨ØµÙŠØºØ© JPG, PNG, WebP ÙˆØ¨Ø­Ø¬Ù… Ø£Ù‚ØµÙ‰ 5 Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª'
    });
  }
  
  // Handle Cloudinary or other upload service errors
  if (error.message.includes('cloudinary') || error.message.includes('upload')) {
    return res.status(500).json({
      success: false,
      error: 'Ø®Ø·Ø£ ÙÙŠ Ø®Ø¯Ù…Ø© Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰',
      code: 'UPLOAD_SERVICE_ERROR',
      details: 'Ù…Ø´ÙƒÙ„Ø© Ù…Ø¤Ù‚ØªØ© ÙÙŠ Ø§Ù„Ø®Ø¯Ù…Ø©'
    });
  }
  
  // Handle network or timeout errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return res.status(408).json({
      success: false,
      error: 'Ø§Ù†ØªÙ‡Øª Ù…Ù‡Ù„Ø© Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰',
      code: 'UPLOAD_TIMEOUT',
      details: 'ØªØ£ÙƒØ¯ Ù…Ù† Ø³Ø±Ø¹Ø© Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª'
    });
  }
  
  // Generic error handling
  return res.status(500).json({
    success: false,
    error: 'Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ ÙÙŠ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù',
    code: 'UNKNOWN_UPLOAD_ERROR',
    details: 'ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø£Ùˆ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ'
  });
};
