import { body, param, query, validationResult } from 'express-validator';
import { z } from 'zod';

/**
 * Validation middleware and schemas
 */

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Zod validation middleware
export const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      next(error);
    }
  };
};

// Auth validation rules
export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

// Service validation schemas
export const serviceSchema = z.object({
  title: z.object({
    ar: z.string().min(1).max(200),
    en: z.string().min(1).max(200)
  }),
  slug: z.string().min(1).max(100).regex(/^[\u0600-\u06FFa-zA-Z0-9\-_\s]+$/).optional(),
  description: z.object({
    ar: z.string().min(1).max(2000),
    en: z.string().min(1).max(2000)
  }),
  price: z.object({
    SAR: z.number().min(0),
    USD: z.number().min(0)
  }),
  durationDays: z.number().min(0).max(365).default(7),
  category: z.string().min(1).max(50),
  images: z.array(z.string().url()).optional(),
  mainImages: z.array(z.union([
    z.string().url(),
    z.object({
      url: z.string().url(),
      alt: z.string().max(200).optional(),
      order: z.number().min(0).default(0),
      uploadedAt: z.date().optional(),
      uploadedBy: z.string().optional()
    })
  ])).optional(),
  portfolioImages: z.array(z.union([
    z.string().url(),
    z.object({
      url: z.string().url(),
      alt: z.string().max(200).optional(),
      order: z.number().min(0).default(0),
      uploadedAt: z.date().optional(),
      uploadedBy: z.string().optional()
    })
  ])).optional(),
  features: z.object({
    ar: z.array(z.string().max(100)).optional(),
    en: z.array(z.string().max(100)).optional()
  }).optional(),
  deliveryLinks: z.array(z.string().url()).optional(),
  deliveryFormats: z.array(z.string()).optional(),
  deliveryTime: z.object({
    min: z.number().min(0).default(1),
    max: z.number().min(0).default(7)
  }).optional(),
  revisions: z.number().min(0).default(2),
  digitalDelivery: z.object({
    type: z.enum(['links', 'instant']),
    links: z.array(z.object({
      title: z.string().optional(),
      url: z.string().optional(),
      imageUrl: z.string().optional(),
      locale: z.enum(['ar', 'en', 'mixed']).optional(),
      tags: z.array(z.string()).optional()
    })).optional()
  }).optional(),
  uiTexts: z.object({
    // Ù†Ø¨Ø°Ø© Ù…Ø®ØªØµØ±Ø© (ØªØ¸Ù‡Ø± ÙÙŠ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„ØµÙØ­Ø©)
    shortDescription: z.string().max(500).optional(),
    
    // Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø¹Ù…Ù„ (Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø§Ù„ØªÙŠ Ù†ØªØ¨Ø¹Ù‡Ø§ ÙÙŠ ØªÙ†ÙÙŠØ° Ø§Ù„Ø®Ø¯Ù…Ø©)
    workSteps: z.array(z.object({
      title: z.string().max(100),
      desc: z.string().max(300)
    })).optional(),
    
    // Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ù„Ø®Ø¯Ù…Ø© (ØªØ¸Ù‡Ø± ÙÙŠ Timeline)
    customFeatures: z.array(z.object({
      icon: z.string().max(10).optional(),
      color: z.enum(['pink', 'blue', 'green', 'purple', 'orange', 'red', 'teal', 'indigo']).default('blue'),
      title: z.string().max(100),
      desc: z.string().max(300)
    })).optional(),
    
    // Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø© Ù…Ø³Ø¨Ù‚Ø§Ù‹
    qualityTitle: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    qualitySubtitle: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    detailsTitle: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    details: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    noticeTitle: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    notice: z.object({
      ar: z.string().optional(),
      en: z.string().optional()
    }).optional(),
    detailsPoints: z.array(z.string()).optional(),
    qualityPoints: z.array(z.string()).optional(),
    noticePoints: z.array(z.string()).optional()
  }).optional(),
  originalPrice: z.object({
    SAR: z.number().min(0).optional(),
    USD: z.number().min(0).optional()
  }).optional(),
  nonRefundable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
  meta: z.object({
    seo: z.object({
      title: z.object({
        ar: z.string().optional(),
        en: z.string().optional()
      }).optional(),
      description: z.object({
        ar: z.string().optional(),
        en: z.string().optional()
      }).optional(),
      keywords: z.array(z.string()).optional()
    }).optional(),
    tags: z.array(z.string()).optional()
  }).optional()
}).passthrough();

// Blog validation schema
const multilingualOrString = z.union([
  z.string().min(1),
  z.object({
    ar: z.string().min(1).optional(),
    en: z.string().min(1).optional()
  })
]);

export const blogSchema = z.object({
  title: z.union([
    z.string().min(1).max(200),
    z.object({ ar: z.string().min(1).max(200), en: z.string().min(1).max(200) })
  ]),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.union([
    z.string().max(300),
    z.object({ ar: z.string().max(300).optional(), en: z.string().max(300).optional() })
  ]).optional(),
  content: multilingualOrString.optional(),
  category: z.string().max(100).optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.union([
    z.array(z.string().max(50)),
    z.string().max(500)
  ]).optional(),
  meta: z.object({
    seo: z.object({
      title: z.object({
        ar: z.string().optional(),
        en: z.string().optional()
      }).optional(),
      description: z.object({
        ar: z.string().optional(),
        en: z.string().optional()
      }).optional(),
      keywords: z.array(z.string()).optional()
    }).optional(),
    featured: z.boolean().default(false),
    allowComments: z.boolean().default(true)
  }).optional()
});

// FAQ validation schema
export const faqSchema = z.object({
  question: z.object({
    ar: z.string().min(1).max(300),
    en: z.string().min(1).max(300)
  }),
  answer: z.object({
    ar: z.string().min(1).max(1000),
    en: z.string().min(1).max(1000)
  }),
  category: z.enum(['general', 'services', 'payment', 'delivery', 'support']).default('general'),
  order: z.number().default(0),
  isActive: z.boolean().default(true)
});

// Order validation schema
export const orderSchema = z.object({
  items: z.array(z.object({
    serviceId: z.string().min(1),
    quantity: z.number().min(1).default(1)
  })).min(1),
  guestInfo: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional()
  }).optional(),
  currency: z.enum(['SAR', 'USD']).default('SAR'),
  notes: z.string().max(500).optional(),
  description: z.string().min(1).max(1000).optional(),
  additionalNotes: z.string().max(500).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    url: z.string().url(),
    cloudinaryId: z.string(),
    fileType: z.enum(['image', 'document', 'pdf']),
    size: z.number(),
    uploadedAt: z.union([z.string(), z.date()]).optional()
  })).max(5).optional()
}).passthrough();

// Contact validation schema
export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(2000)
});

// Validation schemas using Zod
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers')
});

// Checkout email verification (OTP) schemas
export const checkoutSendCodeSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().max(100).optional()
});

export const checkoutVerifyCodeSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers')
});

// Setting validation schema
export const settingSchema = z.object({
  key: z.string().min(1).max(100),
  category: z.enum(['home', 'about', 'footer', 'policies', 'hero', 'contact', 'general']),
  value: z.any(),
  lang: z.enum(['ar', 'en', 'both']).default('both'),
  isActive: z.boolean().default(true),
  meta: z.object({
    description: z.string().optional()
  }).optional()
});

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors
];

// Slug validation - Updated to support Arabic characters and MongoDB ObjectIds
export const validateSlug = (paramName = 'slug') => [
  param(paramName)
    .custom((value) => {
      // Allow MongoDB ObjectId format (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(value)) {
        return true;
      }
      
      // Allow slugs with Arabic characters, English letters, numbers, hyphens, and underscores
      // Arabic Unicode range: \u0600-\u06FF
      if (/^[\u0600-\u06FFa-zA-Z0-9\-_\s]+$/.test(value)) {
        return true;
      }
      
      throw new Error(`Invalid ${paramName} format`);
    }),
  handleValidationErrors
];

// Image upload security validation
export const validateImageUploadRequest = [
  param('id')
    .isMongoId()
    .withMessage('Ù…Ø¹Ø±Ù Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± ØµØ­ÙŠØ­'),
  body('alt')
    .optional()
    .isString()
    .withMessage('Ù†Øµ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ„ ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ù†Øµ')
    .isLength({ max: 200 })
    .withMessage('Ù†Øµ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ„ Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 200 Ø­Ø±Ù)')
    .custom((altText) => {
      if (altText) {
        // Check for suspicious content
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /<iframe/i,
          /<object/i,
          /<embed/i
        ];
        if (suspiciousPatterns.some(pattern => pattern.test(altText))) {
          throw new Error('Ù†Øµ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ„ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ù…Ø­ØªÙˆÙ‰ ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­');
        }
      }
      return true;
    }),
  handleValidationErrors
];

// Image deletion security validation
export const validateImageDeletion = [
  param('id')
    .isMongoId()
    .withMessage('Ù…Ø¹Ø±Ù Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± ØµØ­ÙŠØ­'),
  param('imageId')
    .isMongoId()
    .withMessage('Ù…Ø¹Ø±Ù Ø§Ù„ØµÙˆØ±Ø© ØºÙŠØ± ØµØ­ÙŠØ­'),
  handleValidationErrors
];

// Image reorder security validation
export const validateImageReorder = [
  param('id')
    .isMongoId()
    .withMessage('Ù…Ø¹Ø±Ù Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± ØµØ­ÙŠØ­'),
  body('imageIds')
    .isArray({ min: 1 })
    .withMessage('Ù‚Ø§Ø¦Ù…Ø© Ù…Ø¹Ø±ÙØ§Øª Ø§Ù„ØµÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø©')
    .custom((imageIds) => {
      // Check if all items are valid MongoDB ObjectIds
      for (const imageId of imageIds) {
        if (!/^[0-9a-fA-F]{24}$/.test(imageId)) {
          throw new Error('Ù…Ø¹Ø±Ù ØµÙˆØ±Ø© ØºÙŠØ± ØµØ­ÙŠØ­ ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©');
        }
      }
      // Check for duplicates
      const uniqueIds = new Set(imageIds);
      if (uniqueIds.size !== imageIds.length) {
        throw new Error('ÙŠÙˆØ¬Ø¯ Ù…Ø¹Ø±ÙØ§Øª ØµÙˆØ± Ù…ÙƒØ±Ø±Ø© ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©');
      }
      // Limit maximum number of images
      if (imageIds.length > 50) {
        throw new Error('Ø¹Ø¯Ø¯ Ø§Ù„ØµÙˆØ± ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 50 ØµÙˆØ±Ø©)');
      }
      return true;
    }),
  handleValidationErrors
];

// Admin validation schemas
export const adminSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'super_admin', 'moderator']).default('admin'),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

export const passwordChangeSchema = z.object({
  newPassword: z.string().min(8).max(100)
});

export const adminStatusSchema = z.object({
  isActive: z.boolean()
});

