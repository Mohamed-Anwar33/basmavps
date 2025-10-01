import Joi from 'joi';

// Multilingual text schema
const multilingualTextSchema = Joi.object({
  ar: Joi.string().required().messages({
    'string.empty': 'النص العربي مطلوب',
    'any.required': 'النص العربي مطلوب'
  }),
  en: Joi.string().required().messages({
    'string.empty': 'النص الإنجليزي مطلوب',
    'any.required': 'النص الإنجليزي مطلوب'
  })
});

// Optional multilingual text schema
const optionalMultilingualTextSchema = Joi.object({
  ar: Joi.string().allow(''),
  en: Joi.string().allow('')
});

// CTA Button schema
const ctaButtonSchema = Joi.object({
  text: multilingualTextSchema,
  link: Joi.string().uri().required().messages({
    'string.uri': 'رابط غير صحيح',
    'any.required': 'الرابط مطلوب'
  }),
  style: Joi.string().valid('primary', 'secondary', 'outline').default('primary'),
  isExternal: Joi.boolean().default(false)
});

// Optional CTA Button schema
const optionalCtaButtonSchema = Joi.object({
  text: optionalMultilingualTextSchema.optional(),
  link: Joi.string().allow('').optional(),
  style: Joi.string().valid('primary', 'secondary', 'outline').default('primary'),
  isExternal: Joi.boolean().default(false)
}).optional();

// Image schema
const imageSchema = Joi.object({
  url: Joi.string().uri().allow(''),
  alt: Joi.string().allow(''),
  cloudinaryId: Joi.string().allow('')
});

// Feature schema
const featureSchema = Joi.object({
  text: multilingualTextSchema
});

// Create banner validation schema
const createBannerSchema = Joi.object({
  // Basic Information
  title: multilingualTextSchema,
  subtitle: optionalMultilingualTextSchema.optional(),
  description: optionalMultilingualTextSchema.optional(),

  // Banner Type and Position
  type: Joi.string().valid('basic', 'page', 'luxury', 'promo', 'settings').default('basic'),
  position: Joi.string().valid('top', 'middle', 'bottom', 'hero', 'footer').required().messages({
    'any.required': 'موقع البنر مطلوب',
    'any.only': 'موقع البنر غير صحيح'
  }),
  pageSlug: Joi.string().required().messages({
    'any.required': 'رمز الصفحة مطلوب'
  }),

  // Visual Elements
  image: imageSchema.optional(),
  backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#4b2e83').messages({
    'string.pattern.base': 'لون الخلفية يجب أن يكون بصيغة hex صحيحة'
  }),
  textColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#ffffff').messages({
    'string.pattern.base': 'لون النص يجب أن يكون بصيغة hex صحيحة'
  }),
  variant: Joi.string().valid('primary', 'secondary', 'accent', 'gradient', 'services', 'about', 'blog', 'contact', 'portfolio').default('primary'),
  size: Joi.string().valid('sm', 'md', 'lg').default('md'),

  // Interactive Elements
  ctaButton: optionalCtaButtonSchema.optional(),
  secondaryCtaButton: optionalCtaButtonSchema.optional(),

  // Advanced Features
  features: Joi.array().items(featureSchema).optional(),
  iconType: Joi.string().valid('sparkles', 'star', 'zap', 'crown', 'gem', 'target', 'lightbulb').default('sparkles'),
  backgroundPattern: Joi.string().valid('dots', 'waves', 'geometric', 'luxury').default('luxury'),

  // Display Settings
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
  showIcon: Joi.boolean().default(true),

  // Scheduling
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional().messages({
    'date.greater': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية'
  })
});

// Update banner validation schema - very permissive for updates
const updateBannerSchema = Joi.object().unknown(true);

// Banner order update schema
const updateBannerOrderSchema = Joi.object({
  banners: Joi.array().items(
    Joi.object({
      id: Joi.string().required().messages({
        'any.required': 'معرف البنر مطلوب'
      }),
      order: Joi.number().integer().min(0).optional()
    })
  ).required().messages({
    'any.required': 'قائمة البنرات مطلوبة'
  })
});

// Query parameters validation schema
const getBannersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  pageSlug: Joi.string().optional(),
  position: Joi.string().valid('top', 'middle', 'bottom', 'hero', 'footer').optional(),
  type: Joi.string().valid('basic', 'page', 'luxury', 'promo', 'settings').optional(),
  isActive: Joi.string().valid('true', 'false').optional(),
  lang: Joi.string().valid('ar', 'en').default('ar')
});

export {
  createBannerSchema,
  updateBannerSchema,
  updateBannerOrderSchema,
  getBannersQuerySchema
};
