import PageContent from '../models/PageContent.js';

/**
 * Get hero section data for admin (with auth)
 */
export const getAdminHeroSection = async (req, res) => {
  try {
    let heroContent = await PageContent.findOne({ pageType: 'hero' });
    
    if (!heroContent) {
      // Initialize with default content if not exists
      const defaultHeroContent = {
        title: { ar: 'ØµÙ…Ù‘Ù… Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©.', en: 'Design Your Own Mark.' },
        subtitle: { ar: 'Ø§Ø¨Ø¯Ø£ Ø±Ø­Ù„ØªÙƒ Ù†Ø­Ùˆ Ù‡ÙˆÙŠØ© Ø±Ù‚Ù…ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰.', en: 'Start Your Journey Towards an Unforgettable Digital Identity.' },
        description: { ar: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø­ÙˆÙ„ Ø£ÙÙƒØ§Ø±Ùƒ Ø¥Ù„Ù‰ ØªØµØ§Ù…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¹ÙƒØ³ Ø´Ø®ØµÙŠØªÙƒ ÙˆØªØ­Ù‚Ù‚ Ø£Ù‡Ø¯Ø§ÙÙƒ', en: 'At Basma Design, we turn your ideas into exceptional designs that reflect your personality and achieve your goals' },
        ctaButton: {
          text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' },
          link: '/contact',
          style: 'primary'
        },
        backgroundImage: '',
        backgroundVideo: '',
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
        overlayOpacity: 0.5,
        animation: 'fade-in',
        isActive: true
      };

      heroContent = new PageContent({
        pageType: 'hero',
        content: {
          sections: [],
          metadata: {
            title: 'Hero Section',
            description: 'Main hero section content',
            keywords: ['hero', 'main', 'landing'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultHeroContent
        },
        isActive: true,
        status: 'published'
      });
      
      await heroContent.save();
    }
    
    const heroData = heroContent.content?.legacy || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(heroData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hero section data'
    });
  }
};

/**
 * Get hero section data for public
 */
export const getHeroSection = async (req, res) => {
  try {
    let heroContent = await PageContent.findOne({ pageType: 'hero' });
    
    if (!heroContent) {
      // Initialize with default content if not exists
      const defaultHeroContent = {
        title: { ar: 'ØµÙ…Ù‘Ù… Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©.', en: 'Design Your Own Mark.' },
        subtitle: { ar: 'Ø§Ø¨Ø¯Ø£ Ø±Ø­Ù„ØªÙƒ Ù†Ø­Ùˆ Ù‡ÙˆÙŠØ© Ø±Ù‚Ù…ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰.', en: 'Start Your Journey Towards an Unforgettable Digital Identity.' },
        description: { ar: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø­ÙˆÙ„ Ø£ÙÙƒØ§Ø±Ùƒ Ø¥Ù„Ù‰ ØªØµØ§Ù…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¹ÙƒØ³ Ø´Ø®ØµÙŠØªÙƒ ÙˆØªØ­Ù‚Ù‚ Ø£Ù‡Ø¯Ø§ÙÙƒ', en: 'At Basma Design, we turn your ideas into exceptional designs that reflect your personality and achieve your goals' },
        ctaButton: {
          text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' },
          link: '/contact'
        },
        isActive: true
      };
      
      heroContent = new PageContent({
        pageType: 'hero',
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
          legacy: defaultHeroContent
        },
        isActive: true,
        status: 'published'
      });
      
      await heroContent.save();
    }

    // Get hero data from legacy field (where hero data is stored)
    const heroData = heroContent.content?.legacy || {};

    // Helper to ensure localized shape
    const toLocalized = (val, fallback) => {
      if (!val && fallback) return fallback;
      if (typeof val === 'string') return { ar: val, en: val };
      if (typeof val === 'object' && (val.ar !== undefined || val.en !== undefined)) {
        return { ar: val.ar ?? fallback?.ar ?? '', en: val.en ?? fallback?.en ?? (val.ar || '') };
      }
      return fallback || { ar: '', en: '' };
    };

    // Ensure we have the correct structure
    const responseData = {
      title: toLocalized(heroData.title, { ar: 'ØµÙ…Ù‘Ù… Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©.', en: 'Design Your Own Mark.' }),
      subtitle: toLocalized(heroData.subtitle, { ar: 'Ø§Ø¨Ø¯Ø£ Ø±Ø­Ù„ØªÙƒ Ù†Ø­Ùˆ Ù‡ÙˆÙŠØ© Ø±Ù‚Ù…ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰.', en: 'Start Your Journey Towards an Unforgettable Digital Identity.' }),
      description: toLocalized(heroData.description, { ar: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø­ÙˆÙ„ Ø£ÙÙƒØ§Ø±Ùƒ Ø¥Ù„Ù‰ ØªØµØ§Ù…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¹ÙƒØ³ Ø´Ø®ØµÙŠØªÙƒ ÙˆØªØ­Ù‚Ù‚ Ø£Ù‡Ø¯Ø§ÙÙƒ', en: 'At Basma Design, we turn your ideas into exceptional designs that reflect your personality and achieve your goals' }),
      ctaButton: {
        text: toLocalized(heroData?.ctaButton?.text, { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' }),
        link: heroData?.ctaButton?.link || '/contact',
        style: heroData?.ctaButton?.style || 'primary'
      },
      backgroundImage: heroData.backgroundImage || '',
      backgroundVideo: heroData.backgroundVideo || '',
      backgroundColor: heroData.backgroundColor || '#1e293b',
      textColor: heroData.textColor || '#ffffff',
      overlayOpacity: heroData.overlayOpacity || 0.5,
      animation: heroData.animation || 'fade-in',
      isActive: heroData.isActive !== undefined ? heroData.isActive : true
    };

    // Disable caching for dynamic content and set proper encoding
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(responseData);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hero section data'
    });
  }
};

/**
 * Update hero section data (admin only)
 */
export const updateHeroSection = async (req, res) => {
  try {
    const heroData = req.body;
    
    let heroContent = await PageContent.findOne({ pageType: 'hero' });
    
    if (!heroContent) {
      // Initialize with proper PageContent structure
      heroContent = new PageContent({ 
        pageType: 'hero', 
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
        status: 'published'
      });
    }

    // Normalize localized fields: ensure strings are stored as { ar, en }
    const toLocalized = (val, existing = {}) => {
      if (!val) return existing && typeof existing === 'object' ? existing : { ar: '', en: '' };
      if (typeof val === 'string') {
        return { ar: val, en: existing?.en || val };
      }
      if (typeof val === 'object') {
        // if already localized, keep; if object with 'ar'/'en' merge
        return {
          ar: val.ar !== undefined ? val.ar : existing?.ar || '',
          en: val.en !== undefined ? val.en : existing?.en || (typeof existing === 'string' ? existing : val.ar || '')
        };
      }
      return { ar: '', en: '' };
    };

    // Get current hero data from legacy field (where hero data should be stored)
    const currentHero = heroContent.content.legacy || {};
    
    const normalized = { ...heroData };
    if ('title' in normalized) {
      normalized.title = toLocalized(normalized.title, currentHero.title);
    }
    if ('subtitle' in normalized) {
      normalized.subtitle = toLocalized(normalized.subtitle, currentHero.subtitle);
    }
    if ('description' in normalized) {
      normalized.description = toLocalized(normalized.description, currentHero.description);
    }
    if ('ctaButton' in normalized && normalized.ctaButton) {
      const btn = { ...(currentHero.ctaButton || {}), ...(normalized.ctaButton || {}) };
      if ('text' in btn) {
        btn.text = toLocalized(btn.text, currentHero.ctaButton?.text);
      }
      normalized.ctaButton = btn;
    }

    // Store hero data in the legacy field to maintain structure
    heroContent.content.legacy = {
      ...currentHero,
      ...normalized,
      lastModified: new Date()
    };
    
    // Ensure content structure is preserved
    if (!heroContent.content.sections) heroContent.content.sections = [];
    if (!heroContent.content.metadata) {
      heroContent.content.metadata = {
        title: { ar: '', en: '' },
        description: { ar: '', en: '' },
        keywords: [],
        ogImage: '',
        canonicalUrl: '',
        robots: 'index,follow'
      };
    }
    
    heroContent.lastModified = new Date();
    
    // Use findOneAndUpdate to avoid version conflicts
    const updatedContent = await PageContent.findOneAndUpdate(
      { pageType: 'hero' },
      {
        'content.legacy': heroContent.content.legacy,
        lastModified: new Date()
      },
      { new: true, upsert: true }
    );

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: updatedContent.content.legacy,
      message: 'Hero section updated successfully'
    });

  } catch (error) {
    console.error('❌ Hero Section Update Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update hero section',
      details: error.message
    });
  }
};

