import PageContent from '../models/PageContent.js';

/**
 * Get counters section data for admin (with auth)
 */
export const getAdminCountersSection = async (req, res) => {
  try {
    let countersContent = await PageContent.findOne({ pageType: 'counters' });
    
    if (!countersContent) {
      // Initialize with default content if not exists
      const defaultCountersContent = {
        title: 'الإحصائيات',
        subtitle: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل',
        items: [
          {
            label: 'المشاريع المنجزة',
            value: 468,
            suffix: '+',
            iconName: 'Briefcase',
            iconColor: 'text-emerald-600',
            chipBg: 'from-emerald-100 to-teal-100'
          },
          {
            label: 'العملاء',
            value: 258,
            suffix: '+',
            iconName: 'Users',
            iconColor: 'text-indigo-600',
            chipBg: 'from-indigo-100 to-blue-100'
          },
          {
            label: 'سنوات الخبرة',
            value: 6,
            suffix: '+',
            iconName: 'Timer',
            iconColor: 'text-amber-600',
            chipBg: 'from-amber-100 to-yellow-100'
          },
          {
            label: 'التقييمات',
            value: 4.9,
            suffix: ' من 5',
            iconName: 'Star',
            iconColor: 'text-rose-600',
            chipBg: 'from-rose-100 to-pink-100'
          }
        ]
      };
      
      countersContent = new PageContent({
        pageType: 'counters',
        content: {
          sections: [],
          metadata: {
            title: 'Counters Section',
            description: 'Statistics and counters section',
            keywords: ['counters', 'statistics', 'numbers'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultCountersContent
        },
        isActive: true,
        status: 'published'
      });
      
      await countersContent.save();
    }
    
    const countersData = countersContent.content?.legacy || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      sectionType: 'counters',
      counters: countersData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve counters section data'
    });
  }
};

/**
 * Get counters section data for public
 */
export const getCountersSection = async (req, res) => {
  try {
    let countersContent = await PageContent.findOne({ pageType: 'counters' });
    
    if (!countersContent) {
      // Initialize with default content if not exists
      const defaultCountersContent = {
        title: 'الإحصائيات',
        subtitle: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل',
        items: [
          {
            label: 'المشاريع المنجزة',
            value: 468,
            suffix: '+',
            iconName: 'Briefcase',
            iconColor: 'text-emerald-600',
            chipBg: 'from-emerald-100 to-teal-100'
          },
          {
            label: 'العملاء',
            value: 258,
            suffix: '+',
            iconName: 'Users',
            iconColor: 'text-indigo-600',
            chipBg: 'from-indigo-100 to-blue-100'
          },
          {
            label: 'سنوات الخبرة',
            value: 6,
            suffix: '+',
            iconName: 'Timer',
            iconColor: 'text-amber-600',
            chipBg: 'from-amber-100 to-yellow-100'
          },
          {
            label: 'التقييمات',
            value: 4.9,
            suffix: ' من 5',
            iconName: 'Star',
            iconColor: 'text-rose-600',
            chipBg: 'from-rose-100 to-pink-100'
          }
        ]
      };
      
      countersContent = new PageContent({
        pageType: 'counters',
        content: {
          sections: [],
          metadata: {
            title: 'Counters Section',
            description: 'Statistics and counters section',
            keywords: ['counters', 'statistics', 'numbers'],
            author: 'Admin',
            lastModified: new Date(),
            version: '1.0.0',
            status: 'published',
            language: 'ar',
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: defaultCountersContent
        },
        isActive: true,
        status: 'published'
      });
      
      await countersContent.save();
    }

    const countersData = countersContent.content?.legacy || countersContent.content || {};
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(countersData);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve counters section data'
    });
  }
};

/**
 * Update counters section data (admin only)
 */
export const updateCountersSection = async (req, res) => {
  try {
    const countersData = req.body;
    
    let countersContent = await PageContent.findOne({ pageType: 'counters' });
    
    if (!countersContent) {
      countersContent = new PageContent({
        pageType: 'counters',
        content: {
          sections: [],
          metadata: {
            title: { ar: 'Counters Section', en: 'Counters Section' },
            description: { ar: 'Statistics and counters section', en: 'Statistics and counters section' },
            keywords: ['counters', 'statistics', 'numbers'],
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
      { pageType: 'counters' },
      {
        $set: {
          'content.legacy': {
            ...countersContent.content.legacy,
            ...countersData,
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
      message: 'Counters section updated successfully'
    });

  } catch (error) {
    console.error('❌ Counters update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update counters section',
      details: error.message
    });
  }
};

