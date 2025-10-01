import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Enhanced validation patterns
const patterns = {
  objectId: /^[0-9a-fA-F]{24}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/
};

// Custom Joi extensions for enhanced validation
const customJoi = Joi.extend({
  type: 'richText',
  base: Joi.string(),
  messages: {
    'richText.unsafe': 'المحتوى يحتوي على عناصر غير آمنة',
    'richText.tooLong': 'المحتوى طويل جداً (الحد الأقصى {{limit}} حرف)',
    'richText.empty': 'المحتوى النصي مطلوب'
  },
  rules: {
    sanitize: {
      method() {
        return this.$_addRule('sanitize');
      },
      validate(value, helpers) {
        try {
          // Sanitize HTML content
          const sanitized = DOMPurify.sanitize(value, {
            ALLOWED_TAGS: [
              'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div'
            ],
            ALLOWED_ATTR: [
              'href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target'
            ],
            ALLOW_DATA_ATTR: false
          });

          // Check for dangerous patterns
          const dangerousPatterns = [
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi,
            /<script/gi,
            /<iframe(?![^>]*src\s*=\s*["']https?:\/\/)/gi
          ];

          for (const pattern of dangerousPatterns) {
            if (pattern.test(sanitized)) {
              return helpers.error('richText.unsafe');
            }
          }

          return sanitized;
        } catch (error) {
          return helpers.error('richText.unsafe');
        }
      }
    },
    maxLength: {
      method(limit) {
        return this.$_addRule({ name: 'maxLength', args: { limit } });
      },
      args: [
        {
          name: 'limit',
          ref: true,
          assert: Joi.number().integer().positive().required(),
          message: 'must be a positive integer'
        }
      ],
      validate(value, helpers, args) {
        // Count text content without HTML tags
        const textContent = value.replace(/<[^>]*>/g, '');
        if (textContent.length > args.limit) {
          return helpers.error('richText.tooLong', { limit: args.limit });
        }
        return value;
      }
    }
  }
});

// Enhanced multilingual text schema
const multilingualTextSchema = Joi.object({
  ar: Joi.string().max(1000).allow('').default(''),
  en: Joi.string().max(1000).allow('').default('')
}).required();

// Enhanced rich text schema
const richTextSchema = customJoi.richText().sanitize().maxLength(10000);

// Enhanced image schema with validation
const imageSchema = Joi.object({
  url: Joi.string().pattern(patterns.url).required(),
  alt: multilingualTextSchema.required(),
  caption: multilingualTextSchema,
  width: Joi.number().integer().min(1).max(5000),
  height: Joi.number().integer().min(1).max(5000),
  aspectRatio: Joi.string().valid('16:9', '4:3', '1:1', '3:2', '2:3', 'auto').default('auto'),
  loading: Joi.string().valid('lazy', 'eager').default('lazy'),
  quality: Joi.number().min(1).max(100).default(80),
  format: Joi.string().valid('webp', 'jpg', 'png', 'svg').default('webp'),
  sizes: Joi.object({
    thumbnail: Joi.string().pattern(patterns.url),
    small: Joi.string().pattern(patterns.url),
    medium: Joi.string().pattern(patterns.url),
    large: Joi.string().pattern(patterns.url)
  }).default({})
});

// Enhanced form field schema
const formFieldSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/).required(),
  type: Joi.string().valid(
    'text', 'email', 'tel', 'url', 'number', 'password',
    'textarea', 'select', 'multiselect', 'checkbox', 'radio',
    'date', 'time', 'datetime-local', 'file', 'hidden'
  ).required(),
  label: multilingualTextSchema.required(),
  placeholder: multilingualTextSchema,
  helpText: multilingualTextSchema,
  required: Joi.boolean().default(false),
  disabled: Joi.boolean().default(false),
  readonly: Joi.boolean().default(false),
  validation: Joi.object({
    min: Joi.number(),
    max: Joi.number(),
    minLength: Joi.number().integer().min(0),
    maxLength: Joi.number().integer().min(0),
    pattern: Joi.string(),
    message: multilingualTextSchema,
    custom: Joi.string() // Custom validation function name
  }).default({}),
  options: Joi.array().items(
    Joi.object({
      value: Joi.string().required(),
      label: multilingualTextSchema.required(),
      disabled: Joi.boolean().default(false)
    })
  ).when('type', {
    is: Joi.string().valid('select', 'multiselect', 'radio'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  conditional: Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().valid('equals', 'not_equals', 'contains', 'not_contains').required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()).required()
  }),
  repeater: Joi.object({
    minItems: Joi.number().integer().min(0).default(0),
    maxItems: Joi.number().integer().min(1).default(10),
    fields: Joi.array().items(Joi.link('#formField')).required()
  }).when('type', {
    is: 'repeater',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
}).id('formField');

// Enhanced section data schemas
const enhancedSectionDataSchemas = {
  text: Joi.object({
    content: multilingualTextSchema.required(),
    alignment: Joi.string().valid('left', 'center', 'right', 'justify').default('right'),
    fontSize: Joi.string().valid('xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl').default('base'),
    fontWeight: Joi.string().valid('normal', 'medium', 'semibold', 'bold').default('normal'),
    color: Joi.string().pattern(patterns.color),
    backgroundColor: Joi.string().pattern(patterns.color),
    padding: Joi.object({
      top: Joi.number().min(0).max(100).default(0),
      right: Joi.number().min(0).max(100).default(0),
      bottom: Joi.number().min(0).max(100).default(0),
      left: Joi.number().min(0).max(100).default(0)
    }).default({})
  }),

  richText: Joi.object({
    content: Joi.object({
      ar: richTextSchema.required(),
      en: richTextSchema.required()
    }).required(),
    title: multilingualTextSchema,
    subtitle: multilingualTextSchema,
    theme: Joi.string().valid('default', 'primary', 'secondary', 'accent').default('default'),
    maxWidth: Joi.string().valid('sm', 'md', 'lg', 'xl', '2xl', 'full').default('full')
  }),

  image: imageSchema,

  gallery: Joi.object({
    images: Joi.array().items(imageSchema).min(1).max(50).required(),
    layout: Joi.string().valid('grid', 'carousel', 'masonry', 'slider').default('grid'),
    columns: Joi.number().integer().min(1).max(6).default(3),
    gap: Joi.number().min(0).max(50).default(16),
    showCaptions: Joi.boolean().default(true),
    lightbox: Joi.boolean().default(true),
    autoplay: Joi.boolean().default(false).when('layout', {
      is: 'carousel',
      then: Joi.boolean(),
      otherwise: Joi.forbidden()
    }),
    autoplayDelay: Joi.number().min(1000).max(10000).default(3000)
  }),

  form: Joi.object({
    id: Joi.string().required(),
    title: multilingualTextSchema,
    description: multilingualTextSchema,
    fields: Joi.array().items(formFieldSchema).min(1).max(50).required(),
    submitButton: Joi.object({
      text: multilingualTextSchema.required(),
      style: Joi.string().valid('primary', 'secondary', 'outline').default('primary'),
      size: Joi.string().valid('sm', 'md', 'lg').default('md'),
      fullWidth: Joi.boolean().default(false)
    }).required(),
    settings: Joi.object({
      method: Joi.string().valid('POST', 'GET').default('POST'),
      action: Joi.string().pattern(patterns.url).required(),
      enctype: Joi.string().valid('application/x-www-form-urlencoded', 'multipart/form-data').default('application/x-www-form-urlencoded'),
      target: Joi.string().valid('_self', '_blank').default('_self'),
      validation: Joi.object({
        clientSide: Joi.boolean().default(true),
        serverSide: Joi.boolean().default(true),
        realTime: Joi.boolean().default(true)
      }).default({})
    }).required(),
    notifications: Joi.object({
      success: multilingualTextSchema,
      error: multilingualTextSchema,
      email: Joi.object({
        to: Joi.string().pattern(patterns.email),
        subject: multilingualTextSchema,
        template: Joi.string()
      })
    }).default({})
  }),

  video: Joi.object({
    url: Joi.string().pattern(patterns.url).required(),
    type: Joi.string().valid('youtube', 'vimeo', 'direct', 'embed').required(),
    thumbnail: Joi.string().pattern(patterns.url),
    title: multilingualTextSchema,
    description: multilingualTextSchema,
    autoplay: Joi.boolean().default(false),
    controls: Joi.boolean().default(true),
    muted: Joi.boolean().default(false),
    loop: Joi.boolean().default(false),
    aspectRatio: Joi.string().valid('16:9', '4:3', '1:1', '21:9').default('16:9'),
    quality: Joi.string().valid('auto', '240p', '360p', '480p', '720p', '1080p').default('auto')
  }),

  embed: Joi.object({
    code: Joi.string().max(10000).required(),
    type: Joi.string().valid('iframe', 'script', 'html', 'widget').required(),
    width: Joi.string().default('100%'),
    height: Joi.string().default('400px'),
    sandbox: Joi.array().items(
      Joi.string().valid(
        'allow-forms', 'allow-modals', 'allow-orientation-lock',
        'allow-pointer-lock', 'allow-popups', 'allow-same-origin',
        'allow-scripts', 'allow-top-navigation'
      )
    ).when('type', {
      is: 'iframe',
      then: Joi.array(),
      otherwise: Joi.forbidden()
    }),
    security: Joi.object({
      allowedDomains: Joi.array().items(Joi.string().hostname()),
      blockScripts: Joi.boolean().default(true),
      sanitize: Joi.boolean().default(true)
    }).default({})
  }),

  cta: Joi.object({
    title: multilingualTextSchema.required(),
    description: multilingualTextSchema,
    buttons: Joi.array().items(
      Joi.object({
        text: multilingualTextSchema.required(),
        url: Joi.string().pattern(patterns.url).required(),
        style: Joi.string().valid('primary', 'secondary', 'outline', 'ghost').default('primary'),
        size: Joi.string().valid('sm', 'md', 'lg').default('md'),
        icon: Joi.string(),
        target: Joi.string().valid('_self', '_blank').default('_self'),
        tracking: Joi.object({
          event: Joi.string(),
          category: Joi.string(),
          label: Joi.string()
        })
      })
    ).min(1).max(3).required(),
    background: Joi.object({
      type: Joi.string().valid('color', 'gradient', 'image').default('color'),
      value: Joi.string().required(),
      overlay: Joi.object({
        color: Joi.string().pattern(patterns.color),
        opacity: Joi.number().min(0).max(1).default(0.5)
      })
    }),
    layout: Joi.string().valid('horizontal', 'vertical', 'card').default('horizontal')
  }),

  custom: Joi.object().unknown(true).max(100) // Limited custom data
};

// Enhanced section schema
export const enhancedSectionSchema = Joi.object({
  id: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required(),
  type: Joi.string().valid(...Object.keys(enhancedSectionDataSchemas)).required(),
  data: Joi.when('type', {
    switch: Object.keys(enhancedSectionDataSchemas).map(type => ({
      is: type,
      then: enhancedSectionDataSchemas[type]
    })),
    otherwise: Joi.object().unknown(true).max(50)
  }).required(),
  order: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
  visibility: Joi.object({
    desktop: Joi.boolean().default(true),
    tablet: Joi.boolean().default(true),
    mobile: Joi.boolean().default(true),
    conditions: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('user_role', 'date_range', 'device', 'location').required(),
        value: Joi.alternatives().try(Joi.string(), Joi.object()).required()
      })
    ).default([])
  }).default({}),
  settings: Joi.object({
    animation: Joi.object({
      type: Joi.string().valid('fade', 'slide', 'zoom', 'none').default('none'),
      duration: Joi.number().min(100).max(2000).default(500),
      delay: Joi.number().min(0).max(2000).default(0),
      easing: Joi.string().valid('ease', 'ease-in', 'ease-out', 'ease-in-out').default('ease')
    }).default({}),
    spacing: Joi.object({
      marginTop: Joi.number().min(0).max(200).default(0),
      marginBottom: Joi.number().min(0).max(200).default(0),
      paddingTop: Joi.number().min(0).max(200).default(0),
      paddingBottom: Joi.number().min(0).max(200).default(0)
    }).default({}),
    background: Joi.object({
      type: Joi.string().valid('none', 'color', 'gradient', 'image').default('none'),
      value: Joi.string(),
      attachment: Joi.string().valid('scroll', 'fixed').default('scroll'),
      position: Joi.string().valid('center', 'top', 'bottom', 'left', 'right').default('center'),
      size: Joi.string().valid('auto', 'cover', 'contain').default('cover')
    }).default({})
  }).default({})
});

// Enhanced metadata schema with SEO
export const enhancedMetadataSchema = Joi.object({
  title: multilingualTextSchema.required(),
  description: multilingualTextSchema.required(),
  keywords: Joi.array().items(Joi.string().max(50)).max(20).default([]),
  ogImage: Joi.string().pattern(patterns.url).allow(''),
  ogType: Joi.string().valid('website', 'article', 'product').default('website'),
  canonicalUrl: Joi.string().pattern(patterns.url).allow(''),
  robots: Joi.string().valid(
    'index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'
  ).default('index,follow'),
  schema: Joi.object().unknown(true).default({}), // JSON-LD structured data
  hreflang: Joi.object({
    ar: Joi.string().pattern(patterns.url),
    en: Joi.string().pattern(patterns.url)
  }).default({}),
  priority: Joi.number().min(0).max(1).default(0.5),
  changeFreq: Joi.string().valid(
    'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
  ).default('weekly')
});

// Enhanced content schema
export const enhancedContentSchema = Joi.object({
  sections: Joi.array().items(enhancedSectionSchema).max(100).default([]),
  metadata: enhancedMetadataSchema.required(),
  settings: Joi.object({
    layout: Joi.string().valid('default', 'wide', 'full', 'boxed').default('default'),
    theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
    rtl: Joi.boolean().default(true),
    animations: Joi.boolean().default(true),
    lazyLoading: Joi.boolean().default(true)
  }).default({}),
  legacy: Joi.object().unknown(true).max(50).default({})
});

// Enhanced validation and security
export const enhancedValidationSchema = Joi.object({
  isValid: Joi.boolean().default(true),
  errors: Joi.array().items(
    Joi.object({
      field: Joi.string().required(),
      message: Joi.string().required(),
      severity: Joi.string().valid('error', 'warning', 'info').default('error'),
      code: Joi.string(),
      context: Joi.object().unknown(true)
    })
  ).default([]),
  warnings: Joi.array().items(
    Joi.object({
      field: Joi.string().required(),
      message: Joi.string().required(),
      suggestion: Joi.string()
    })
  ).default([]),
  performance: Joi.object({
    score: Joi.number().min(0).max(100),
    metrics: Joi.object({
      loadTime: Joi.number().min(0),
      imageOptimization: Joi.number().min(0).max(100),
      seoScore: Joi.number().min(0).max(100),
      accessibilityScore: Joi.number().min(0).max(100)
    })
  }).default({}),
  lastValidated: Joi.date().default(() => new Date()),
  validatedBy: Joi.string().pattern(patterns.objectId)
});

// Enhanced page content schema
export const enhancedPageContentSchema = Joi.object({
  pageType: Joi.string().valid(
    'homepage', 'about', 'howToOrder', 'policies', 
    'hero', 'foundational', 'services', 'contact',
    'blog', 'product', 'category', 'landing'
  ).required(),
  content: enhancedContentSchema.required(),
  version: Joi.number().integer().min(1).default(1),
  isActive: Joi.boolean().default(true),
  status: Joi.string().valid('draft', 'review', 'published', 'archived').default('draft'),
  publishedAt: Joi.date().when('status', {
    is: 'published',
    then: Joi.date().required(),
    otherwise: Joi.date().allow(null)
  }),
  scheduledAt: Joi.date().greater('now'),
  expiresAt: Joi.date(),
  createdBy: Joi.string().pattern(patterns.objectId).required(),
  lastModifiedBy: Joi.string().pattern(patterns.objectId),
  reviewedBy: Joi.string().pattern(patterns.objectId),
  tags: Joi.array().items(Joi.string().max(30)).max(10).default([]),
  categories: Joi.array().items(Joi.string().max(50)).max(5).default([]),
  analytics: Joi.object({
    views: Joi.number().integer().min(0).default(0),
    uniqueViews: Joi.number().integer().min(0).default(0),
    lastViewed: Joi.date().allow(null),
    avgLoadTime: Joi.number().min(0).default(0),
    bounceRate: Joi.number().min(0).max(100).default(0),
    conversionRate: Joi.number().min(0).max(100).default(0),
    socialShares: Joi.object({
      facebook: Joi.number().integer().min(0).default(0),
      twitter: Joi.number().integer().min(0).default(0),
      linkedin: Joi.number().integer().min(0).default(0),
      whatsapp: Joi.number().integer().min(0).default(0)
    }).default({})
  }).default({}),
  validation: enhancedValidationSchema.default({})
});

// File upload validation schema
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'text/plain', 'application/json'
  ).required(),
  size: Joi.number().max(50 * 1024 * 1024), // 50MB max
  destination: Joi.string(),
  filename: Joi.string(),
  path: Joi.string(),
  buffer: Joi.binary()
});

// Bulk operation schema with enhanced security
export const enhancedBulkOperationSchema = Joi.object({
  operation: Joi.string().valid(
    'publish', 'unpublish', 'archive', 'delete', 'duplicate', 
    'export', 'backup', 'validate', 'optimize'
  ).required(),
  targets: Joi.object({
    pageTypes: Joi.array().items(Joi.string()).max(20),
    ids: Joi.array().items(Joi.string().pattern(patterns.objectId)).max(100),
    filters: Joi.object({
      status: Joi.string().valid('draft', 'review', 'published', 'archived'),
      dateRange: Joi.object({
        start: Joi.date(),
        end: Joi.date().greater(Joi.ref('start'))
      }),
      tags: Joi.array().items(Joi.string()),
      categories: Joi.array().items(Joi.string())
    })
  }).required(),
  options: Joi.object({
    preserveVersions: Joi.boolean().default(true),
    notifyUsers: Joi.boolean().default(false),
    createBackup: Joi.boolean().default(true),
    dryRun: Joi.boolean().default(false)
  }).default({}),
  confirmation: Joi.object({
    acknowledged: Joi.boolean().valid(true).required(),
    adminId: Joi.string().pattern(patterns.objectId).required(),
    timestamp: Joi.date().required()
  }).required()
});

export default {
  enhancedPageContentSchema,
  enhancedContentSchema,
  enhancedSectionSchema,
  enhancedMetadataSchema,
  enhancedValidationSchema,
  fileUploadSchema,
  enhancedBulkOperationSchema,
  patterns
};