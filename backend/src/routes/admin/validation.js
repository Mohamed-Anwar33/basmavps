import express from 'express';
import multer from 'multer';
import validationController from '../../controllers/admin/validationController.js';
import { 
  validateFileUpload,
  uploadRateLimit,
  bulkOperationRateLimit,
  validateContentSize
} from '../../middleware/securityValidation.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'text/plain', 'application/json'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`نوع الملف ${file.mimetype} غير مدعوم`), false);
    }
  }
});

// Apply authentication to all routes
router.use(requireAuth);
router.use(requireRole(['admin', 'editor']));

/**
 * @route POST /api/admin/validation/content
 * @desc Validate content structure and security
 * @access Private (Admin/Editor)
 */
router.post('/content', 
  validateContentSize(10 * 1024 * 1024), // 10MB limit
  validationController.validateContent
);

/**
 * @route POST /api/admin/validation/section
 * @desc Validate individual section
 * @access Private (Admin/Editor)
 */
router.post('/section',
  validateContentSize(5 * 1024 * 1024), // 5MB limit
  validationController.validateSection
);

/**
 * @route POST /api/admin/validation/upload
 * @desc Validate file uploads
 * @access Private (Admin/Editor)
 */
router.post('/upload',
  uploadRateLimit,
  upload.array('files', 10),
  validateFileUpload,
  validationController.validateUpload
);

/**
 * @route POST /api/admin/validation/upload/single
 * @desc Validate single file upload
 * @access Private (Admin/Editor)
 */
router.post('/upload/single',
  uploadRateLimit,
  upload.single('file'),
  validateFileUpload,
  validationController.validateUpload
);

/**
 * @route POST /api/admin/validation/batch
 * @desc Batch validate multiple content items
 * @access Private (Admin/Editor)
 */
router.post('/batch',
  bulkOperationRateLimit,
  validateContentSize(50 * 1024 * 1024), // 50MB limit for batch
  validationController.batchValidate
);

/**
 * @route GET /api/admin/validation/schemas
 * @desc Get available validation schemas
 * @access Private (Admin/Editor)
 */
router.get('/schemas', (req, res) => {
  res.json({
    success: true,
    schemas: {
      pageTypes: [
        'homepage', 'about', 'howToOrder', 'policies', 
        'hero', 'foundational', 'services', 'contact',
        'blog', 'product', 'category', 'landing'
      ],
      sectionTypes: [
        'text', 'richText', 'image', 'gallery', 'form', 
        'video', 'embed', 'cta', 'custom'
      ],
      fileTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'application/pdf', 'text/plain', 'application/json'
      ],
      limits: {
        maxSections: 100,
        maxFileSize: '50MB',
        maxContentSize: '10MB',
        maxBatchItems: 50,
        maxImages: 50,
        maxFormFields: 50
      }
    }
  });
});

/**
 * @route GET /api/admin/validation/rules/:sectionType
 * @desc Get validation rules for specific section type
 * @access Private (Admin/Editor)
 */
router.get('/rules/:sectionType', (req, res) => {
  const { sectionType } = req.params;
  
  const validationRules = {
    text: {
      required: ['content'],
      optional: ['alignment', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'padding'],
      limits: {
        'content.ar': { maxLength: 1000 },
        'content.en': { maxLength: 1000 }
      }
    },
    richText: {
      required: ['content'],
      optional: ['title', 'subtitle', 'theme', 'maxWidth'],
      limits: {
        'content.ar': { maxLength: 10000 },
        'content.en': { maxLength: 10000 }
      },
      security: {
        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
        allowedAttributes: ['href', 'src', 'alt', 'title', 'class', 'id', 'target']
      }
    },
    image: {
      required: ['url', 'alt'],
      optional: ['caption', 'width', 'height', 'aspectRatio', 'loading', 'quality', 'format'],
      limits: {
        width: { min: 1, max: 5000 },
        height: { min: 1, max: 5000 },
        quality: { min: 1, max: 100 }
      }
    },
    gallery: {
      required: ['images'],
      optional: ['layout', 'columns', 'gap', 'showCaptions', 'lightbox', 'autoplay'],
      limits: {
        images: { min: 1, max: 50 },
        columns: { min: 1, max: 6 }
      }
    },
    form: {
      required: ['id', 'fields', 'submitButton', 'settings'],
      optional: ['title', 'description', 'notifications'],
      limits: {
        fields: { min: 1, max: 50 },
        'id': { pattern: '^[a-zA-Z][a-zA-Z0-9_]*$' }
      }
    },
    video: {
      required: ['url', 'type'],
      optional: ['thumbnail', 'title', 'description', 'autoplay', 'controls', 'muted', 'loop'],
      limits: {
        type: { enum: ['youtube', 'vimeo', 'direct', 'embed'] }
      }
    },
    embed: {
      required: ['code', 'type'],
      optional: ['width', 'height', 'sandbox', 'security'],
      limits: {
        code: { maxLength: 10000 },
        type: { enum: ['iframe', 'script', 'html', 'widget'] }
      },
      security: {
        allowedDomains: ['youtube.com', 'vimeo.com', 'codepen.io'],
        blockScripts: true,
        sanitize: true
      }
    },
    cta: {
      required: ['title', 'buttons'],
      optional: ['description', 'background', 'layout'],
      limits: {
        buttons: { min: 1, max: 3 }
      }
    }
  };
  
  const rules = validationRules[sectionType];
  
  if (!rules) {
    return res.status(404).json({
      success: false,
      message: 'نوع القسم غير موجود'
    });
  }
  
  res.json({
    success: true,
    sectionType,
    rules
  });
});

/**
 * @route POST /api/admin/validation/test
 * @desc Test validation with sample data (development only)
 * @access Private (Admin)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', requireRole(['admin']), (req, res) => {
    const sampleData = {
      pageType: 'homepage',
      content: {
        sections: [
          {
            id: 'hero-section',
            type: 'richText',
            data: {
              content: {
                ar: '<h1>مرحباً بكم</h1><p>هذا نص تجريبي</p>',
                en: '<h1>Welcome</h1><p>This is sample text</p>'
              },
              title: {
                ar: 'القسم الرئيسي',
                en: 'Hero Section'
              }
            },
            order: 0,
            isActive: true
          }
        ],
        metadata: {
          title: {
            ar: 'الصفحة الرئيسية',
            en: 'Homepage'
          },
          description: {
            ar: 'وصف الصفحة الرئيسية',
            en: 'Homepage description'
          },
          keywords: ['test', 'sample']
        }
      }
    };
    
    res.json({
      success: true,
      message: 'بيانات تجريبية للاختبار',
      sampleData
    });
  });
}

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات كبير جداً',
        code: 'TOO_MANY_FILES'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'خطأ في رفع الملف',
    code: 'UPLOAD_ERROR'
  });
});

export default router;