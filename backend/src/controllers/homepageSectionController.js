import HomepageSection from '../models/HomepageSection.js';

// Get all homepage sections
export const getHomepageSections = async (req, res) => {
  try {
    const { type, active } = req.query;
    
    let query = {};
    if (type) query.sectionType = type;
    if (active !== undefined) query.isActive = active === 'true';
    
    const sections = await HomepageSection.find(query).sort({ order: 1, createdAt: -1 });

    // Disable caching for dynamic content
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      data: sections,
      count: sections.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homepage sections'
    });
  }
};

// Get specific section by ID
export const getHomepageSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await HomepageSection.findById(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Homepage section not found'
      });
    }
    
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homepage section'
    });
  }
};

// Create new homepage section
export const createHomepageSection = async (req, res) => {
  try {
    const sectionData = req.body;
    
    const section = new HomepageSection(sectionData);
    await section.save();
    
    res.status(201).json({
      success: true,
      message: 'Homepage section created successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create homepage section'
    });
  }
};

// Update homepage section
export const updateHomepageSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const section = await HomepageSection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Homepage section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Homepage section updated successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update homepage section'
    });
  }
};

// Delete homepage section
export const deleteHomepageSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await HomepageSection.findByIdAndDelete(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Homepage section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Homepage section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete homepage section'
    });
  }
};

// Toggle section active status
export const toggleSectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await HomepageSection.findById(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Homepage section not found'
      });
    }
    
    await section.toggleActive();
    
    res.json({
      success: true,
      message: `Section ${section.isActive ? 'activated' : 'deactivated'} successfully`,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle section status'
    });
  }
};

// Update section order
export const updateSectionOrder = async (req, res) => {
  try {
    const { sections } = req.body; // Array of {id, order}
    
    const updatePromises = sections.map(section => 
      HomepageSection.findByIdAndUpdate(section.id, { order: section.order })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Section order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update section order'
    });
  }
};

// Initialize default homepage sections
export const initializeDefaultSections = async (req, res) => {
  try {
    // Check if sections already exist
    const existingSections = await HomepageSection.find({});
    
    if (existingSections.length > 0) {
      return res.json({
        success: true,
        message: 'Default sections already exist',
        data: existingSections
      });
    }
    
    // Create default sections
    const defaultSections = [
      {
        sectionType: 'whatMakesUsDifferent',
        order: 1,
        isActive: true,
        whatMakesUsDifferent: {
          title: {
            ar: 'Ù…Ø§ ÙŠÙ…ÙŠØ²Ù†Ø§',
            en: 'What Makes Us Different'
          },
          subtitle: {
            ar: 'Ù†Ù‚Ø¯Ù… Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¬Ù…Ø¹ Ø¨ÙŠÙ† Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ©',
            en: 'We provide exceptional design services that combine creativity and professionalism'
          },
          items: [
            {
              title: { ar: 'ØªØµÙ…ÙŠÙ… ÙŠØ­Ù…Ù„ Ø¨ØµÙ…ØªÙƒ', en: 'Design That Carries Your Mark' },
              description: { ar: 'ÙƒÙ„ ØªØµÙ…ÙŠÙ… ÙŠÙØµÙ†Ø¹ Ù„ÙŠØ¹ÙƒØ³ Ù‡ÙˆÙŠØªÙƒ Ø§Ù„ÙØ±ÙŠØ¯Ø© ÙˆÙŠÙ…ÙŠØ²Ùƒ Ø¹Ù† Ø§Ù„Ù…Ù†Ø§ÙØ³ÙŠÙ†', en: 'Every design is crafted to reflect your unique identity and distinguish you from competitors' },
              iconName: 'palette',
              iconColor: 'text-pink-600',
              bgGradient: 'from-pink-100 to-rose-100',
              order: 1
            },
            {
              title: { ar: 'Ø´ÙØ§ÙÙŠØ© Ùˆ Ø§Ø­ØªØ±Ø§ÙÙŠØ©', en: 'Transparency & Professionalism' },
              description: { ar: 'Ø³ÙŠØ§Ø³Ø§ØªÙ†Ø§ ÙˆØ§Ø¶Ø­Ø© ÙˆØªØ¹Ø§Ù…Ù„Ù†Ø§ Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©', en: 'Our policies are clear and our dealings are built on trust and absolute professionalism' },
              iconName: 'shield',
              iconColor: 'text-emerald-600',
              bgGradient: 'from-emerald-100 to-teal-100',
              order: 2
            },
            {
              title: { ar: 'ØªØ³Ù„ÙŠÙ… Ù…Ø¯Ø±ÙˆØ³', en: 'Thoughtful Delivery' },
              description: { ar: 'Ù†Ù„ØªØ²Ù… Ø¨Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ø­Ø¯Ø¯ ÙˆÙ†Ø¶Ù…Ù† Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ© ÙÙŠ ÙƒÙ„ Ù…Ø´Ø±ÙˆØ¹', en: 'We commit to deadlines and guarantee high quality in every project' },
              iconName: 'clock',
              iconColor: 'text-amber-600',
              bgGradient: 'from-amber-100 to-yellow-100',
              order: 3
            },
            {
              title: { ar: 'Ø®Ø¯Ù…Ø© ØªÙØµÙ…Ù… Ù„ØªÙØ­Ø¯Ø« ÙØ±Ù‚Ù‹Ø§', en: 'Service Designed to Make a Difference' },
              description: { ar: 'ØªØ¬Ø±Ø¨Ø© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø© ØªØ­ÙˆÙ„ Ø±Ø¤ÙŠØªÙƒ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹ Ù…Ù„Ù…ÙˆØ³', en: 'A comprehensive creative experience that transforms your vision into tangible reality' },
              iconName: 'sparkles',
              iconColor: 'text-indigo-600',
              bgGradient: 'from-indigo-100 to-violet-100',
              order: 4
            }
          ]
        }
      },
      {
        sectionType: 'counters',
        order: 2,
        isActive: true,
        counters: {
          title: {
            ar: 'Ø£Ø±Ù‚Ø§Ù…Ù†Ø§',
            en: 'Our Numbers'
          },
          subtitle: {
            ar: 'Ø£Ø±Ù‚Ø§Ù…Ù†Ø§ ØªØªØ­Ø¯Ø« Ø¹Ù† Ø§Ù„ØªØ²Ø§Ù…Ù†Ø§ØŒ Ø¥Ø¨Ø¯Ø§Ø¹Ù†Ø§ØŒ ÙˆØ´Ø±Ø§ÙƒØªÙ†Ø§ Ù…Ø¹ ÙƒÙ„ Ø¹Ù…ÙŠÙ„',
            en: 'Our numbers speak about our commitment, creativity, and partnership with every client'
          },
          items: [
            {
              label: { ar: 'Ù…Ø´Ø§Ø±ÙŠØ¹ Ù…ÙƒØªÙ…Ù„Ø©', en: 'Completed Projects' },
              value: 468,
              suffix: { ar: '+', en: '+' },
              iconName: 'briefcase',
              iconColor: 'text-emerald-600',
              chipBg: 'from-emerald-100 to-teal-100',
              order: 1
            },
            {
              label: { ar: 'Ø¹Ù…Ù„Ø§Ø¡ Ø±Ø§Ø¶ÙˆÙ†', en: 'Satisfied Clients' },
              value: 258,
              suffix: { ar: '+', en: '+' },
              iconName: 'users',
              iconColor: 'text-indigo-600',
              chipBg: 'from-indigo-100 to-blue-100',
              order: 2
            },
            {
              label: { ar: 'Ø³Ù†ÙˆØ§Øª Ø®Ø¨Ø±Ø©', en: 'Years of Experience' },
              value: 6,
              suffix: { ar: '+', en: '+' },
              iconName: 'timer',
              iconColor: 'text-amber-600',
              chipBg: 'from-amber-100 to-yellow-100',
              order: 3
            },
            {
              label: { ar: 'ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡', en: 'Client Rating' },
              value: 4.9,
              suffix: { ar: '/5', en: '/5' },
              iconName: 'star',
              iconColor: 'text-rose-600',
              chipBg: 'from-rose-100 to-pink-100',
              order: 4
            }
          ]
        }
      },
      {
        sectionType: 'closingCTA',
        order: 3,
        isActive: true,
        closingCTA: {
          title: {
            ar: 'Ø§Ø¨Ø¯Ø£ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ù…Ø¹Ù†Ø§',
            en: 'Start Your Project With Us'
          },
          subtitle: {
            ar: 'Ø­ÙˆÙ„ ÙÙƒØ±ØªÙƒ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹ Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ø­ØªØ±Ù',
            en: 'Turn your idea into reality with Basma Design professional team'
          },
          description: {
            ar: 'Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ù†Ø³Ø§Ø¹Ø¯Ùƒ ÙÙŠ ØªØ­Ù‚ÙŠÙ‚ Ø£Ù‡Ø¯Ø§ÙÙƒ Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ© Ù…Ù† Ø®Ù„Ø§Ù„ Ø­Ù„ÙˆÙ„ ØªØµÙ…ÙŠÙ… Ù…Ø¨ØªÙƒØ±Ø© ÙˆÙ…ØªÙ…ÙŠØ²Ø©',
            en: 'We are here to help you achieve your business goals through innovative and distinctive design solutions'
          },
          primaryButton: {
            text: { ar: 'Ø§Ø¨Ø¯Ø£ Ù…Ø´Ø±ÙˆØ¹Ùƒ', en: 'Start Your Project' },
            link: '/services'
          },
          secondaryButton: {
            text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' },
            link: '/contact'
          },
          backgroundGradient: 'from-primary/90 to-accent/90'
        }
      }
    ];
    
    const createdSections = await HomepageSection.insertMany(defaultSections);
    
    res.status(201).json({
      success: true,
      message: 'Default homepage sections initialized successfully',
      data: createdSections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize default sections'
    });
  }
};

