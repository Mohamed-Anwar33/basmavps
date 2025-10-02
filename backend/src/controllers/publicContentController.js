import PageContent from '../models/PageContent.js';
import Content from '../models/Content.js';

// Convert flat Content model data to structured format
function convertFlatToStructured(flatData) {
  try {
    const structured = {
      sections: [],
      metadata: {}
    };
    
    // Build Hero section
    const heroData = {
      badge: { ar: flatData['hero.badge.ar'] || '' },
      title: { ar: flatData['hero.title.ar'] || '' },
      description: { ar: flatData['hero.description.ar'] || '' }
    };
    if (heroData.title.ar || heroData.description.ar) {
      structured.sections.push({
        id: 'hero',
        type: 'custom',
        data: heroData,
        order: 0,
        isActive: true
      });
    }
    
    // Build Steps section
    const stepsData = {
      heading: { ar: flatData['steps.heading.ar'] || '' },
      items: flatData['steps.items'] ? JSON.parse(flatData['steps.items']) : [],
      processHighlights: flatData['steps.processHighlights'] ? JSON.parse(flatData['steps.processHighlights']) : []
    };
    if (stepsData.heading.ar || stepsData.items.length) {
      structured.sections.push({
        id: 'steps',
        type: 'custom',
        data: stepsData,
        order: 1,
        isActive: true
      });
    }
    
    // Build Notes section
    const notesData = {
      heading: { ar: flatData['notes.heading.ar'] || '' },
      items: flatData['notes.items'] ? JSON.parse(flatData['notes.items']) : []
    };
    if (notesData.heading.ar || notesData.items.length) {
      structured.sections.push({
        id: 'notes',
        type: 'custom',
        data: notesData,
        order: 2,
        isActive: true
      });
    }
    
    // Build CTA section
    const ctaData = {
      title: { ar: flatData['cta.title.ar'] || '' },
      description: { ar: flatData['cta.description.ar'] || '' },
      button: {
        text: { ar: flatData['cta.button.text.ar'] || '' },
        link: flatData['cta.button.link'] || ''
      }
    };
    if (ctaData.title.ar || ctaData.description.ar) {
      structured.sections.push({
        id: 'cta',
        type: 'custom',
        data: ctaData,
        order: 3,
        isActive: true
      });
    }
    
    // Build metadata
    structured.metadata = {
      title: { ar: flatData['metadata.title.ar'] || '' },
      description: { ar: flatData['metadata.description.ar'] || '' },
      keywords: flatData['metadata.keywords'] ? JSON.parse(flatData['metadata.keywords']) : []
    };
    
    return structured;
  } catch (e) {
    console.error('Error converting flat to structured:', e);
    return null;
  }
}

// Build default content for howToOrder matching current frontend static page
function buildDefaultHowToOrderContent() {
  return {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        data: {
          badge: { ar: 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ø´Ø§Ù…Ù„', en: 'Complete Ordering Guide' },
          title: { ar: 'ÙƒÙŠÙ ØªØ·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒØŸ', en: 'How to order your service?' },
          description: {
            ar: 'ÙÙŠ "Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…"ØŒ Ù†Ø¬Ø¹Ù„ Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø³Ù‡Ù„Ø§Ù‹ ÙˆØ³Ø±ÙŠØ¹Ø§Ù‹ Ø¨Ø®Ø·ÙˆØ§Øª ÙˆØ§Ø¶Ø­Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø©',
            en: 'At Basmat Design, we make ordering your service easy and fast with clear steps.'
          },
          background: { type: 'grid', url: '/grid.svg' }
        },
        order: 0,
        isActive: true,
        settings: {}
      },
      {
        id: 'steps',
        type: 'steps',
        data: {
          heading: { ar: 'Ø®Ø·ÙˆØ§Øª Ø¨Ø³ÙŠØ·Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø®Ø¯Ù…ØªÙƒ', en: 'Simple steps to get your service' },
          items: [
            {
              order: 1,
              title: { ar: 'Ø§Ø®ØªØ± Ø®Ø¯Ù…ØªÙƒ', en: 'Choose your service' },
              description: {
                ar: 'ØªØµÙØ­ Ù‚Ø³Ù… Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ø®ØªØ± Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬Ù‡Ø§ Ù…Ù† Ù…Ø¬Ù…ÙˆØ¹Ø© Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…ØªÙ†ÙˆØ¹Ø©',
                en: 'Browse our services and choose what you need from our variety of offerings.'
              },
              theme: 'primary'
            },
            {
              order: 2,
              title: { ar: 'Ø£ÙƒÙ…Ù„ Ø§Ù„Ø¯ÙØ¹', en: 'Complete payment' },
              description: {
                ar: 'Ø§Ø¯ÙØ¹ Ø¨Ø£Ù…Ø§Ù† Ø¹Ø¨Ø± PayPal Ø£Ùˆ ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…ØªØ§Ø­Ø© Ø¨Ø®Ø·ÙˆØ§Øª Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…Ø­Ù…ÙŠØ©',
                en: 'Pay securely via PayPal or available methods with quick, protected steps.'
              },
              theme: 'emerald'
            },
            {
              order: 3,
              title: { ar: 'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†ÙÙŠØ°', en: 'Start execution' },
              description: {
                ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ù„ØªÙˆØ¶ÙŠØ­ ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨Ùƒ ÙˆÙ†Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†ÙÙŠØ° ÙÙˆØ±Ø§Ù‹',
                en: 'Contact us on WhatsApp to clarify details and we start immediately.'
              },
              theme: 'amber'
            }
          ],
          processHighlights: [
            { text: { ar: 'Ù„Ø§ Ø­Ø§Ø¬Ø© Ù„Ù†Ù…Ø§Ø°Ø¬ Ù…Ø¹Ù‚Ø¯Ø©', en: 'No complex forms' }, icon: 'check' },
            { text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ø§Ù„ÙØ±ÙŠÙ‚', en: 'Direct communication with the team' }, icon: 'check' },
            { text: { ar: 'Ø¨Ø¯Ø§ÙŠØ© ÙÙˆØ±ÙŠØ© Ù„Ù„ØªÙ†ÙÙŠØ°', en: 'Immediate start' }, icon: 'check' }
          ]
        },
        order: 1,
        isActive: true,
        settings: {}
      },
      {
        id: 'notes',
        type: 'notes',
        data: {
          heading: { ar: 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ù‡Ù…Ø© Ù„Ø¶Ù…Ø§Ù† Ø£ÙØ¶Ù„ Ø®Ø¯Ù…Ø©', en: 'Important notes for the best service' },
          items: [
            {
              title: { ar: 'Ø§Ù„ØªØ­Ø¶ÙŠØ± Ø§Ù„Ù…Ø³Ø¨Ù‚', en: 'Preparation' },
              description: { ar: 'ÙŠÙØ±Ø¬Ù‰ ØªØ¬Ù‡ÙŠØ² ÙˆØµÙ ÙˆØ§Ø¶Ø­ ÙˆÙ…ÙØµÙ„ Ù„Ø·Ù„Ø¨Ùƒ Ù‚Ø¨Ù„ Ø¨Ø¯Ø¡ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ù„Ø¶Ù…Ø§Ù† ÙÙ‡Ù… Ù…ØªØ·Ù„Ø¨Ø§ØªÙƒ Ø¨Ø¯Ù‚Ø©', en: 'Please prepare a clear and detailed brief before chatting to ensure we understand your needs accurately.' },
              theme: 'amber',
              icon: 'clock'
            },
            {
              title: { ar: 'Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª', en: 'Pricing & revisions' },
              description: { ar: 'Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø«Ø§Ø¨ØªØ© Ù„ÙƒÙ„ Ø®Ø¯Ù…Ø©ØŒ ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ù…Ø­Ø¯ÙˆØ¯Ø© Ø­Ø³Ø¨ Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©', en: 'Pricing is fixed per service, with revisions limited by service type.' },
              theme: 'blue',
              icon: 'shield'
            },
            {
              title: { ar: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø¥Ù„ØºØ§Ø¡', en: 'Cancellation policy' },
              description: { ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø¯Ù…Ø§Øª ØºÙŠØ± Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø¥Ù„ØºØ§Ø¡ Ø£Ùˆ Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ø¨Ø¹Ø¯ Ø¥ØªÙ…Ø§Ù… Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø¯ÙØ¹', en: 'All services are non-cancelable and non-refundable after payment.' },
              theme: 'red',
              icon: 'alert'
            },
            {
              title: { ar: 'Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ø±Ù‚Ù…ÙŠ', en: 'Digital delivery' },
              description: { ar: 'Ø®Ø¯Ù…Ø© "Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ© Ø§Ù„Ø¬Ø§Ù‡Ø²" ØªÙØ±Ø³Ù„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙ„Ø§ ØªØªØ·Ù„Ø¨ ØªÙˆØ§ØµÙ„ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨', en: 'CV template service is delivered by email and does not require WhatsApp communication.' },
              theme: 'emerald',
              icon: 'message'
            }
          ]
        },
        order: 2,
        isActive: true,
        settings: {}
      },
      {
        id: 'cta',
        type: 'cta',
        data: {
          title: { ar: 'Ø¬Ø§Ù‡Ø² Ù„Ø¨Ø¯Ø¡ Ù…Ø´Ø±ÙˆØ¹ÙƒØŸ', en: 'Ready to start your project?' },
          description: { ar: 'Ø§Ø®ØªØ± Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù† ÙˆØ§Ø¨Ø¯Ø£ Ø±Ø­Ù„Ø© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…', en: 'Choose your service now and start a creative journey with Basmat Design.' },
          button: { text: { ar: 'ØªØµÙØ­ Ø§Ù„Ø®Ø¯Ù…Ø§Øª', en: 'Browse Services' }, link: '/services', style: 'primary' },
          badgeIcon: 'sparkles'
        },
        order: 3,
        isActive: true,
        settings: { gradient: true }
      }
    ],
    metadata: {
      title: { ar: 'ÙƒÙŠÙ ØªØ·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ | Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…', en: 'How to Order | Basmat Design' },
      description: {
        ar: 'Ø§ØªØ¨Ø¹ Ø®Ø·ÙˆØ§Øª Ø¨Ø³ÙŠØ·Ø© Ù„Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ù…Ù† Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…: Ø§Ø®ØªØ± Ø§Ù„Ø®Ø¯Ù…Ø©ØŒ Ø§Ø¯ÙØ¹ Ø¨Ø£Ù…Ø§Ù†ØŒ ÙˆØ§Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†ÙÙŠØ° ÙÙˆØ±Ø§Ù‹.',
        en: 'Follow simple steps to order your service from Basmat Design: choose, pay securely, and start immediately.'
      },
      keywords: ['how to order', 'Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø©', 'Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…', 'Ø®Ø¯Ù…Ø§Øª ØªØµÙ…ÙŠÙ…'],
      ogImage: '',
      canonicalUrl: '',
      robots: 'index,follow'
    },
    legacy: {}
  };
}

export async function getPublicPageContent(req, res) {
  try {
    const { pageType } = req.params;

    console.log(`🔍 Public API: Fetching page content for ${pageType}`);

    // First, try to get content from the Content model (flat format from admin)
    console.log(`🔍 Searching for page: ${pageType}`);
    
    // Try multiple page name variations
    const pageVariations = [
      pageType,
      pageType.toLowerCase(),
      'how-to-order',
      'howToOrder'
    ];
    
    let contentEntries = [];
    for (const variation of pageVariations) {
      const entries = await Content.find({ 
        page: new RegExp(`^${variation}$`, 'i') 
      }).select('key value page -_id');
      
      if (entries.length > 0) {
        contentEntries = entries;
        console.log(`✅ Found content with page variation: ${variation}`);
        break;
      }
    }

    console.log(`📊 Raw content entries:`, contentEntries.map(e => ({ page: e.page, key: e.key, value: typeof e.value === 'string' ? e.value.substring(0, 50) + '...' : e.value })));

    console.log(`📊 Found ${contentEntries.length} content entries from Content model`);

    if (contentEntries.length > 0) {
      // Convert flat data to object
      const flatData = {};
      contentEntries.forEach(entry => {
        flatData[entry.key] = entry.value;
      });

      console.log('📋 Flat data keys:', Object.keys(flatData));
      console.log('📋 Flat data values sample:', {
        'hero.title.ar': flatData['hero.title.ar'],
        'hero.description.ar': flatData['hero.description.ar'],
        'steps.heading.ar': flatData['steps.heading.ar'],
        'cta.title.ar': flatData['cta.title.ar']
      });

      // Convert to structured format
      const structuredContent = convertFlatToStructured(flatData);
      console.log('🔄 Structured content:', JSON.stringify(structuredContent, null, 2));
      
      if (structuredContent && structuredContent.sections.length > 0) {
        console.log('✅ Successfully converted flat to structured content');
        return res.json({ success: true, data: structuredContent });
      }
    }

    console.log('⚠️ No content found in Content model, trying PageContent model...');

    // Fallback to PageContent model (structured format)
    let page = await PageContent.findOne({ pageType, isActive: true });

    if (!page) {
      console.log('📝 No page found, creating default content');
      // Seed defaults for howToOrder; otherwise create empty structure
      let content = { sections: [], metadata: { title: { ar: '', en: '' }, description: { ar: '', en: '' }, keywords: [], ogImage: '', canonicalUrl: '', robots: 'index,follow' }, legacy: {} };
      if (pageType === 'howToOrder') {
        content = buildDefaultHowToOrderContent();
      }
      page = new PageContent({ pageType, content, isActive: true, status: 'published' });
      await page.save();
    }

    // Only return published content
    if (page.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Page not found or not published' });
    }

    console.log('✅ Returning PageContent model data');
    res.json({ success: true, data: page.content });
  } catch (error) {
    console.error('💥 Public content fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve page content' });
  }
}

