import PageContent from '../models/PageContent.js';

/**
 * Get foundational statement data for admin (with auth)
 */
export const getAdminFoundationalStatement = async (req, res) => {
  try {
    let foundationalContent = await PageContent.findOne({ pageType: 'foundational' });
    
    if (!foundationalContent) {
      // Initialize with default content if not exists
      const defaultFoundationalContent = {
        title: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ù…Ù†Ø­ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ù„Ø§ ÙŠÙÙ†Ø³Ù‰',
        subtitle: 'Ù†ØµÙ…Ù…ØŒ Ù†ÙƒØªØ¨ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ù„Ùƒ Ù‡ÙˆÙŠØ© ØªØªØ±Ùƒ Ø£Ø«Ø±Ù‹Ø§ ÙÙŠ Ù‚Ù„ÙˆØ¨ Ø¹Ù…Ù„Ø§Ø¦Ùƒ',
        ctaPrimaryText: 'Ø§Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù†',
        ctaPrimaryLink: '/order',
        ctaSecondaryText: 'ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§ Ø£ÙƒØ«Ø±',
        ctaSecondaryLink: '/about',
        isActive: true
      };
      
      foundationalContent = new PageContent({
        pageType: 'foundational',
        content: {
          sections: [],
          metadata: {
            title: 'Foundational Section',
            description: 'Main foundational section content',
            keywords: ['foundational', 'main', 'about'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultFoundationalContent
        },
        isActive: true,
        status: 'published'
      });
      
      await foundationalContent.save();
    }
    
    const foundationalData = foundationalContent.content?.legacy || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(foundationalData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve foundational statement data'
    });
  }
};

/**
 * Get foundational statement data for public
 */
export const getFoundationalStatement = async (req, res) => {
  try {
    let foundationalContent = await PageContent.findOne({ pageType: 'foundational' });
    
    if (!foundationalContent) {
      // Initialize with default content if not exists
      const defaultFoundationalContent = {
        title: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ù…Ù†Ø­ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ù„Ø§ ÙŠÙÙ†Ø³Ù‰',
        subtitle: 'Ù†ØµÙ…Ù…ØŒ Ù†ÙƒØªØ¨ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ù„Ùƒ Ù‡ÙˆÙŠØ© ØªØªØ±Ùƒ Ø£Ø«Ø±Ù‹Ø§ ÙÙŠ Ù‚Ù„ÙˆØ¨ Ø¹Ù…Ù„Ø§Ø¦Ùƒ',
        ctaPrimaryText: 'Ø§Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù†',
        ctaPrimaryLink: '/order',
        ctaSecondaryText: 'ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§ Ø£ÙƒØ«Ø±',
        ctaSecondaryLink: '/about',
        isActive: true
      };
      
      foundationalContent = new PageContent({
        pageType: 'foundational',
        content: defaultFoundationalContent,
        isActive: true
      });
      
      await foundationalContent.save();
    }

    const foundationalData = foundationalContent.content?.legacy || foundationalContent.content || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(foundationalData);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve foundational statement data'
    });
  }
};

/**
 * Update foundational statement data (admin only)
 */
export const updateFoundationalStatement = async (req, res) => {
  try {
    const foundationalData = req.body;
    
    let foundationalContent = await PageContent.findOne({ pageType: 'foundational' });
    
    if (!foundationalContent) {
      foundationalContent = new PageContent({
        pageType: 'foundational',
        content: {
          sections: [],
          metadata: {
            title: 'Foundational Section',
            description: 'Main foundational section content',
            keywords: ['foundational', 'main', 'about'],
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

    // Use findOneAndUpdate to avoid version conflicts
    const updatedContent = await PageContent.findOneAndUpdate(
      { pageType: 'foundational' },
      {
        $set: {
          'content.legacy': {
            ...foundationalContent.content.legacy,
            ...foundationalData,
            lastModified: new Date()
          },
          lastModified: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: updatedContent.content.legacy,
      message: 'Foundational statement updated successfully'
    });

  } catch (error) {
    console.error('❌ Foundational update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update foundational statement',
      details: error.message
    });
  }
};

