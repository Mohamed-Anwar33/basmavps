import Content from '../../models/Content.js';
import mongoose from 'mongoose';

// Get content for a specific page
const getPageContent = async (req, res) => {
  try {
    const { page } = req.params;
    
    console.log('🔍 getPageContent - Requested page:', page);
    
    // Map page types to match the saved format
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
    
    const mappedPage = pageMapping[page] || page;
    console.log('🔄 Mapped page name:', mappedPage);
    
    const content = await Content.find({ page: mappedPage }).select('key value type -_id');
    console.log('📊 Found content entries:', content.length);
    
    // Convert array to object for easier frontend usage
    const contentObject = {};
    content.forEach(item => {
      contentObject[item.key] = item.value;
    });

    console.log('📋 Content object keys:', Object.keys(contentObject));

    res.json({
      success: true,
      data: contentObject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø©'
    });
  }
};

// Update content for a specific page
const updatePageContent = async (req, res) => {
  try {
    const { page } = req.params;
    const contentData = req.body;
    const adminId = req.user?.id || req.user?._id;
    
    console.log('🔧 UpdatePageContent Debug:');
    console.log('📄 Page:', page);
    console.log('👤 Admin ID:', adminId);
    console.log('📊 Content Data:', JSON.stringify(contentData, null, 2));
    
    // Map page types to match the saved format (same as getPageContent)
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
    
    const mappedPage = pageMapping[page] || page;
    console.log('🔄 Mapped page name for save:', mappedPage);
    
    // Validate admin ID
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'معرف الإدمن مطلوب'
      });
    }

    const updates = [];

    // Process each content item
    for (const [key, value] of Object.entries(contentData)) {
      const updateData = {
        page: mappedPage,
        key,
        value,
        updatedBy: new mongoose.Types.ObjectId(adminId)
      };

      updates.push(
        Content.findOneAndUpdate(
          { page: mappedPage, key },
          updateData,
          { 
            upsert: true, 
            new: true,
            runValidators: true
          }
        )
      );
    }

    const results = await Promise.all(updates);
    
    // Return the saved content in the expected format
    const savedData = {};
    results.forEach(result => {
      if (result && result.key) {
        savedData[result.key] = result.value;
      }
    });

    res.json({
      success: true,
      data: savedData, // ← أضفت الـ data المطلوبة
      message: 'تم تحديث المحتوى بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø­ØªÙˆÙ‰'
    });
  }
};

// Get all pages with their content keys
const getAllPagesContent = async (req, res) => {
  try {
    const content = await Content.find().select('page key value type -_id');
    
    // Group content by page
    const pagesContent = {};
    content.forEach(item => {
      if (!pagesContent[item.page]) {
        pagesContent[item.page] = {};
      }
      pagesContent[item.page][item.key] = item.value;
    });

    res.json({
      success: true,
      data: pagesContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø§Øª'
    });
  }
};

// Delete specific content item
const deleteContentItem = async (req, res) => {
  try {
    const { page, key } = req.params;
    
    const deleted = await Content.findOneAndDelete({ page, key });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ø¹Ù†ØµØ± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¹Ù†ØµØ± Ø¨Ù†Ø¬Ø§Ø­'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø¹Ù†ØµØ±'
    });
  }
};

// Seed default content for pages
const seedDefaultContent = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const defaultContent = {
      home: {
        heroTitle: 'Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… - Ù†ØµÙ†Ø¹ Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ Ø¨ØµØ±ÙŠØ§Ù‹',
        heroSubtitle: 'Ù†Ø­Ù† ÙØ±ÙŠÙ‚ Ù…Ù† Ø§Ù„Ù…Ø¨Ø¯Ø¹ÙŠÙ† Ø§Ù„Ù…ØªØ®ØµØµÙŠÙ† ÙÙŠ ØªØµÙ…ÙŠÙ… Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ø¨ØµØ±ÙŠØ© ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠØŒ Ù†Ø³Ø§Ø¹Ø¯Ùƒ ÙÙŠ ØªØ±Ùƒ Ø¨ØµÙ…Ø© Ù…Ù…ÙŠØ²Ø© ÙÙŠ Ø¹Ø§Ù„Ù…Ùƒ Ø§Ù„Ø±Ù‚Ù…ÙŠ',
        ctaText: 'Ø§Ø¨Ø¯Ø£ Ù…Ø´Ø±ÙˆØ¹Ùƒ',
        ctaLink: '/contact',
        foundationalTitle: 'Ù†Ø¤Ù…Ù† Ø¨Ù‚ÙˆØ© Ø§Ù„ØªØµÙ…ÙŠÙ…',
        foundationalDescription: 'Ø§Ù„ØªØµÙ…ÙŠÙ… Ù„ÙŠØ³ Ù…Ø¬Ø±Ø¯ Ø´ÙƒÙ„ Ø¬Ù…ÙŠÙ„ØŒ Ø¨Ù„ Ù‡Ùˆ Ù„ØºØ© ØªØªØ­Ø¯Ø« Ù…Ø¹ Ø¬Ù…Ù‡ÙˆØ±Ùƒ ÙˆØªÙ†Ù‚Ù„ Ø±Ø³Ø§Ù„ØªÙƒ Ø¨ÙˆØ¶ÙˆØ­ ÙˆØªØ£Ø«ÙŠØ±',
        servicesTitle: 'Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…ØªÙ…ÙŠØ²Ø©',
        servicesDescription: 'Ù†Ù‚Ø¯Ù… Ù…Ø¬Ù…ÙˆØ¹Ø© Ø´Ø§Ù…Ù„Ø© Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…ØªØ®ØµØµØ© ÙÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ù‚Ù…ÙŠ',
        showCounters: true,
        countersTitle: 'Ø£Ø±Ù‚Ø§Ù…Ù†Ø§ ØªØªØ­Ø¯Ø«'
      },
      about: {
        heroTitle: 'Ù†Ø­Ù† Ù„Ø§ Ù†Ù†Ø§ÙØ³ Ø¹Ù„Ù‰ Ø§Ù„Ø´ÙƒÙ„ØŒ Ø¨Ù„ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø«Ø±',
        heroSubtitle: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø¤Ù…Ù† Ø£Ù† Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ Ù„Ø§ ÙŠÙ‚ØªØµØ± Ø¹Ù„Ù‰ Ø§Ù„Ø¬Ù…Ø§Ù„ Ø§Ù„Ø¨ØµØ±ÙŠØŒ Ø¨Ù„ ÙŠÙ…ØªØ¯ Ù„ÙŠØ´Ù…Ù„ Ø§Ù„Ù‚Ø¯Ø±Ø© Ø¹Ù„Ù‰ ØªØ±Ùƒ Ø£Ø«Ø± Ø¥ÙŠØ¬Ø§Ø¨ÙŠ ÙˆØ¯Ø§Ø¦Ù… ÙÙŠ Ù†ÙÙˆØ³ Ø§Ù„Ø¬Ù…Ù‡ÙˆØ±',
        missionTitle: 'Ø±Ø³Ø§Ù„ØªÙ†Ø§',
        missionDesc: 'Ù†Ø³Ø¹Ù‰ Ù„Ø£Ù† Ù†ÙƒÙˆÙ† Ø§Ù„Ø´Ø±ÙŠÙƒ Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ÙŠ Ø§Ù„Ù…ÙˆØ«ÙˆÙ‚ Ù„ÙƒÙ„ Ù…Ù† ÙŠØ±ÙŠØ¯ Ø£Ù† ÙŠØªØ±Ùƒ Ø¨ØµÙ…Ø© Ù…Ù…ÙŠØ²Ø© ÙÙŠ Ø¹Ø§Ù„Ù…Ù‡ Ø§Ù„Ø±Ù‚Ù…ÙŠ. Ù†Ø­Ù† Ù†Ø¤Ù…Ù† Ø¨Ù‚ÙˆØ© Ø§Ù„ØªØµÙ…ÙŠÙ… ÙÙŠ ØªØºÙŠÙŠØ± Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„ØªÙŠ ÙŠÙ†Ø¸Ø± Ø¨Ù‡Ø§ Ø§Ù„Ø¹Ø§Ù„Ù… Ù„Ø¹Ù„Ø§Ù…ØªÙƒ Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©.',
        visionTitle: 'Ø±Ø¤ÙŠØªÙ†Ø§ Ù„Ù„Ù…Ø³ØªÙ‚Ø¨Ù„',
        visionBody: 'Ù†Ø·Ù…Ø­ Ù„Ø£Ù† Ù†ÙƒÙˆÙ† Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø£ÙˆÙ„ Ø§Ù„Ø°ÙŠ ÙŠØªØ¨Ø§Ø¯Ø± Ù„Ù„Ø°Ù‡Ù† Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙÙƒØ± Ø£Ø­Ø¯Ù‡Ù… ÙÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ ÙÙŠ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©. Ù†Ø±ÙŠØ¯ Ø£Ù† Ù†Ø³Ø§Ù‡Ù… ÙÙŠ Ø±ÙØ¹ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ø¹Ø±Ø¨ÙŠ ÙˆÙ†Ø¬Ø¹Ù„Ù‡ Ù…Ù†Ø§ÙØ³Ø§Ù‹ Ø¹Ø§Ù„Ù…ÙŠØ§Ù‹.',
        ctaPrimaryText: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§',
        ctaPrimaryLink: '/contact',
        ctaSecondaryText: 'ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø®Ø¯Ù…Ø§ØªÙ†Ø§',
        ctaSecondaryLink: '/services'
      },
      services: {
        heroTitle: 'Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…ØªÙ…ÙŠØ²Ø©',
        heroDescription: 'Ù†Ù‚Ø¯Ù… Ù…Ø¬Ù…ÙˆØ¹Ø© Ø´Ø§Ù…Ù„Ø© Ù…Ù† Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…ØªØ®ØµØµØ© ÙÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„ØªØ·ÙˆÙŠØ± Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ ØªØ­Ù‚ÙŠÙ‚ Ø£Ù‡Ø¯Ø§ÙÙƒ Ø§Ù„Ø±Ù‚Ù…ÙŠØ©',
        showFeatured: true,
        featuredTitle: 'Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…Ù…ÙŠØ²Ø©',
        processTitle: 'Ø¹Ù…Ù„ÙŠØªÙ†Ø§ Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ©',
        processDescription: 'Ù…Ù†Ù‡Ø¬ÙŠØ© Ù…Ø¯Ø±ÙˆØ³Ø© Ù†ØªØ¨Ø¹Ù‡Ø§ Ù…Ø¹ ÙƒÙ„ Ù…Ø´Ø±ÙˆØ¹ Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø£ÙØ¶Ù„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬'
      },
      contact: {
        pageTitle: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§',
        pageDescription: 'Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ ØªØ­Ù‚ÙŠÙ‚ Ø±Ø¤ÙŠØªÙƒ. ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø§Ù„ÙŠÙˆÙ… ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø§Ø³ØªØ´Ø§Ø±Ø© Ù…Ø¬Ø§Ù†ÙŠØ© Ù„Ù…Ø´Ø±ÙˆØ¹Ùƒ',
        officeAddress: 'Ø§Ù„Ø±ÙŠØ§Ø¶ØŒ Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©',
        phoneNumber: '+966XXXXXXXXX',
        whatsappNumber: '+966XXXXXXXXX',
        emailAddress: 'info@basmatdesign.com',
        workingHours: 'Ø§Ù„Ø£Ø­Ø¯ - Ø§Ù„Ø®Ù…ÙŠØ³: 9:00 Øµ - 6:00 Ù…',
        socialLinks: 'ØªÙˆÙŠØªØ±: @basmatdesign\nØ¥Ù†Ø³ØªØºØ±Ø§Ù…: @basmatdesign\nÙ„ÙŠÙ†ÙƒØ¯ Ø¥Ù†: basmat-design'
      },
      faq: {
        pageTitle: 'Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©',
        pageDescription: 'Ø¥Ø¬Ø§Ø¨Ø§Øª Ø¹Ù„Ù‰ Ø£ÙƒØ«Ø± Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø´ÙŠÙˆØ¹Ø§Ù‹ Ø­ÙˆÙ„ Ø®Ø¯Ù…Ø§ØªÙ†Ø§ ÙˆØ·Ø±ÙŠÙ‚Ø© Ø¹Ù…Ù„Ù†Ø§',
        introText: 'Ù†Ø¬ÙŠØ¨ Ù‡Ù†Ø§ Ø¹Ù„Ù‰ Ø£ÙƒØ«Ø± Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„ØªÙŠ ØªØ±Ø¯Ù†Ø§ Ù…Ù† Ø¹Ù…Ù„Ø§Ø¦Ù†Ø§. Ø¥Ø°Ø§ Ù„Ù… ØªØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø© Ø³Ø¤Ø§Ù„ÙƒØŒ Ù„Ø§ ØªØªØ±Ø¯Ø¯ ÙÙŠ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ù…Ø¨Ø§Ø´Ø±Ø©.',
        contactText: 'Ù„Ù… ØªØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø© Ø³Ø¤Ø§Ù„ÙƒØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ ÙˆØ³Ù†Ø¬ÙŠØ¨ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ø³ØªÙØ³Ø§Ø±Ø§ØªÙƒ ÙÙŠ Ø£Ø³Ø±Ø¹ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†.'
      },
      blog: {
        pageTitle: 'Ù…Ø¯ÙˆÙ†Ø© Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…',
        pageDescription: 'Ø§ÙƒØªØ´Ù Ø£Ø­Ø¯Ø« Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª ÙˆØ§Ù„Ù†ØµØ§Ø¦Ø­ ÙÙŠ Ø¹Ø§Ù„Ù… Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ Ø§Ù„Ø±Ù‚Ù…ÙŠ',
        featuredTitle: 'Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù…Ù…ÙŠØ²Ø©',
        showCategories: true,
        postsPerPage: '12'
      },
      'how-to-order': {
        pageTitle: 'ÙƒÙŠÙ ØªØ·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ',
        pageDescription: 'Ø¯Ù„ÙŠÙ„ Ø´Ø§Ù…Ù„ Ù„Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø§ØªÙ†Ø§ ÙˆØ§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø£ÙØ¶Ù„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬',
        introText: 'Ù†Ø­Ù† Ù†Ø¬Ø¹Ù„ Ø¹Ù…Ù„ÙŠØ© Ø·Ù„Ø¨ Ø§Ù„Ø®Ø¯Ù…Ø© Ø³Ù‡Ù„Ø© ÙˆÙ…Ø±ÙŠØ­Ø©. Ø§ØªØ¨Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø¨Ø³ÙŠØ·Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.',
        stepsTitle: 'Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø·Ù„Ø¨',
        contactInfo: 'Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© ÙˆØ§Ù„Ø§Ø³ØªÙØ³Ø§Ø±Ø§Øª:\nÙˆØ§ØªØ³Ø§Ø¨: +966XXXXXXXXX\nØ¥ÙŠÙ…ÙŠÙ„: info@basmatdesign.com'
      },
      policies: {
        pageTitle: 'Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª ÙˆØ§Ù„Ø´Ø±ÙˆØ·',
        lastUpdated: '2024-01-01',
        privacyPolicy: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ© ØªØªØ¶Ù…Ù† ÙƒÙŠÙÙŠØ© Ø¬Ù…Ø¹ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø´Ø®ØµÙŠØ©...',
        termsOfService: 'Ø´Ø±ÙˆØ· Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ØªØ­Ø¯Ø¯ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ ÙˆØ§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹Ù†Ø§ ÙˆØ®Ø¯Ù…Ø§ØªÙ†Ø§...',
        refundPolicy: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© ØªØ­Ø¯Ø¯ Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ø§Ù„Ø£Ù…ÙˆØ§Ù„...',
        cookiePolicy: 'Ø³ÙŠØ§Ø³Ø© Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· ØªÙˆØ¶Ø­ ÙƒÙŠÙÙŠØ© Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù†Ø§ Ù„Ù„ÙƒÙˆÙƒÙŠØ²...'
      }
    };

    const operations = [];

    for (const [page, content] of Object.entries(defaultContent)) {
      for (const [key, value] of Object.entries(content)) {
        operations.push(
          Content.findOneAndUpdate(
            { page, key },
            { 
              page, 
              key, 
              value, 
              updatedBy: new mongoose.Types.ObjectId(adminId),
              type: typeof value === 'boolean' ? 'boolean' : 'text'
            },
            { 
              upsert: true, 
              new: true,
              runValidators: true
            }
          )
        );
      }
    }

    await Promise.all(operations);

    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ Ø¨Ù†Ø¬Ø§Ø­'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ'
    });
  }
};

export {
  getPageContent,
  updatePageContent,
  getAllPagesContent,
  deleteContentItem,
  seedDefaultContent
};

