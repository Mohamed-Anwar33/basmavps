import Service from '../models/Service.js';
import Blog from '../models/Blog.js';
import FAQ from '../models/FAQ.js';
import Setting from '../models/Setting.js';

/**
 * @swagger
 * tags:
 *   name: Homepage
 *   description: Homepage content endpoints
 */

/**
 * @swagger
 * /api/homepage/content:
 *   get:
 *     summary: Get homepage content (hero, banners, featured services, FAQs, blog preview)
 *     tags: [Homepage]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *     responses:
 *       200:
 *         description: Homepage content retrieved successfully
 */
export const getHomepageContent = async (req, res) => {
  try {
    const { lang = 'both' } = req.query;

    // Get hero settings
    const heroSettings = await Setting.getByCategory('hero', lang);
    const hero = heroSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Get home page settings
    const homeSettings = await Setting.getByCategory('home', lang);
    const homeContent = homeSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Get featured services
    const featuredServices = await Service.findFeatured(6);

    // Get featured FAQs
    const faqs = await FAQ.findActive().limit(8);

    // Get recent blogs for preview
    const blogsPreview = await Blog.findRecent(3);

    // Get general settings
    const generalSettings = await Setting.getByCategory('general', lang);
    const general = generalSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        hero,
        homeContent,
        featuredServices,
        faqs,
        blogsPreview,
        general,
        meta: {
          lastUpdated: new Date(),
          lang
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve homepage content'
    });
  }
};

/**
 * @swagger
 * /api/hero-section:
 *   get:
 *     summary: Get hero section content
 *     tags: [Homepage]
 *     responses:
 *       200:
 *         description: Hero section content retrieved successfully
 */
export const getHeroSection = async (req, res) => {
  try {
    const { lang = 'both' } = req.query;
    
    // Get hero settings
    const heroSettings = await Setting.getByCategory('hero', lang);
    const hero = heroSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Fallback data if no settings found
    if (Object.keys(hero).length === 0) {
      const fallbackHero = {
        title: { ar: "Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…", en: "Welcome to Basmat Design" },
        subtitle: { ar: "Ù†Ø­Ù† Ù†Ù‚Ø¯Ù… Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ø§Ø­ØªØ±Ø§ÙÙŠØ©", en: "We provide professional design services" },
        description: { ar: "Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ù…ØªÙ…ÙŠØ²Ø© Ù„ØªÙ„Ø¨ÙŠØ© Ø§Ø­ØªÙŠØ§Ø¬Ø§ØªÙƒ", en: "Outstanding design services to meet your needs" }
      };
      return res.json({
        success: true,
        data: fallbackHero
      });
    }

    res.json({
      success: true,
      data: hero
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hero section'
    });
  }
};

/**
 * @swagger
 * /api/counters:
 *   get:
 *     summary: Get counters/statistics
 *     tags: [Homepage]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Counters retrieved successfully
 */
export const getCounters = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    // Get counter settings
    const counterSettings = await Setting.getByCategory('counters');
    let counters = counterSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Fallback data if no settings found
    if (Object.keys(counters).length === 0) {
      counters = [
        { id: 1, title: { ar: "Ø¹Ù…Ù„Ø§Ø¡ Ø±Ø§Ø¶ÙˆÙ†", en: "Happy Clients" }, count: 150, isActive: true },
        { id: 2, title: { ar: "Ù…Ø´Ø§Ø±ÙŠØ¹ Ù…ÙƒØªÙ…Ù„Ø©", en: "Completed Projects" }, count: 300, isActive: true },
        { id: 3, title: { ar: "Ø³Ù†ÙˆØ§Øª Ø®Ø¨Ø±Ø©", en: "Years Experience" }, count: 5, isActive: true },
        { id: 4, title: { ar: "Ø¬ÙˆØ§Ø¦Ø²", en: "Awards" }, count: 10, isActive: true }
      ];
    }

    // Filter by isActive if specified
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      if (Array.isArray(counters)) {
        counters = counters.filter(counter => counter.isActive === activeFilter);
      }
    }

    res.json({
      success: true,
      data: counters
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve counters'
    });
  }
};

