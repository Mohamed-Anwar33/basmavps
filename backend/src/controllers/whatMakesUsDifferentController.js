import PageContent from '../models/PageContent.js';

// Get what-makes-us-different section data (public endpoint)
export const getWhatMakesUsDifferent = async (req, res) => {
  try {
    const section = await PageContent.findOne({ pageType: 'what-makes-us-different' });
    
    if (!section || !section.content.legacy) {
      return res.json({
        success: true,
        title: "Ù„Ù…Ø§Ø°Ø§ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŸ",
        subtitle: "Ù„Ø£Ù†Ù†Ø§ Ù†ØµÙ…Ù… Ù„ÙŠØ¨Ù‚Ù‰ Ø§Ù„Ø£Ø«Ø±ØŒ ÙˆÙ†ÙƒØªØ¨ Ù„Ù†Ø­Ø±Ùƒ Ø§Ù„Ø´Ø¹ÙˆØ±ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ø±Ù‚Ù…ÙŠØ§Ù‹ ÙŠØ¹Ø¨Ø± Ø¹Ù†Ùƒ.",
        items: [
          {
            title: "ØªØµÙ…ÙŠÙ… ÙŠØ­Ù…Ù„ Ø¨ØµÙ…ØªÙƒ",
            description: "ÙƒÙ„ ØªØµÙ…ÙŠÙ… ÙŠÙØµÙ†Ø¹ Ù„ÙŠØ¹ÙƒØ³ Ù‡ÙˆÙŠØªÙƒ Ø§Ù„ÙØ±ÙŠØ¯Ø© ÙˆÙŠÙ…ÙŠØ²Ùƒ Ø¹Ù† Ø§Ù„Ù…Ù†Ø§ÙØ³ÙŠÙ†",
            iconName: "paintbrush",
            iconColor: "text-pink-600",
            bgGradient: "from-pink-100 to-rose-100"
          },
          {
            title: "Ø´ÙØ§ÙÙŠØ© Ùˆ Ø¥Ø­ØªØ±Ø§ÙÙŠØ©",
            description: "Ø³ÙŠØ§Ø³Ø§ØªÙ†Ø§ ÙˆØ§Ø¶Ø­Ø© ÙˆØªØ¹Ø§Ù…Ù„Ù†Ø§ Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©",
            iconName: "award",
            iconColor: "text-emerald-600",
            bgGradient: "from-emerald-100 to-teal-100"
          },
          {
            title: "ØªØ³Ù„ÙŠÙ… Ù…Ø¯Ø±ÙˆØ³",
            description: "Ù†Ù„ØªØ²Ù… Ø¨Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ø­Ø¯Ø¯ ÙˆÙ†Ø¶Ù…Ù† Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ© ÙÙŠ ÙƒÙ„ Ù…Ø´Ø±ÙˆØ¹",
            iconName: "check-circle",
            iconColor: "text-amber-600",
            bgGradient: "from-amber-100 to-yellow-100"
          },
          {
            title: "Ø®Ø¯Ù…Ø© ØªÙØµÙ…Ù… Ù„ØªÙØ­Ø¯Ø« ÙØ±Ù‚Ù‹Ø§",
            description: "ØªØ¬Ø±Ø¨Ø© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø© ØªØ­ÙˆÙ„ Ø±Ø¤ÙŠØªÙƒ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹ Ù…Ù„Ù…ÙˆØ³",
            iconName: "lightbulb",
            iconColor: "text-indigo-600",
            bgGradient: "from-indigo-100 to-violet-100"
          }
        ]
      });
    }

    const data = section.content.legacy;
    
    res.json({
      success: true,
      title: data.title?.ar || "Ù„Ù…Ø§Ø°Ø§ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŸ",
      subtitle: data.subtitle?.ar || "Ù„Ø£Ù†Ù†Ø§ Ù†ØµÙ…Ù… Ù„ÙŠØ¨Ù‚Ù‰ Ø§Ù„Ø£Ø«Ø±ØŒ ÙˆÙ†ÙƒØªØ¨ Ù„Ù†Ø­Ø±Ùƒ Ø§Ù„Ø´Ø¹ÙˆØ±ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ø±Ù‚Ù…ÙŠØ§Ù‹ ÙŠØ¹Ø¨Ø± Ø¹Ù†Ùƒ.",
      items: data.items?.map(item => ({
        title: item.title?.ar || item.title,
        description: item.description?.ar || item.description,
        iconName: item.iconName,
        iconColor: item.iconColor,
        bgGradient: item.bgGradient
      })) || []
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

// Get what-makes-us-different section data for admin
export const getAdminWhatMakesUsDifferent = async (req, res) => {
  try {
    const section = await PageContent.findOne({ pageType: 'what-makes-us-different' });
    
    if (!section || !section.content.legacy) {
      return res.json({
        success: true,
        title: {
          ar: "Ù„Ù…Ø§Ø°Ø§ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŸ",
          en: "Why Basma Design?"
        },
        subtitle: {
          ar: "Ù„Ø£Ù†Ù†Ø§ Ù†ØµÙ…Ù… Ù„ÙŠØ¨Ù‚Ù‰ Ø§Ù„Ø£Ø«Ø±ØŒ ÙˆÙ†ÙƒØªØ¨ Ù„Ù†Ø­Ø±Ùƒ Ø§Ù„Ø´Ø¹ÙˆØ±ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ø±Ù‚Ù…ÙŠØ§Ù‹ ÙŠØ¹Ø¨Ø± Ø¹Ù†Ùƒ.",
          en: "Because we design to leave an impact, write to move emotions, and build a digital presence that expresses you."
        },
        items: [
          {
            title: {
              ar: "ØªØµÙ…ÙŠÙ… ÙŠØ­Ù…Ù„ Ø¨ØµÙ…ØªÙƒ",
              en: "Design that carries your signature"
            },
            description: {
              ar: "ÙƒÙ„ ØªØµÙ…ÙŠÙ… ÙŠÙØµÙ†Ø¹ Ù„ÙŠØ¹ÙƒØ³ Ù‡ÙˆÙŠØªÙƒ Ø§Ù„ÙØ±ÙŠØ¯Ø© ÙˆÙŠÙ…ÙŠØ²Ùƒ Ø¹Ù† Ø§Ù„Ù…Ù†Ø§ÙØ³ÙŠÙ†",
              en: "Every design is crafted to reflect your unique identity and distinguish you from competitors"
            },
            iconName: "paintbrush",
            iconColor: "text-pink-600",
            bgGradient: "from-pink-100 to-rose-100"
          },
          {
            title: {
              ar: "Ø´ÙØ§ÙÙŠØ© Ùˆ Ø¥Ø­ØªØ±Ø§ÙÙŠØ©",
              en: "Transparency & Professionalism"
            },
            description: {
              ar: "Ø³ÙŠØ§Ø³Ø§ØªÙ†Ø§ ÙˆØ§Ø¶Ø­Ø© ÙˆØªØ¹Ø§Ù…Ù„Ù†Ø§ Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©",
              en: "Our policies are clear and our dealings are built on trust and absolute professionalism"
            },
            iconName: "award",
            iconColor: "text-emerald-600",
            bgGradient: "from-emerald-100 to-teal-100"
          },
          {
            title: {
              ar: "ØªØ³Ù„ÙŠÙ… Ù…Ø¯Ø±ÙˆØ³",
              en: "Thoughtful Delivery"
            },
            description: {
              ar: "Ù†Ù„ØªØ²Ù… Ø¨Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ø­Ø¯Ø¯ ÙˆÙ†Ø¶Ù…Ù† Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ© ÙÙŠ ÙƒÙ„ Ù…Ø´Ø±ÙˆØ¹",
              en: "We commit to deadlines and guarantee high quality in every project"
            },
            iconName: "check-circle",
            iconColor: "text-amber-600",
            bgGradient: "from-amber-100 to-yellow-100"
          },
          {
            title: {
              ar: "Ø®Ø¯Ù…Ø© ØªÙØµÙ…Ù… Ù„ØªÙØ­Ø¯Ø« ÙØ±Ù‚Ù‹Ø§",
              en: "Service designed to make a difference"
            },
            description: {
              ar: "ØªØ¬Ø±Ø¨Ø© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø© ØªØ­ÙˆÙ„ Ø±Ø¤ÙŠØªÙƒ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹ Ù…Ù„Ù…ÙˆØ³",
              en: "A comprehensive creative experience that transforms your vision into tangible reality"
            },
            iconName: "lightbulb",
            iconColor: "text-indigo-600",
            bgGradient: "from-indigo-100 to-violet-100"
          }
        ]
      });
    }

    const data = section.content.legacy;
    
    res.json({
      success: true,
      ...data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù‚Ø³Ù…'
    });
  }
};

// Update what-makes-us-different section data
export const updateWhatMakesUsDifferent = async (req, res) => {
  try {
    const { title, subtitle, items } = req.body;
    
    if (!title || !subtitle || !items) {
      return res.status(400).json({
        success: false,
        message: 'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù…ÙÙ‚ÙˆØ¯Ø©'
      });
    }

    const updateData = {
      title,
      subtitle,
      items: items.map(item => ({
        title: item.title,
        description: item.description,
        iconName: item.iconName,
        iconColor: item.iconColor,
        bgGradient: item.bgGradient
      }))
    };

    // Use findOneAndUpdate to avoid version conflicts
    const section = await PageContent.findOneAndUpdate(
      { pageType: 'what-makes-us-different' },
      {
        $set: {
          'content.legacy': updateData,
          metadata: {
            ar: {
              title: title.ar || title,
              description: subtitle.ar || subtitle
            },
            en: {
              title: title.en || title,
              description: subtitle.en || subtitle
            }
          },
          updatedAt: new Date(),
          isActive: true
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      message: 'تم conserve data successfully'
    });
    
  } catch (error) {
    console.error('What makes us different update error:', error);
    res.status(500).json({
      success: false,
      message: 'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©',
      details: error.message
    });
  }
};
