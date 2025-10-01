import PageContent from '../../models/PageContent.js';
import Content from '../../models/Content.js';
import HomepageSection from '../../models/HomepageSection.js';
import Media from '../../models/Media.js';
import ContentVersion from '../../models/ContentVersion.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import cacheManager, { CacheKeys, InvalidationPatterns } from '../../utils/cacheManager.js';
import dbOptimizer, { createOptimizedQuery } from '../../utils/databaseOptimizer.js';
import backgroundProcessor from '../../utils/backgroundProcessor.js';
import { 
  pageContentSchema, 
  updatePageContentSchema,
  addSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  bulkOperationSchema,
  searchSchema,
  validateContentSchema
} from '../../validation/contentSchemas.js';

// Get content hub summary with caching
export const getContentHubSummary = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Try to get from cache first
    const cacheKey = CacheKeys.CONTENT_SUMMARY();
    const cachedSummary = await cacheManager.get(cacheKey);
    
    if (cachedSummary) {
      res.set('X-Cache', 'HIT');
      return res.json({
        success: true,
        data: cachedSummary
      });
    }

    // Generate summary data with optimized queries
    const [
      totalPages,
      publishedPages,
      draftPages,
      archivedPages,
      totalMedia,
      invalidPages,
      totalVersions,
      recentPages,
      recentSections
    ] = await Promise.all([
      PageContent.countDocuments(),
      PageContent.countDocuments({ status: 'published', isActive: true }),
      PageContent.countDocuments({ status: 'draft' }),
      PageContent.countDocuments({ status: 'archived' }),
      Media.countDocuments({ isPublic: true }),
      PageContent.countDocuments({ 'validation.isValid': false }),
      ContentVersion.countDocuments({ contentType: 'PageContent' }),
      createOptimizedQuery(PageContent, {}, {
        populate: { path: 'lastModifier', select: 'name email' },
        sort: { lastModified: -1 },
        limit: 5,
        select: 'pageType lastModified isActive status version'
      }),
      createOptimizedQuery(HomepageSection, { isActive: true }, {
        sort: { updatedAt: -1 },
        limit: 5,
        select: 'sectionType updatedAt order'
      })
    ]);

    const summaryData = {
      pages: {
        total: totalPages,
        published: publishedPages,
        drafts: draftPages,
        archived: archivedPages,
        invalid: invalidPages
      },
      media: {
        total: totalMedia
      },
      versions: {
        total: totalVersions
      },
      recent: {
        pages: recentPages,
        sections: recentSections
      }
    };

    // Cache the result for 3 minutes
    await cacheManager.set(cacheKey, summaryData, 180);
    
    // Monitor query performance
    const executionTime = Date.now() - startTime;
    dbOptimizer.monitorQuery('getContentHubSummary', executionTime);

    res.set('X-Cache', 'MISS');
    res.json({
      success: true,
      data: summaryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ù„Ø®Øµ Ø§Ù„Ù…Ø­ØªÙˆÙ‰'
    });
  }
};

// Get all page content with enhanced search and filtering
export const getPageContent = async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¨Ø­Ø« ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const { query, pageType, status, isActive, page, limit, sortBy, sortOrder } = value;

    const pages = await PageContent.search(query, {
      page,
      limit,
      status,
      pageType,
      isActive
    });

    const total = await PageContent.countDocuments(
      PageContent.search(query, { pageType, status, isActive }).getQuery()
    );

    res.json({
      success: true,
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        query,
        pageType,
        status,
        isActive,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø§Øª'
    });
  }
};

// Get page content by type with version history and caching
export const getPageContentByType = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { includeVersions = false, includeValidation = true } = req.query;
    const startTime = Date.now();

    console.log('🔍 getPageContentByType - Requested pageType:', pageType);

    // Map page types to match the saved format in Content model
    const pageMapping = {
      'howToOrder': 'how-to-order',
      'how-to-order': 'how-to-order',
      'homepage': 'homepage',
      'about': 'about',
      'services': 'services',
      'contact': 'contact',
      'faq': 'faq',
      'blog': 'blog',
      'policies': 'policies'
    };
    
    const mappedPage = pageMapping[pageType] || pageType;
    console.log('🔄 Mapped page name:', mappedPage);

    // First, try to get content from Content model (flat format)
    const contentEntries = await Content.find({ page: mappedPage }).select('key value type -_id');
    console.log('📊 Found content entries from Content model:', contentEntries.length);

    if (contentEntries.length > 0) {
      // Convert flat data to object, excluding old structured data fields
      const contentObject = {};
      contentEntries.forEach(entry => {
        // Skip old structured data fields that conflict with flat data
        if (entry.key !== 'content' && entry.key !== 'sections' && entry.key !== 'metadata') {
          contentObject[entry.key] = entry.value;
        }
      });

      console.log('📋 Content object keys:', Object.keys(contentObject));
      console.log('✅ Returning data from Content model');

      return res.json({
        success: true,
        data: contentObject
      });
    }

    console.log('⚠️ No content found in Content model, falling back to PageContent model');

    // Generate cache key based on parameters
    const cacheKey = CacheKeys.PAGE_CONTENT(pageType) + 
                    (includeVersions ? ':versions' : '') + 
                    (includeValidation ? ':validation' : '');

    // Don't cache when including versions (too dynamic)
    let cachedPage = null;
    if (!includeVersions) {
      cachedPage = await cacheManager.get(cacheKey);
      if (cachedPage) {
        res.set('X-Cache', 'HIT');
        return res.json({
          success: true,
          data: cachedPage
        });
      }
    }

    let page = await createOptimizedQuery(PageContent, { pageType }, {
      populate: [
        { path: 'creator', select: 'name email' },
        { path: 'lastModifier', select: 'name email' }
      ],
      lean: false // We need the full document for potential creation
    });

    // If page doesn't exist, create it with default content structure
    if (!page) {
      page = new PageContent({
        pageType,
        content: {
          sections: [],
          metadata: {
            title: { ar: '', en: '' },
            description: { ar: '', en: '' },
            keywords: [],
            ogImage: '',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: {}
        },
        isActive: true,
        status: 'draft',
        createdBy: req.admin?.id,
        lastModifiedBy: req.admin?.id
      });
      await page.save();
      
      // Populate the creator and lastModifier fields
      await page.populate([
        { path: 'creator', select: 'name email' },
        { path: 'lastModifier', select: 'name email' }
      ]);
    }

    const response = {
      success: true,
      data: page
    };

    // Include version history if requested
    if (includeVersions) {
      const versions = await ContentVersion.getHistory(page._id, 'PageContent', {
        page: 1,
        limit: 10,
        includeContent: false
      });
      response.versions = versions;
    }

    // Include validation results if requested
    if (includeValidation && page.validation) {
      response.validation = page.validation;
    }

    // Cache the result if not including versions
    if (!includeVersions) {
      await cacheManager.set(cacheKey, page, 600); // Cache for 10 minutes
    }

    // Monitor query performance
    const executionTime = Date.now() - startTime;
    dbOptimizer.monitorQuery('getPageContentByType', executionTime);

    res.set('X-Cache', cachedPage ? 'HIT' : 'MISS');
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø©'
    });
  }
};

// Update page content with version tracking
export const updatePageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { error, value } = updatePageContentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    // Resolve admin id robustly to avoid 500 when req.admin is undefined
    const adminId = req.admin?.id || req.user?._id || req.user?.id || null;

    let page = await PageContent.findOne({ pageType });
    const isNewPage = !page;
    const previousContent = page ? JSON.parse(JSON.stringify(page.content)) : null;

    if (!page) {
      // Create new page if it doesn't exist
      page = new PageContent({
        pageType,
        content: value.content || {
          sections: [],
          metadata: {
            title: { ar: '', en: '' },
            description: { ar: '', en: '' },
            keywords: [],
            ogImage: '',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: {}
        },
        isActive: value.isActive !== undefined ? value.isActive : true,
        status: value.status || 'draft',
        createdBy: adminId || undefined,
        lastModifiedBy: adminId || undefined
      });
    } else {
      // Store previous content for version tracking
      const changes = [];

      // Update existing page
      if (value.content !== undefined) {
        changes.push({
          field: 'content',
          oldValue: previousContent,
          newValue: value.content,
          timestamp: new Date()
        });
        page.content = value.content;
      }

      if (value.isActive !== undefined) {
        changes.push({
          field: 'isActive',
          oldValue: page.isActive,
          newValue: value.isActive,
          timestamp: new Date()
        });
        page.isActive = value.isActive;
      }

      if (value.status !== undefined) {
        changes.push({
          field: 'status',
          oldValue: page.status,
          newValue: value.status,
          timestamp: new Date()
        });
        page.status = value.status;
      }

      if (value.analytics !== undefined) {
        Object.assign(page.analytics, value.analytics);
      }

      if (adminId) {
        page.lastModifiedBy = adminId;
      }
      page.lastModified = new Date();

      // Create version if content changed
      if (changes.some(c => c.field === 'content')) {
        await ContentVersion.createVersion(
          page._id,
          'PageContent',
          page.content,
          changes,
          adminId || undefined,
          { pageType }
        );
      }
    }

    const changes = [];

    // Validate content
    const validation = page.validateContent();

    await page.save();

    // Invalidate related cache entries
    const invalidationPatterns = InvalidationPatterns.PAGE_CONTENT(pageType);
    await Promise.all(
      invalidationPatterns.map(pattern => cacheManager.delPattern(pattern))
    );

    // Create audit log
    if (adminId) {
      await createAuditLog({
        adminId,
        action: isNewPage ? 'create' : 'update',
        resource: 'PageContent',
        resourceId: page._id,
        details: `${isNewPage ? 'Created' : 'Updated'} page content for ${pageType}`,
        metadata: {
          pageType,
          sectionsCount: page.content.sections?.length || 0,
          isValid: validation.isValid,
          version: page.version
        }
      });
    }

    // Schedule background content analysis if this is a significant update
    if (!isNewPage && typeof changes !== 'undefined' && changes.some(c => c.field === 'content')) {
      backgroundProcessor.addJob('content-analysis', {
        pageId: page._id,
        pageType,
        content: page.content
      }, { priority: 'low' });
    }

    res.json({
      success: true,
      message: isNewPage ? 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© Ø¨Ù†Ø¬Ø§Ø­' : 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: page,
      validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø©',
      error: error.message,
      details: error.stack
    });
  }
};

// Get all homepage sections
export const getHomepageSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find()
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
    });
  }
};

// Get homepage section by type
export const getHomepageSectionByType = async (req, res) => {
  try {
    const { sectionType } = req.params;

    let section = await HomepageSection.findOne({ sectionType });

    // If section doesn't exist, create it with default content
    if (!section) {
      const defaultContent = getDefaultSectionContent(sectionType);
      section = new HomepageSection({
        sectionType,
        isActive: true,
        order: 0,
        ...defaultContent
      });
      await section.save();
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù‚Ø³Ù… Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
    });
  }
};

// Update homepage section
export const updateHomepageSection = async (req, res) => {
  try {
    const { sectionType } = req.params;
    const updateData = req.body;

    let section = await HomepageSection.findOne({ sectionType });

    if (!section) {
      // Create new section if it doesn't exist
      section = new HomepageSection({
        sectionType,
        isActive: true,
        order: 0,
        ...updateData
      });
    } else {
      // Update existing section
      Object.assign(section, updateData);
    }

    await section.save();

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: section.isNew ? 'CREATE' : 'UPDATE',
      resource: 'HomepageSection',
      resourceId: section._id,
      details: `Updated homepage section: ${sectionType}`,
      metadata: { sectionType, updateKeys: Object.keys(updateData) }
    });

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ù‚Ø³Ù… Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ù‚Ø³Ù… Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
    });
  }
};

// Update section order
export const updateSectionOrder = async (req, res) => {
  try {
    const { sections } = req.body; // Array of { id, order }

    const updatePromises = sections.map(({ id, order }) =>
      HomepageSection.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'HomepageSection',
      details: 'Updated section order',
      metadata: { sectionsCount: sections.length }
    });

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø¨Ù†Ø¬Ø§Ø­'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…'
    });
  }
};

// Add section to page content
export const addSection = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { error, value } = addSectionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù‚Ø³Ù… ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const page = await PageContent.findOne({ pageType });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const { section, position } = value;
    const newSection = page.addSection(section);

    // Reorder if position specified
    if (position !== undefined) {
      const sections = page.content.sections;
      const sectionIndex = sections.findIndex(s => s.id === newSection.id);
      const movedSection = sections.splice(sectionIndex, 1)[0];
      sections.splice(position, 0, movedSection);
      
      // Update order values
      sections.forEach((s, index) => {
        s.order = index;
      });
    }

    page.lastModifiedBy = req.admin.id;
    await page.save();

    // Create version
    await ContentVersion.createVersion(
      page._id,
      'PageContent',
      page.content,
      [{
        field: 'sections',
        oldValue: null,
        newValue: newSection,
        timestamp: new Date()
      }],
      req.admin.id,
      { action: 'add_section', sectionId: newSection.id }
    );

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'CREATE',
      resource: 'PageContent',
      resourceId: page._id,
      details: `Added section ${newSection.type} to ${pageType}`,
      metadata: { pageType, sectionId: newSection.id, sectionType: newSection.type }
    });

    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù‚Ø³Ù… Ø¨Ù†Ø¬Ø§Ø­',
      data: newSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

// Update section in page content
export const updateSection = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { error, value } = updateSectionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ­Ø¯ÙŠØ« ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const page = await PageContent.findOne({ pageType });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const { sectionId, updates } = value;
    const oldSection = page.content.sections.find(s => s.id === sectionId);
    
    if (!oldSection) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù‚Ø³Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    const updatedSection = page.updateSection(sectionId, updates);
    page.lastModifiedBy = req.admin.id;
    await page.save();

    // Create version
    await ContentVersion.createVersion(
      page._id,
      'PageContent',
      page.content,
      [{
        field: `sections.${sectionId}`,
        oldValue: oldSection,
        newValue: updatedSection,
        timestamp: new Date()
      }],
      req.admin.id,
      { action: 'update_section', sectionId }
    );

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'PageContent',
      resourceId: page._id,
      details: `Updated section ${sectionId} in ${pageType}`,
      metadata: { pageType, sectionId, updateKeys: Object.keys(updates) }
    });

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù‚Ø³Ù… Ø¨Ù†Ø¬Ø§Ø­',
      data: updatedSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

// Remove section from page content
export const removeSection = async (req, res) => {
  try {
    const { pageType, sectionId } = req.params;

    const page = await PageContent.findOne({ pageType });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const removedSection = page.removeSection(sectionId);
    
    if (!removedSection) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù‚Ø³Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    page.lastModifiedBy = req.admin.id;
    await page.save();

    // Create version
    await ContentVersion.createVersion(
      page._id,
      'PageContent',
      page.content,
      [{
        field: 'sections',
        oldValue: removedSection,
        newValue: null,
        timestamp: new Date()
      }],
      req.admin.id,
      { action: 'remove_section', sectionId }
    );

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'DELETE',
      resource: 'PageContent',
      resourceId: page._id,
      details: `Removed section ${sectionId} from ${pageType}`,
      metadata: { pageType, sectionId, sectionType: removedSection.type }
    });

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù‚Ø³Ù… Ø¨Ù†Ø¬Ø§Ø­',
      data: removedSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

// Reorder sections in page content
export const reorderSections = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { error, value } = reorderSectionsSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ±ØªÙŠØ¨ ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const page = await PageContent.findOne({ pageType });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const { sectionOrders } = value;
    const oldOrder = page.content.sections.map(s => ({ id: s.id, order: s.order }));
    
    page.reorderSections(sectionOrders);
    page.lastModifiedBy = req.admin.id;
    await page.save();

    // Create version
    await ContentVersion.createVersion(
      page._id,
      'PageContent',
      page.content,
      [{
        field: 'sections.order',
        oldValue: oldOrder,
        newValue: sectionOrders,
        timestamp: new Date()
      }],
      req.admin.id,
      { action: 'reorder_sections' }
    );

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'PageContent',
      resourceId: page._id,
      details: `Reordered sections in ${pageType}`,
      metadata: { pageType, sectionsCount: sectionOrders.length }
    });

    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø¨Ù†Ø¬Ø§Ø­',
      data: page.content.sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…'
    });
  }
};

// Validate page content
export const validatePageContent = async (req, res) => {
  try {
    const { error, value } = validateContentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const { pageType, content } = value;
    
    // Create temporary page instance for validation
    const tempPage = new PageContent({
      pageType,
      content,
      isActive: true,
      status: 'draft'
    });

    const validation = tempPage.validateContent();

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰'
    });
  }
};

// Bulk operations on page content
export const bulkOperations = async (req, res) => {
  try {
    const { error, value } = bulkOperationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ© ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        errors: error.details.map(d => d.message)
      });
    }

    const { operation, pageTypes, options } = value;
    const results = [];

    for (const pageType of pageTypes) {
      try {
        const page = await PageContent.findOne({ pageType });
        
        if (!page) {
          results.push({
            pageType,
            success: false,
            message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
          });
          continue;
        }

        let message = '';
        
        switch (operation) {
          case 'publish':
            page.publish();
            message = 'ØªÙ… Ù†Ø´Ø± Ø§Ù„ØµÙØ­Ø©';
            break;
            
          case 'unpublish':
            page.unpublish();
            message = 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ù†Ø´Ø± Ø§Ù„ØµÙØ­Ø©';
            break;
            
          case 'archive':
            page.archive();
            message = 'ØªÙ… Ø£Ø±Ø´ÙØ© Ø§Ù„ØµÙØ­Ø©';
            break;
            
          case 'delete':
            await PageContent.findByIdAndDelete(page._id);
            message = 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØµÙØ­Ø©';
            break;
            
          case 'duplicate':
            const duplicatedPage = new PageContent({
              pageType: `${pageType}_copy_${Date.now()}`,
              content: JSON.parse(JSON.stringify(page.content)),
              status: 'draft',
              isActive: false,
              createdBy: req.admin.id,
              lastModifiedBy: req.admin.id
            });
            await duplicatedPage.save();
            message = 'ØªÙ… Ù†Ø³Ø® Ø§Ù„ØµÙØ­Ø©';
            break;
            
          default:
            throw new Error('Ø¹Ù…Ù„ÙŠØ© ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…Ø©');
        }

        if (operation !== 'delete') {
          page.lastModifiedBy = req.admin.id;
          await page.save();
        }

        results.push({
          pageType,
          success: true,
          message
        });

        // Create audit log
        await createAuditLog({
          adminId: req.admin.id,
          action: operation.toUpperCase(),
          resource: 'PageContent',
          resourceId: page._id,
          details: `Bulk ${operation} operation on ${pageType}`,
          metadata: { pageType, operation, options }
        });

      } catch (pageError) {
        results.push({
          pageType,
          success: false,
          message: pageError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `ØªÙ… ØªÙ†ÙÙŠØ° Ø§Ù„Ø¹Ù…Ù„ÙŠØ© Ø¹Ù„Ù‰ ${successCount} Ù…Ù† ${pageTypes.length} ØµÙØ­Ø©`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªÙ†ÙÙŠØ° Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø¬Ù…Ø¹Ø©'
    });
  }
};

// Get version history for page content
export const getVersionHistory = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { page = 1, limit = 20, includeContent = false } = req.query;

    const pageContent = await PageContent.findOne({ pageType });
    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const versions = await ContentVersion.getHistory(pageContent._id, 'PageContent', {
      page: parseInt(page),
      limit: parseInt(limit),
      includeContent: includeContent === 'true'
    });

    const total = await ContentVersion.countDocuments({
      contentId: pageContent._id,
      contentType: 'PageContent'
    });

    res.json({
      success: true,
      data: versions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥ØµØ¯Ø§Ø±Ø§Øª'
    });
  }
};

// Restore specific version
export const restoreVersion = async (req, res) => {
  try {
    const { pageType, version } = req.params;

    const pageContent = await PageContent.findOne({ pageType });
    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    const restoredVersion = await ContentVersion.restoreVersion(
      pageContent._id,
      'PageContent',
      parseInt(version),
      req.admin.id
    );

    // Update the page content with restored data
    pageContent.content = restoredVersion.content;
    pageContent.lastModifiedBy = req.admin.id;
    await pageContent.save();

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'RESTORE',
      resource: 'PageContent',
      resourceId: pageContent._id,
      details: `Restored ${pageType} to version ${version}`,
      metadata: { pageType, restoredVersion: version, newVersion: restoredVersion.version }
    });

    res.json({
      success: true,
      message: `ØªÙ… Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¥ØµØ¯Ø§Ø± ${version} Ø¨Ù†Ø¬Ø§Ø­`,
      data: {
        page: pageContent,
        restoredVersion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¥ØµØ¯Ø§Ø±'
    });
  }
};

// Helper function to get default content for sections
function getDefaultSectionContent(sectionType) {
  switch (sectionType) {
    case 'whatMakesUsDifferent':
      return {
        whatMakesUsDifferent: {
          title: { ar: 'Ù…Ø§ ÙŠÙ…ÙŠØ²Ù†Ø§', en: 'What Makes Us Different' },
          subtitle: { ar: 'Ù†Ù‚Ø¯Ù… Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ©', en: 'We provide exceptional design services' },
          items: []
        }
      };
    case 'counters':
      return {
        counters: {
          title: { ar: 'Ø£Ø±Ù‚Ø§Ù…Ù†Ø§', en: 'Our Numbers' },
          subtitle: { ar: 'Ø£Ø±Ù‚Ø§Ù…Ù†Ø§ ØªØªØ­Ø¯Ø« Ø¹Ù† Ø§Ù„ØªØ²Ø§Ù…Ù†Ø§', en: 'Our numbers speak about our commitment' },
          items: []
        }
      };
    case 'closingCTA':
      return {
        closingCTA: {
          title: { ar: 'Ø§Ø¨Ø¯Ø£ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ù…Ø¹Ù†Ø§', en: 'Start Your Project With Us' },
          subtitle: { ar: 'Ø­ÙˆÙ„ ÙÙƒØ±ØªÙƒ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹', en: 'Turn your idea into reality' },
          description: { ar: 'Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ', en: 'We are here to help you' },
          primaryButton: {
            text: { ar: 'Ø§Ø¨Ø¯Ø£ Ù…Ø´Ø±ÙˆØ¹Ùƒ', en: 'Start Your Project' },
            link: '/services'
          },
          secondaryButton: {
            text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' },
            link: '/contact'
          }
        }
      };
    case 'customSection':
      return {
        customSection: {
          title: { ar: '', en: '' },
          content: { ar: '', en: '' },
          image: '',
          button: {
            text: { ar: '', en: '' },
            link: ''
          }
        }
      };
    default:
      return {};
  }
}
