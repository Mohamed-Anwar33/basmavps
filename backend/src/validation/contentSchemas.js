import Joi from 'joi';

// Section data validation schemas based on section type
const sectionDataSchemas = {
  text: Joi.object({
    content: Joi.string().required(),
    alignment: Joi.string().valid('left', 'center', 'right').default('left'),
    fontSize: Joi.string().valid('small', 'medium', 'large').default('medium')
  }),
  
  richText: Joi.object({
    content: Joi.string().required(),
    title: Joi.string().allow(''),
    subtitle: Joi.string().allow(''),
    formatting: Joi.object({
      bold: Joi.boolean().default(false),
      italic: Joi.boolean().default(false),
      underline: Joi.boolean().default(false)
    }).default({})
  }),
  
  hero: Joi.object().unknown(true), // Allow any structure for hero sections
  steps: Joi.object().unknown(true), // Allow any structure for steps sections
  notes: Joi.object().unknown(true), // Allow any structure for notes sections
  cta: Joi.object().unknown(true), // Allow any structure for CTA sections
  
  image: Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().required(),
    caption: Joi.string().allow(''),
    width: Joi.number().positive(),
    height: Joi.number().positive(),
    aspectRatio: Joi.string().valid('16:9', '4:3', '1:1', 'auto').default('auto')
  }),
  
  gallery: Joi.object({
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().required(),
        caption: Joi.string().allow('')
      })
    ).min(1).required(),
    layout: Joi.string().valid('grid', 'carousel', 'masonry').default('grid'),
    columns: Joi.number().min(1).max(6).default(3)
  }),
  
  form: Joi.object({
    fields: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio').required(),
        label: Joi.object({
          ar: Joi.string().required(),
          en: Joi.string().required()
        }).required(),
        required: Joi.boolean().default(false),
        placeholder: Joi.object({
          ar: Joi.string().allow(''),
          en: Joi.string().allow('')
        }),
        options: Joi.array().items(Joi.string()).when('type', {
          is: Joi.string().valid('select', 'radio'),
          then: Joi.required(),
          otherwise: Joi.optional()
        })
      })
    ).required(),
    submitButton: Joi.object({
      text: Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required()
      }).required(),
      action: Joi.string().uri().required()
    }).required()
  }),
  
  video: Joi.object({
    url: Joi.string().uri().required(),
    type: Joi.string().valid('youtube', 'vimeo', 'direct').required(),
    thumbnail: Joi.string().uri(),
    title: Joi.string().allow(''),
    autoplay: Joi.boolean().default(false),
    controls: Joi.boolean().default(true)
  }),
  
  embed: Joi.object({
    code: Joi.string().required(),
    type: Joi.string().valid('iframe', 'script', 'html').required(),
    width: Joi.string().default('100%'),
    height: Joi.string().default('400px')
  }),
  
  custom: Joi.object().unknown(true) // Allow any structure for custom sections
};

// Section schema
export const sectionSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid(...Object.keys(sectionDataSchemas)).required(),
  data: Joi.when('type', {
    switch: Object.keys(sectionDataSchemas).map(type => ({
      is: type,
      then: sectionDataSchemas[type]
    })),
    otherwise: Joi.object().unknown(true)
  }).required(),
  order: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
  settings: Joi.object().unknown(true).default({})
});

// Metadata schema
export const metadataSchema = Joi.object({
  title: Joi.object({
    ar: Joi.string().max(60).allow(''),
    en: Joi.string().max(60).allow('')
  }).required(),
  description: Joi.object({
    ar: Joi.string().max(160).allow(''),
    en: Joi.string().max(160).allow('')
  }).required(),
  keywords: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  ogImage: Joi.string().uri().allow(''),
  canonicalUrl: Joi.string().uri().allow(''),
  robots: Joi.string().valid('index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow').default('index,follow')
});

// Content schema
export const contentSchema = Joi.object({
  sections: Joi.array().items(sectionSchema).default([]),
  metadata: metadataSchema.required(),
  legacy: Joi.object().unknown(true).default({})
});

// Analytics schema
export const analyticsSchema = Joi.object({
  views: Joi.number().integer().min(0).default(0),
  lastViewed: Joi.date().allow(null),
  avgLoadTime: Joi.number().min(0).default(0),
  bounceRate: Joi.number().min(0).max(100).default(0)
});

// Validation error schema
export const validationErrorSchema = Joi.object({
  field: Joi.string().required(),
  message: Joi.string().required(),
  severity: Joi.string().valid('error', 'warning', 'info').default('error')
});

// Full PageContent schema
export const pageContentSchema = Joi.object({
  pageType: Joi.string().valid(
    'homepage', 'about', 'howToOrder', 'how-to-order', 'policies', 
    'hero', 'foundational', 'services', 'contact'
  ).required(),
  content: contentSchema.required(),
  version: Joi.number().integer().min(1).default(1),
  isActive: Joi.boolean().default(true),
  status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  publishedAt: Joi.date(),
  createdBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
  lastModifiedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  analytics: analyticsSchema.default({}),
  validation: Joi.object({
    isValid: Joi.boolean().default(true),
    errors: Joi.array().items(validationErrorSchema).default([]),
    lastValidated: Joi.date().default(() => new Date())
  }).default({})
});

// Update PageContent schema (for PUT requests)
export const updatePageContentSchema = Joi.object({
  content: contentSchema,
  isActive: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  analytics: analyticsSchema
}).min(1); // At least one field must be provided

// Section operations schemas
export const addSectionSchema = Joi.object({
  section: sectionSchema.required(),
  position: Joi.number().integer().min(0) // Insert at specific position
});

export const updateSectionSchema = Joi.object({
  sectionId: Joi.string().required(),
  updates: Joi.object({
    type: Joi.string().valid(...Object.keys(sectionDataSchemas)),
    data: Joi.object().unknown(true),
    isActive: Joi.boolean(),
    settings: Joi.object().unknown(true)
  }).min(1).required()
});

export const reorderSectionsSchema = Joi.object({
  sectionOrders: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      order: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
});

// Bulk operations schema
export const bulkOperationSchema = Joi.object({
  operation: Joi.string().valid('publish', 'unpublish', 'archive', 'delete', 'duplicate').required(),
  pageTypes: Joi.array().items(Joi.string()).min(1).required(),
  options: Joi.object().unknown(true).default({})
});

// Search and filter schema
export const searchSchema = Joi.object({
  query: Joi.string().allow(''),
  pageType: Joi.string().valid(
    'homepage', 'about', 'howToOrder', 'how-to-order', 'policies', 
    'hero', 'foundational', 'services', 'contact'
  ),
  status: Joi.string().valid('draft', 'published', 'archived'),
  isActive: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('lastModified', 'createdAt', 'pageType', 'status').default('lastModified'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Content validation schema
export const validateContentSchema = Joi.object({
  pageType: Joi.string().required(),
  content: contentSchema.required()
});

// Export validation middleware
export const validatePageContent = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: validationErrors
      });
    }

    req.validatedData = value;
    next();
  };
};