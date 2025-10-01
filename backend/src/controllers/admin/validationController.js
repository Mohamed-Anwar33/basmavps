import { 
  enhancedPageContentSchema,
  enhancedContentSchema,
  enhancedSectionSchema,
  fileUploadSchema
} from '../../validation/enhancedContentSchemas.js';
import { 
  sanitizeContent,
  xssProtection,
  validateFileUpload,
  validateContentSize
} from '../../middleware/securityValidation.js';
import PageContent from '../../models/PageContent.js';
import ContentVersion from '../../models/ContentVersion.js';
import { auditLogger } from '../../utils/auditLogger.js';

/**
 * Validate content structure and security
 */
export const validateContent = async (req, res) => {
  try {
    const { pageType, content } = req.body;
    
    // Validate against enhanced schema
    const { error, value } = enhancedPageContentSchema.validate({
      pageType,
      content,
      createdBy: req.admin.id
    }, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        severity: 'error',
        code: detail.type,
        context: {
          value: detail.context?.value,
          limit: detail.context?.limit,
          label: detail.context?.label
        }
      }));
      
      return res.status(400).json({
        success: false,
        message: 'ÙØ´Ù„ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
        validation: {
          isValid: false,
          errors: validationErrors,
          errorCount: validationErrors.length
        }
      });
    }
    
    // Additional security checks
    const securityIssues = await performSecurityChecks(value.content);
    
    // Performance analysis
    const performanceMetrics = await analyzePerformance(value.content);
    
    // SEO analysis
    const seoAnalysis = await analyzeSEO(value.content);
    
    // Accessibility check
    const accessibilityIssues = await checkAccessibility(value.content);
    
    const allIssues = [
      ...securityIssues,
      ...accessibilityIssues
    ];
    
    const warnings = allIssues.filter(issue => issue.severity === 'warning');
    const errors = allIssues.filter(issue => issue.severity === 'error');
    
    // Log validation attempt
    await auditLogger.log('content_validation', {
      adminId: req.admin.id,
      pageType,
      validationResult: {
        isValid: errors.length === 0,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    });
    
    res.json({
      success: true,
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
        performance: performanceMetrics,
        seo: seoAnalysis,
        validatedAt: new Date(),
        validatedBy: req.admin.id
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate individual section
 */
export const validateSection = async (req, res) => {
  try {
    const { section } = req.body;
    
    const { error, value } = enhancedSectionSchema.validate(section, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        severity: 'error',
        code: detail.type
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Ø§Ù„Ù‚Ø³Ù… ØºÙŠØ± ØµØ­ÙŠØ­',
        validation: {
          isValid: false,
          errors: validationErrors
        }
      });
    }
    
    // Section-specific security checks
    const securityIssues = await validateSectionSecurity(value);
    
    res.json({
      success: true,
      validation: {
        isValid: securityIssues.length === 0,
        errors: securityIssues.filter(issue => issue.severity === 'error'),
        warnings: securityIssues.filter(issue => issue.severity === 'warning'),
        sanitizedSection: value
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

/**
 * Validate file uploads
 */
export const validateUpload = async (req, res) => {
  try {
    const files = req.files || [req.file];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ Ù…Ù„ÙØ§Øª'
      });
    }
    
    const validationResults = [];
    
    for (const file of files) {
      const { error, value } = fileUploadSchema.validate(file, {
        stripUnknown: true
      });
      
      if (error) {
        validationResults.push({
          filename: file.originalname,
          isValid: false,
          errors: error.details.map(detail => detail.message)
        });
      } else {
        // Additional file security checks
        const securityIssues = await validateFileSecurity(file);
        
        validationResults.push({
          filename: file.originalname,
          isValid: securityIssues.length === 0,
          errors: securityIssues.filter(issue => issue.severity === 'error').map(issue => issue.message),
          warnings: securityIssues.filter(issue => issue.severity === 'warning').map(issue => issue.message),
          metadata: {
            size: file.size,
            mimetype: file.mimetype,
            encoding: file.encoding
          }
        });
      }
    }
    
    const allValid = validationResults.every(result => result.isValid);
    
    res.json({
      success: allValid,
      message: allValid ? 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª ØµØ­ÙŠØ­Ø©' : 'Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ù„ÙØ§Øª ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø®Ø·Ø§Ø¡',
      files: validationResults
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù…Ù„ÙØ§Øª'
    });
  }
};

/**
 * Batch validate multiple content items
 */
export const batchValidate = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¹Ù†Ø§ØµØ± Ù…Ø·Ù„ÙˆØ¨Ø©'
      });
    }
    
    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Ø¹Ø¯Ø¯ Ø§Ù„Ø¹Ù†Ø§ØµØ± ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø£Ù‚Ù„ Ù…Ù† 50'
      });
    }
    
    const results = [];
    
    for (const [index, item] of items.entries()) {
      try {
        const { error, value } = enhancedPageContentSchema.validate({
          ...item,
          createdBy: req.admin.id
        }, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        
        if (error) {
          results.push({
            index,
            id: item.id || `item-${index}`,
            isValid: false,
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message.replace(/"/g, ''),
              severity: 'error'
            }))
          });
        } else {
          const securityIssues = await performSecurityChecks(value.content);
          const errors = securityIssues.filter(issue => issue.severity === 'error');
          
          results.push({
            index,
            id: item.id || `item-${index}`,
            isValid: errors.length === 0,
            errors,
            warnings: securityIssues.filter(issue => issue.severity === 'warning')
          });
        }
      } catch (itemError) {
        results.push({
          index,
          id: item.id || `item-${index}`,
          isValid: false,
          errors: [{
            field: 'general',
            message: 'Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø¹Ù†ØµØ±',
            severity: 'error'
          }]
        });
      }
    }
    
    const validCount = results.filter(result => result.isValid).length;
    const invalidCount = results.length - validCount;
    
    // Log batch validation
    await auditLogger.log('batch_validation', {
      adminId: req.admin.id,
      totalItems: items.length,
      validItems: validCount,
      invalidItems: invalidCount
    });
    
    res.json({
      success: true,
      summary: {
        total: items.length,
        valid: validCount,
        invalid: invalidCount,
        validationRate: Math.round((validCount / items.length) * 100)
      },
      results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ù…Ø¬Ù…Ø¹ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰'
    });
  }
};

/**
 * Security checks for content
 */
async function performSecurityChecks(content) {
  const issues = [];
  
  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const contentString = JSON.stringify(content);
  const urls = contentString.match(urlPattern) || [];
  
  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      
      // Check for suspicious domains
      const suspiciousDomains = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 't.co',
        'localhost', '127.0.0.1', '0.0.0.0'
      ];
      
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        issues.push({
          field: 'content.urls',
          message: `Ø±Ø§Ø¨Ø· Ù…Ø´Ø¨ÙˆÙ‡: ${url}`,
          severity: 'warning',
          code: 'SUSPICIOUS_URL'
        });
      }
      
      // Check for non-HTTPS URLs
      if (urlObj.protocol !== 'https:') {
        issues.push({
          field: 'content.urls',
          message: `Ø±Ø§Ø¨Ø· ØºÙŠØ± Ø¢Ù…Ù† (HTTP): ${url}`,
          severity: 'warning',
          code: 'INSECURE_URL'
        });
      }
    } catch (urlError) {
      issues.push({
        field: 'content.urls',
        message: `Ø±Ø§Ø¨Ø· ØºÙŠØ± ØµØ­ÙŠØ­: ${url}`,
        severity: 'error',
        code: 'INVALID_URL'
      });
    }
  }
  
  // Check for large embedded content
  if (content.sections) {
    for (const section of content.sections) {
      if (section.type === 'embed' && section.data.code) {
        if (section.data.code.length > 50000) {
          issues.push({
            field: `content.sections.${section.id}`,
            message: 'ÙƒÙˆØ¯ Ø§Ù„ØªØ¶Ù…ÙŠÙ† ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹',
            severity: 'warning',
            code: 'LARGE_EMBED'
          });
        }
      }
    }
  }
  
  return issues;
}

/**
 * Section-specific security validation
 */
async function validateSectionSecurity(section) {
  const issues = [];
  
  switch (section.type) {
    case 'embed':
      if (section.data.code) {
        // Check for dangerous iframe sources
        const iframeSrcPattern = /<iframe[^>]*src\s*=\s*["']([^"']+)["']/gi;
        const matches = section.data.code.matchAll(iframeSrcPattern);
        
        for (const match of matches) {
          const src = match[1];
          if (!src.startsWith('https://')) {
            issues.push({
              field: 'data.code',
              message: 'Ù…ØµØ¯Ø± iframe ØºÙŠØ± Ø¢Ù…Ù†',
              severity: 'error',
              code: 'UNSAFE_IFRAME_SRC'
            });
          }
        }
      }
      break;
      
    case 'form':
      if (section.data.settings?.action) {
        try {
          const actionUrl = new URL(section.data.settings.action);
          if (actionUrl.protocol !== 'https:') {
            issues.push({
              field: 'data.settings.action',
              message: 'Ø±Ø§Ø¨Ø· Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ ØºÙŠØ± Ø¢Ù…Ù†',
              severity: 'error',
              code: 'INSECURE_FORM_ACTION'
            });
          }
        } catch (error) {
          issues.push({
            field: 'data.settings.action',
            message: 'Ø±Ø§Ø¨Ø· Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ ØºÙŠØ± ØµØ­ÙŠØ­',
            severity: 'error',
            code: 'INVALID_FORM_ACTION'
          });
        }
      }
      break;
  }
  
  return issues;
}

/**
 * File security validation
 */
async function validateFileSecurity(file) {
  const issues = [];
  
  // Check file size limits based on type
  const sizeLimits = {
    'image/jpeg': 10 * 1024 * 1024, // 10MB
    'image/png': 10 * 1024 * 1024,  // 10MB
    'image/webp': 10 * 1024 * 1024, // 10MB
    'image/gif': 5 * 1024 * 1024,   // 5MB
    'video/mp4': 100 * 1024 * 1024, // 100MB
    'application/pdf': 20 * 1024 * 1024 // 20MB
  };
  
  const limit = sizeLimits[file.mimetype];
  if (limit && file.size > limit) {
    issues.push({
      field: 'size',
      message: `Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ÙƒØ¨ÙŠØ± Ø¬Ø¯Ø§Ù‹ Ù„Ù„Ù†ÙˆØ¹ ${file.mimetype}`,
      severity: 'error',
      code: 'FILE_SIZE_EXCEEDED'
    });
  }
  
  // Check for suspicious file names
  if (/\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app)$/i.test(file.originalname)) {
    issues.push({
      field: 'filename',
      message: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­',
      severity: 'error',
      code: 'DANGEROUS_FILE_TYPE'
    });
  }
  
  return issues;
}

/**
 * Performance analysis
 */
async function analyzePerformance(content) {
  const metrics = {
    score: 100,
    issues: [],
    recommendations: []
  };
  
  // Count sections
  const sectionCount = content.sections?.length || 0;
  if (sectionCount > 20) {
    metrics.score -= 10;
    metrics.issues.push('Ø¹Ø¯Ø¯ ÙƒØ¨ÙŠØ± Ù…Ù† Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ù‚Ø¯ ÙŠØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¯Ø§Ø¡');
    metrics.recommendations.push('ÙÙƒØ± ÙÙŠ ØªÙ‚Ø³ÙŠÙ… Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø¥Ù„Ù‰ ØµÙØ­Ø§Øª Ù…ØªØ¹Ø¯Ø¯Ø©');
  }
  
  // Check image count
  let imageCount = 0;
  content.sections?.forEach(section => {
    if (section.type === 'image') imageCount++;
    if (section.type === 'gallery') imageCount += section.data.images?.length || 0;
  });
  
  if (imageCount > 10) {
    metrics.score -= 15;
    metrics.issues.push('Ø¹Ø¯Ø¯ ÙƒØ¨ÙŠØ± Ù…Ù† Ø§Ù„ØµÙˆØ±');
    metrics.recommendations.push('Ø§Ø³ØªØ®Ø¯Ù… ØªØ­Ø³ÙŠÙ† Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ¯Ø±ÙŠØ¬ÙŠ');
  }
  
  return metrics;
}

/**
 * SEO analysis
 */
async function analyzeSEO(content) {
  const analysis = {
    score: 100,
    issues: [],
    recommendations: []
  };
  
  // Check metadata
  if (!content.metadata?.title?.ar || content.metadata.title.ar.length < 10) {
    analysis.score -= 20;
    analysis.issues.push('Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØµÙØ­Ø© Ù‚ØµÙŠØ± Ø¬Ø¯Ø§Ù‹');
  }
  
  if (!content.metadata?.description?.ar || content.metadata.description.ar.length < 50) {
    analysis.score -= 15;
    analysis.issues.push('ÙˆØµÙ Ø§Ù„ØµÙØ­Ø© Ù‚ØµÙŠØ± Ø¬Ø¯Ø§Ù‹');
  }
  
  // Check heading structure
  let hasH1 = false;
  content.sections?.forEach(section => {
    if (section.type === 'richText' && section.data.content?.ar?.includes('<h1')) {
      hasH1 = true;
    }
  });
  
  if (!hasH1) {
    analysis.score -= 10;
    analysis.recommendations.push('Ø£Ø¶Ù Ø¹Ù†ÙˆØ§Ù† Ø±Ø¦ÙŠØ³ÙŠ (H1) Ù„Ù„ØµÙØ­Ø©');
  }
  
  return analysis;
}

/**
 * Accessibility check
 */
async function checkAccessibility(content) {
  const issues = [];
  
  // Check images for alt text
  content.sections?.forEach(section => {
    if (section.type === 'image') {
      if (!section.data.alt?.ar && !section.data.alt?.en) {
        issues.push({
          field: `sections.${section.id}.data.alt`,
          message: 'Ø§Ù„ØµÙˆØ±Ø© ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù†Øµ Ø¨Ø¯ÙŠÙ„',
          severity: 'warning',
          code: 'MISSING_ALT_TEXT'
        });
      }
    }
    
    if (section.type === 'gallery') {
      section.data.images?.forEach((image, index) => {
        if (!image.alt?.ar && !image.alt?.en) {
          issues.push({
            field: `sections.${section.id}.data.images.${index}.alt`,
            message: `Ø§Ù„ØµÙˆØ±Ø© ${index + 1} ÙÙŠ Ø§Ù„Ù…Ø¹Ø±Ø¶ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù†Øµ Ø¨Ø¯ÙŠÙ„`,
            severity: 'warning',
            code: 'MISSING_ALT_TEXT'
          });
        }
      });
    }
  });
  
  return issues;
}

export default {
  validateContent,
  validateSection,
  validateUpload,
  batchValidate
};
