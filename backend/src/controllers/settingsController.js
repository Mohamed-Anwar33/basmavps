import Setting from '../models/Setting.js';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Website settings endpoints
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get settings by category
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [home, about, footer, policies, hero, contact, general]
 *         description: Settings category
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *         description: Language filter
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
export const getSettings = async (req, res) => {
  try {
    const { category, lang = 'both' } = req.query;

    let settings;
    if (category) {
      settings = await Setting.getByCategory(category, lang);
    } else {
      settings = await Setting.find({ isActive: true });
    }

    // Transform to simple key-value pairs for frontend
    const result = settings.map(setting => ({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      lang: setting.lang
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings'
    });
  }
};

/**
 * @swagger
 * /api/settings/{category}:
 *   get:
 *     summary: Get settings by specific category
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Settings category
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *     responses:
 *       200:
 *         description: Category settings retrieved successfully
 */
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { lang = 'both' } = req.query;

    const settings = await Setting.getByCategory(category, lang);

    // Transform to simple key-value pairs
    const result = settings.map(setting => ({
      key: setting.key,
      value: setting.value
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category settings'
    });
  }
};

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get banners by position and page
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [top, middle, bottom]
 *         description: Banner position
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page slug
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter active banners
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
export const getBanners = async (req, res) => {
  try {
    const { position, page, isActive } = req.query;

    // Get banners settings
    const bannerSettings = await Setting.getByCategory('banners', 'ar');
    
    // Create mock banner data based on position
    const banners = [];
    
    if (position === 'top') {
      const banner1Title = bannerSettings.find(s => s.key === 'mainBanner1Title');
      if (banner1Title) {
        banners.push({
          _id: 'banner-1',
          content: {
            ar: banner1Title.value,
            en: banner1Title.value
          },
          position: 'top',
          isActive: true,
          ctaButton: {
            text: {
              ar: 'Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù†',
              en: 'Order Now'
            },
            link: '/services',
            style: 'primary'
          },
          backgroundColor: '#4b2e83',
          textColor: '#ffffff'
        });
      }
    } else if (position === 'middle') {
      const banner2Title = bannerSettings.find(s => s.key === 'mainBanner2Title');
      if (banner2Title) {
        banners.push({
          _id: 'banner-2',
          content: {
            ar: banner2Title.value,
            en: banner2Title.value
          },
          position: 'middle',
          isActive: true,
          ctaButton: {
            text: {
              ar: 'Ø§ÙƒØªØ´Ù Ø§Ù„Ø¹Ø±ÙˆØ¶',
              en: 'Discover Offers'
            },
            link: '/services',
            style: 'secondary'
          },
          backgroundColor: '#7a4db3',
          textColor: '#ffffff'
        });
      }
    } else if (position === 'bottom') {
      const banner3Title = bannerSettings.find(s => s.key === 'mainBanner3Title');
      if (banner3Title) {
        banners.push({
          _id: 'banner-3',
          content: {
            ar: banner3Title.value,
            en: banner3Title.value
          },
          position: 'bottom',
          isActive: true,
          ctaButton: {
            text: {
              ar: 'Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù†',
              en: 'Start Now'
            },
            link: '/contact',
            style: 'outline'
          },
          backgroundColor: '#f4f4f6',
          textColor: '#4b2e83'
        });
      }
    }

    res.json(banners);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve banners'
    });
  }
};

/**
 * @swagger
 * /api/admin/settings/about:
 *   put:
 *     summary: Update about page settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: About settings updated successfully
 */
export const updateAboutSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    
    // Loop through all settings and update them
    for (const [key, value] of Object.entries(settingsData)) {
      await Setting.findOneAndUpdate(
        { key, category: 'about' },
        { 
          key, 
          value, 
          category: 'about',
          lang: 'ar',
          isActive: true
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({
      success: true,
      message: 'About settings updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update about settings'
    });
  }
};

