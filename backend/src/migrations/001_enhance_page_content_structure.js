import mongoose from 'mongoose';
import PageContent from '../models/PageContent.js';

/**
 * Migration: Enhance PageContent model structure
 * 
 * This migration transforms existing PageContent documents to support:
 * - Sectioned content structure
 * - Version tracking and metadata fields
 * - Enhanced SEO and analytics capabilities
 */

export const up = async () => {
  try {
    // Get all existing PageContent documents
    const existingPages = await PageContent.find({}).lean();
    
    for (const page of existingPages) {
      const migrationData = {
        // Preserve existing data
        pageType: page.pageType,
        isActive: page.isActive !== undefined ? page.isActive : true,
        lastModified: page.lastModified || page.updatedAt || new Date(),
        
        // Initialize new structure
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
          legacy: page.content || {} // Preserve original content as legacy
        },
        
        // Initialize version tracking
        version: 1,
        status: page.isActive ? 'published' : 'draft',
        publishedAt: page.createdAt || new Date(),
        
        // Initialize analytics
        analytics: {
          views: 0,
          lastViewed: null,
          avgLoadTime: 0,
          bounceRate: 0
        },
        
        // Initialize validation
        validation: {
          isValid: true,
          errors: [],
          lastValidated: new Date()
        }
      };
      
      // Convert legacy content to sections based on page type
      if (page.content && typeof page.content === 'object') {
        migrationData.content.sections = convertLegacyContentToSections(page.pageType, page.content);
        
        // Extract metadata from legacy content if available
        if (page.content.title) {
          migrationData.content.metadata.title = typeof page.content.title === 'string' 
            ? { ar: page.content.title, en: page.content.title }
            : page.content.title;
        }
        
        if (page.content.description) {
          migrationData.content.metadata.description = typeof page.content.description === 'string'
            ? { ar: page.content.description, en: page.content.description }
            : page.content.description;
        }
        
        if (page.content.keywords) {
          migrationData.content.metadata.keywords = Array.isArray(page.content.keywords) 
            ? page.content.keywords 
            : [];
        }
      }
      
      // Update the document
      await PageContent.findByIdAndUpdate(
        page._id,
        { $set: migrationData },
        { new: true, runValidators: false } // Skip validation during migration
      );
      
      }
    
    } catch (error) {
    throw error;
  }
};

export const down = async () => {
  try {
    // Get all PageContent documents
    const pages = await PageContent.find({}).lean();
    
    for (const page of pages) {
      // Restore original structure using legacy content
      const rollbackData = {
        pageType: page.pageType,
        content: page.content?.legacy || {},
        isActive: page.isActive,
        lastModified: page.lastModified
      };
      
      // Remove new fields
      await PageContent.findByIdAndUpdate(
        page._id,
        { 
          $set: rollbackData,
          $unset: {
            version: 1,
            status: 1,
            publishedAt: 1,
            createdBy: 1,
            lastModifiedBy: 1,
            analytics: 1,
            validation: 1
          }
        },
        { runValidators: false }
      );
      
      }
    
    } catch (error) {
    throw error;
  }
};

/**
 * Convert legacy content structure to new sectioned format
 */
function convertLegacyContentToSections(pageType, legacyContent) {
  const sections = [];
  let sectionOrder = 0;
  
  // Convert based on page type and content structure
  switch (pageType) {
    case 'hero':
      if (legacyContent.title || legacyContent.subtitle) {
        sections.push({
          id: `hero-text-${Date.now()}`,
          type: 'richText',
          data: {
            title: legacyContent.title || '',
            subtitle: legacyContent.subtitle || '',
            content: legacyContent.description || ''
          },
          order: sectionOrder++,
          isActive: true,
          settings: { sectionType: 'hero' }
        });
      }
      
      if (legacyContent.backgroundImage || legacyContent.image) {
        sections.push({
          id: `hero-image-${Date.now()}`,
          type: 'image',
          data: {
            url: legacyContent.backgroundImage || legacyContent.image,
            alt: legacyContent.imageAlt || '',
            caption: ''
          },
          order: sectionOrder++,
          isActive: true,
          settings: { sectionType: 'background' }
        });
      }
      break;
      
    case 'about':
    case 'foundational':
      if (legacyContent.statement || legacyContent.content) {
        sections.push({
          id: `content-text-${Date.now()}`,
          type: 'richText',
          data: {
            content: legacyContent.statement || legacyContent.content || ''
          },
          order: sectionOrder++,
          isActive: true,
          settings: { sectionType: 'main-content' }
        });
      }
      break;
      
    case 'services':
      if (legacyContent.services && Array.isArray(legacyContent.services)) {
        legacyContent.services.forEach((service, index) => {
          sections.push({
            id: `service-${index}-${Date.now()}`,
            type: 'custom',
            data: service,
            order: sectionOrder++,
            isActive: true,
            settings: { sectionType: 'service-item' }
          });
        });
      }
      break;
      
    case 'contact':
      if (legacyContent.form) {
        sections.push({
          id: `contact-form-${Date.now()}`,
          type: 'form',
          data: legacyContent.form,
          order: sectionOrder++,
          isActive: true,
          settings: { sectionType: 'contact-form' }
        });
      }
      
      if (legacyContent.info) {
        sections.push({
          id: `contact-info-${Date.now()}`,
          type: 'text',
          data: legacyContent.info,
          order: sectionOrder++,
          isActive: true,
          settings: { sectionType: 'contact-info' }
        });
      }
      break;
      
    default:
      // Generic conversion for other page types
      Object.keys(legacyContent).forEach((key) => {
        const value = legacyContent[key];
        
        if (typeof value === 'string' && value.trim()) {
          sections.push({
            id: `${key}-${Date.now()}`,
            type: key.includes('image') || key.includes('photo') ? 'image' : 'text',
            data: { [key]: value },
            order: sectionOrder++,
            isActive: true,
            settings: { originalKey: key }
          });
        } else if (typeof value === 'object' && value !== null) {
          sections.push({
            id: `${key}-${Date.now()}`,
            type: 'custom',
            data: value,
            order: sectionOrder++,
            isActive: true,
            settings: { originalKey: key }
          });
        }
      });
  }
  
  return sections;
}

/**
 * Migration metadata
 */
export const metadata = {
  version: '001',
  name: 'enhance_page_content_structure',
  description: 'Enhance PageContent model with sectioned content structure, version tracking, and metadata fields',
  createdAt: new Date('2024-12-19'),
  dependencies: []
};
