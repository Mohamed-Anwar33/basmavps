import PageContent from '../models/PageContent.js';

/**
 * Get SEO settings data for admin (with auth)
 */
export const getAdminSEOSettings = async (req, res) => {
  try {
    let seoContent = await PageContent.findOne({ pageType: 'seo' });
    
    if (!seoContent) {
      // Initialize with default content if not exists
      const defaultSEOContent = {
        title: 'Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… | Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠ ÙÙŠ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©',
        description: 'Ø´Ø±ÙƒØ© Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… - Ù…ØªØ®ØµØµÙˆÙ† ÙÙŠ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ø¨ØµØ±ÙŠØ©ØŒ Ø§Ù„Ø³ÙˆØ´ÙŠØ§Ù„ Ù…ÙŠØ¯ÙŠØ§ØŒ ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠ. Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ø§Ø­ØªØ±Ø§ÙÙŠØ© ÙÙŠ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©. Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø®Ø¨Ø±Ø§Ø¡.',
        keywords: 'ØªØµÙ…ÙŠÙ… Ø¬Ø±Ø§ÙÙŠÙƒ,Ù‡ÙˆÙŠØ© Ø¨ØµØ±ÙŠØ©,Ø³ÙˆØ´ÙŠØ§Ù„ Ù…ÙŠØ¯ÙŠØ§,ØªØµÙ…ÙŠÙ… Ø´Ø¹Ø§Ø±Ø§Øª,Ù…Ø­ØªÙˆÙ‰ Ø±Ù‚Ù…ÙŠ,ØªØµÙ…ÙŠÙ… Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©,Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…',
        canonicalUrl: 'https://basmatdesign.com',
        ogImage: 'og-image.jpg/'
      };
      
      seoContent = new PageContent({
        pageType: 'seo',
        content: {
          sections: [],
          metadata: {
            title: 'SEO Settings',
            description: 'SEO and meta settings',
            keywords: ['seo', 'meta', 'settings'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultSEOContent
        },
        isActive: true,
        status: 'published'
      });
      
      await seoContent.save();
    }
    
    const seoData = seoContent.content?.legacy || {};
    
    // Convert to settings format expected by frontend
    const settings = Object.keys(seoData).map(key => ({
      key,
      value: seoData[key],
      category: 'seo'
    }));
    
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve SEO settings data'
    });
  }
};

/**
 * Get SEO settings data for public
 */
export const getSEOSettings = async (req, res) => {
  try {
    let seoContent = await PageContent.findOne({ pageType: 'seo' });
    
    if (!seoContent) {
      // Initialize with default content if not exists
      const defaultSEOContent = {
        title: 'Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… | Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠ ÙÙŠ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©',
        description: 'Ø´Ø±ÙƒØ© Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… - Ù…ØªØ®ØµØµÙˆÙ† ÙÙŠ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ø¨ØµØ±ÙŠØ©ØŒ Ø§Ù„Ø³ÙˆØ´ÙŠØ§Ù„ Ù…ÙŠØ¯ÙŠØ§ØŒ ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠ. Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ø§Ø­ØªØ±Ø§ÙÙŠØ© ÙÙŠ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©. Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø®Ø¨Ø±Ø§Ø¡.',
        keywords: 'ØªØµÙ…ÙŠÙ… Ø¬Ø±Ø§ÙÙŠÙƒ,Ù‡ÙˆÙŠØ© Ø¨ØµØ±ÙŠØ©,Ø³ÙˆØ´ÙŠØ§Ù„ Ù…ÙŠØ¯ÙŠØ§,ØªØµÙ…ÙŠÙ… Ø´Ø¹Ø§Ø±Ø§Øª,Ù…Ø­ØªÙˆÙ‰ Ø±Ù‚Ù…ÙŠ,ØªØµÙ…ÙŠÙ… Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©,Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…',
        canonicalUrl: 'https://basmatdesign.com',
        ogImage: 'og-image.jpg/'
      };
      
      seoContent = new PageContent({
        pageType: 'seo',
        content: {
          sections: [],
          metadata: {
            title: 'SEO Settings',
            description: 'SEO and meta settings',
            keywords: ['seo', 'meta', 'settings'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultSEOContent
        },
        isActive: true,
        status: 'published'
      });
      
      await seoContent.save();
    }

    const seoData = seoContent.content?.legacy || seoContent.content || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(seoData);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve SEO settings data'
    });
  }
};

/**
 * Update SEO settings data (admin only)
 */
export const updateSEOSettings = async (req, res) => {
  try {
    const seoData = req.body;
    
    let seoContent = await PageContent.findOne({ pageType: 'seo' });
    
    if (!seoContent) {
      seoContent = new PageContent({
        pageType: 'seo',
        content: {
          sections: [],
          metadata: {
            title: 'SEO Settings',
            description: 'SEO and meta settings',
            keywords: ['seo', 'meta', 'settings'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: {}
        },
        isActive: true,
        status: 'published'
      });
    }

    // Save data inside content.legacy to preserve PageContent structure
    seoContent.content.legacy = {
      ...seoContent.content.legacy,
      ...seoData,
      lastModified: new Date()
    };
    
    seoContent.lastModified = new Date();
    await seoContent.save();

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: seoContent.content.legacy,
      message: 'SEO settings updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update SEO settings'
    });
  }
};

