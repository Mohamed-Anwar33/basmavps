import Joi from 'joi';
import { 
  pageContentSchema, 
  updatePageContentSchema,
  addSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  bulkOperationSchema,
  validateContentSchema
} from '../validation/contentSchemas.js';
import {
  enhancedPageContentSchema,
  enhancedContentSchema,
  enhancedSectionSchema,
  enhancedBulkOperationSchema
} from '../validation/enhancedContentSchemas.js';
import {
  sanitizeContent,
  xssProtection,
  validateContentSize,
  contentRateLimit
} from './securityValidation.js';

/**
 * Content validation middleware factory
 */
export const validateContent = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      allowUnknown: false
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: validationErrors,
        errorCount: validationErrors.length
      });
    }

    // Attach validated data to request
    req.validatedData = value;
    next();
  };
};

/**
 * Validate page type parameter
 */
export const validatePageType = (req, res, next) => {
  const { pageType } = req.params;
  
  const validPageTypes = [
    'homepage', 'about', 'howToOrder', 'how-to-order', 'policies', 
    'hero', 'foundational', 'services', 'contact'
  ];

  if (!validPageTypes.includes(pageType)) {
    return res.status(400).json({
      success: false,
      message: 'Ù†ÙˆØ¹ Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± ØµØ­ÙŠØ­',
      validTypes: validPageTypes
    });
  }

  next();
};

/**
 * Validate section ID parameter
 */
export const validateSectionId = (req, res, next) => {
  const { sectionId } = req.params;
  
  if (!sectionId || typeof sectionId !== 'string' || sectionId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Ù…Ø¹Ø±Ù Ø§Ù„Ù‚Ø³Ù… Ù…Ø·Ù„ÙˆØ¨'
    });
  }

  next();
};

/**
 * Validate version parameter
 */
export const validateVersion = (req, res, next) => {
  const { version } = req.params;
  
  const versionNumber = parseInt(version);
  
  if (isNaN(versionNumber) || versionNumber < 1) {
    return res.status(400).json({
      success: false,
      message: 'Ø±Ù‚Ù… Ø§Ù„Ø¥ØµØ¯Ø§Ø± ØºÙŠØ± ØµØ­ÙŠØ­'
    });
  }

  req.params.version = versionNumber;
  next();
};

/**
 * Validate query parameters for content search
 */
export const validateContentQuery = (req, res, next) => {
  const querySchema = Joi.object({
    query: Joi.string().allow('').max(100),
    pageType: Joi.string().valid(
      'homepage', 'about', 'howToOrder', 'how-to-order', 'policies', 
      'hero', 'foundational', 'services', 'contact'
    ),
    status: Joi.string().valid('draft', 'published', 'archived'),
    isActive: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('lastModified', 'createdAt', 'pageType', 'status', 'version').default('lastModified'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    includeVersions: Joi.boolean().default(false),
    includeValidation: Joi.boolean().default(true)
  });

  const { error, value } = querySchema.validate(req.query, {
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¨Ø­Ø« ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
      errors: error.details.map(d => d.message)
    });
  }

  req.query = value;
  next();
};

/**
 * Content security validation
 */
export const validateContentSecurity = (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next();
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*src\s*=\s*["'](?!https?:\/\/)/gi
  ];

  const contentString = JSON.stringify(content);
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(contentString)) {
      return res.status(400).json({
        success: false,
        message: 'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø¹Ù†Ø§ØµØ± ØºÙŠØ± Ø¢Ù…Ù†Ø©',
        code: 'UNSAFE_CONTENT'
      });
    }
  }

  next();
};

/**
 * Rate limiting for content operations
 */
export const rateLimitContent = (req, res, next) => {
  // Simple rate limiting based on admin ID
  const adminId = req.admin?.id;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  if (!global.contentRateLimit) {
    global.contentRateLimit = new Map();
  }

  const userRequests = global.contentRateLimit.get(adminId) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø§Ù„Ø·Ù„Ø¨Ø§Øª',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  recentRequests.push(now);
  global.contentRateLimit.set(adminId, recentRequests);

  next();
};

// Enhanced validation middleware with security
export const validateContentWithSecurity = (schema) => {
  return [
    rateLimitContent,
    validateContentSize(), // Call factory function with default params
    sanitizeContent,
    xssProtection,
    validateContent(schema)
  ];
};

// Export specific validation middlewares
export const validatePageContentCreate = validateContent(pageContentSchema);
export const validatePageContentUpdate = validateContent(updatePageContentSchema);
export const validateAddSection = validateContent(addSectionSchema);
export const validateUpdateSection = validateContent(updateSectionSchema);
export const validateReorderSections = validateContent(reorderSectionsSchema);
export const validateBulkOperation = validateContent(bulkOperationSchema);
export const validateContentValidation = validateContent(validateContentSchema);

// Enhanced validation middlewares
export const validateEnhancedPageContentCreate = validateContentWithSecurity(enhancedPageContentSchema);
export const validateEnhancedPageContentUpdate = validateContentWithSecurity(enhancedContentSchema);
export const validateEnhancedSection = validateContentWithSecurity(enhancedSectionSchema);
export const validateEnhancedBulkOperation = validateContentWithSecurity(enhancedBulkOperationSchema);
