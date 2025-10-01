import AuditLog from '../../models/AuditLog.js';
import PageContent from '../../models/PageContent.js';

// Function to initialize page content with real website content
const initializePageContent = async (pageType) => {
  const realContent = getRealPageContent(pageType);
  
  const pageContent = new PageContent({
    pageType,
    content: realContent,
    isActive: true
  });
  
  await pageContent.save();
  return pageContent;
};

// Real content from the website components
const getRealPageContent = (pageType) => {
  const contentMap = {
    homepage: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'ØµÙ…Ù‘Ù… Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©.',
          subtitle: 'Ø§Ø¨Ø¯Ø£ Ø±Ø­Ù„ØªÙƒ Ù†Ø­Ùˆ Ù‡ÙˆÙŠØ© Ø±Ù‚Ù…ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰.',
          content: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø­ÙˆÙ„ Ø£ÙÙƒØ§Ø±Ùƒ Ø¥Ù„Ù‰ ØªØµØ§Ù…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¹ÙƒØ³ Ø´Ø®ØµÙŠØªÙƒ ÙˆØªØ­Ù‚Ù‚ Ø£Ù‡Ø¯Ø§ÙÙƒ',
          order: 1,
          isActive: true
        },
        {
          id: 'foundational',
          type: 'foundational',
          title: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ù…Ù†Ø­ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ù„Ø§ ÙŠÙÙ†Ø³Ù‰',
          subtitle: 'Ù†ØµÙ…Ù…ØŒ Ù†ÙƒØªØ¨ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ù„Ùƒ Ù‡ÙˆÙŠØ© ØªØªØ±Ùƒ Ø£Ø«Ø±Ù‹Ø§ ÙÙŠ Ù‚Ù„ÙˆØ¨ Ø¹Ù…Ù„Ø§Ø¦Ùƒ',
          ctaButtons: [
            { text: 'Ø§Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù†', link: '/order', primary: true },
            { text: 'ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§ Ø£ÙƒØ«Ø±', link: '/about', primary: false }
          ],
          order: 2,
          isActive: true
        }
      ]
    },
    hero: {
      title: { ar: 'ØµÙ…Ù‘Ù… Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©.', en: 'Design Your Own Mark.' },
      subtitle: { ar: 'Ø§Ø¨Ø¯Ø£ Ø±Ø­Ù„ØªÙƒ Ù†Ø­Ùˆ Ù‡ÙˆÙŠØ© Ø±Ù‚Ù…ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰.', en: 'Start Your Journey Towards an Unforgettable Digital Identity.' },
      description: { ar: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ø­ÙˆÙ„ Ø£ÙÙƒØ§Ø±Ùƒ Ø¥Ù„Ù‰ ØªØµØ§Ù…ÙŠÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© ØªØ¹ÙƒØ³ Ø´Ø®ØµÙŠØªÙƒ ÙˆØªØ­Ù‚Ù‚ Ø£Ù‡Ø¯Ø§ÙÙƒ', en: 'At Basma Design, we turn your ideas into exceptional designs that reflect your personality and achieve your goals' },
      ctaButton: {
        text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', en: 'Contact Us' },
        link: '/contact'
      },
      isActive: true
    },
    foundational: {
      title: 'ÙÙŠ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…ØŒ Ù†Ù…Ù†Ø­ Ù…Ø´Ø±ÙˆØ¹Ùƒ Ø­Ø¶ÙˆØ±Ù‹Ø§ Ù„Ø§ ÙŠÙÙ†Ø³Ù‰',
      subtitle: 'Ù†ØµÙ…Ù…ØŒ Ù†ÙƒØªØ¨ØŒ ÙˆÙ†Ø¨Ù†ÙŠ Ù„Ùƒ Ù‡ÙˆÙŠØ© ØªØªØ±Ùƒ Ø£Ø«Ø±Ù‹Ø§ ÙÙŠ Ù‚Ù„ÙˆØ¨ Ø¹Ù…Ù„Ø§Ø¦Ùƒ',
      ctaPrimaryText: 'Ø§Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù†',
      ctaPrimaryLink: '/order',
      ctaSecondaryText: 'ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§ Ø£ÙƒØ«Ø±',
      ctaSecondaryLink: '/about'
    },
    about: {
      sections: [
        {
          id: 'about-hero',
          type: 'hero',
          title: 'Ù…Ù† Ù†Ø­Ù†',
          subtitle: 'ÙØ±ÙŠÙ‚ Ù…Ù† Ø§Ù„Ù…Ø­ØªØ±ÙÙŠÙ† Ø§Ù„Ù…ØªØ®ØµØµÙŠÙ† ÙÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ… ÙˆØ§Ù„Ø¥Ø¨Ø¯Ø§Ø¹',
          content: 'Ù†Ø­Ù† Ø´Ø±ÙƒØ© Ù…ØªØ®ØµØµØ© ÙÙŠ ØªÙ‚Ø¯ÙŠÙ… Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ø¬Ø±Ø§ÙÙŠÙƒÙŠ ÙˆØ§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„Ø±Ù‚Ù…ÙŠ Ø¨Ø£Ø¹Ù„Ù‰ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¬ÙˆØ¯Ø©. Ù†Ø³Ø¹Ù‰ Ù„ØªØ­ÙˆÙŠÙ„ Ø£ÙÙƒØ§Ø± Ø¹Ù…Ù„Ø§Ø¦Ù†Ø§ Ø¥Ù„Ù‰ ÙˆØ§Ù‚Ø¹ Ø±Ù‚Ù…ÙŠ Ù…Ù…ÙŠØ²',
          order: 1,
          isActive: true
        }
      ]
    },
    howToOrder: {
      sections: [
        {
          id: 'hero',
          type: 'custom',
          data: {
            badge: { ar: 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ø´Ø§Ù…Ù„', en: 'Ordering Guide' },
            title: { ar: 'ÙƒÙŠÙ ØªØ·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒØŸ', en: 'How to Order?' },
            description: { ar: 'ÙÙŠ "Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…"ØŒ Ù†Ø¬Ø¹Ù„ Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ Ø³Ù‡Ù„Ø§Ù‹ ÙˆØ³Ø±ÙŠØ¹Ø§Ù‹ Ø¨Ø®Ø·ÙˆØ§Øª ÙˆØ§Ø¶Ø­Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø©', en: 'At Basma Design, ordering is easy and fast with clear steps.' }
          },
          order: 0,
          isActive: true
        },
        {
          id: 'steps',
          type: 'custom',
          data: {
            heading: { ar: 'Ø®Ø·ÙˆØ§Øª Ø¨Ø³ÙŠØ·Ø© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø®Ø¯Ù…ØªÙƒ', en: 'Simple steps to get your service' },
            items: [
              { order: 1, title: { ar: 'Ø§Ø®ØªØ± Ø®Ø¯Ù…ØªÙƒ', en: 'Choose your service' }, description: { ar: 'ØªØµÙØ­ Ù‚Ø³Ù… Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ø®ØªØ± Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬Ù‡Ø§ Ù…Ù† Ù…Ø¬Ù…ÙˆØ¹Ø© Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…ØªÙ†ÙˆØ¹Ø©', en: 'Browse services and pick what you need.' } },
              { order: 2, title: { ar: 'Ø£ÙƒÙ…Ù„ Ø§Ù„Ø¯ÙØ¹', en: 'Complete payment' }, description: { ar: 'Ø§Ø¯ÙØ¹ Ø¨Ø£Ù…Ø§Ù† Ø¹Ø¨Ø± PayPal Ø£Ùˆ ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…ØªØ§Ø­Ø© Ø¨Ø®Ø·ÙˆØ§Øª Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…Ø­Ù…ÙŠØ©', en: 'Pay securely via available methods.' } },
              { order: 3, title: { ar: 'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†ÙÙŠØ°', en: 'Start execution' }, description: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ù„ØªÙˆØ¶ÙŠØ­ ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨Ùƒ ÙˆÙ†Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†ÙÙŠØ° ÙÙˆØ±Ø§Ù‹', en: 'Contact us on WhatsApp to start immediately.' } }
            ],
            processHighlights: [
              { text: { ar: 'Ù„Ø§ Ø­Ø§Ø¬Ø© Ù„Ù†Ù…Ø§Ø°Ø¬ Ù…Ø¹Ù‚Ø¯Ø©', en: 'No complex forms' } },
              { text: { ar: 'ØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ø§Ù„ÙØ±ÙŠÙ‚', en: 'Direct team contact' } },
              { text: { ar: 'Ø¨Ø¯Ø§ÙŠØ© ÙÙˆØ±ÙŠØ© Ù„Ù„ØªÙ†ÙÙŠØ°', en: 'Immediate start' } }
            ]
          },
          order: 1,
          isActive: true
        },
        {
          id: 'notes',
          type: 'custom',
          data: {
            heading: { ar: 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ù‡Ù…Ø© Ù„Ø¶Ù…Ø§Ù† Ø£ÙØ¶Ù„ Ø®Ø¯Ù…Ø©', en: 'Important notes' },
            items: [
              { title: { ar: 'Ø§Ù„ØªØ­Ø¶ÙŠØ± Ø§Ù„Ù…Ø³Ø¨Ù‚', en: 'Preparation' }, description: { ar: 'ÙŠÙØ±Ø¬Ù‰ ØªØ¬Ù‡ÙŠØ² ÙˆØµÙ ÙˆØ§Ø¶Ø­ ÙˆÙ…ÙØµÙ„ Ù„Ø·Ù„Ø¨Ùƒ Ù‚Ø¨Ù„ Ø¨Ø¯Ø¡ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ù„Ø¶Ù…Ø§Ù† ÙÙ‡Ù… Ù…ØªØ·Ù„Ø¨Ø§ØªÙƒ Ø¨Ø¯Ù‚Ø©', en: 'Prepare a clear description of your request.' } },
              { title: { ar: 'Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª', en: 'Pricing and revisions' }, description: { ar: 'Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø«Ø§Ø¨ØªØ© Ù„ÙƒÙ„ Ø®Ø¯Ù…Ø©ØŒ ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ù…Ø­Ø¯ÙˆØ¯Ø© Ø­Ø³Ø¨ Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©', en: 'Fixed prices, limited revisions per service.' } },
              { title: { ar: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø¥Ù„ØºØ§Ø¡', en: 'Cancellation policy' }, description: { ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø¯Ù…Ø§Øª ØºÙŠØ± Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø¥Ù„ØºØ§Ø¡ Ø£Ùˆ Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ø¨Ø¹Ø¯ Ø¥ØªÙ…Ø§Ù… Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø¯ÙØ¹', en: 'Non-refundable after payment.' } },
              { title: { ar: 'Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ø±Ù‚Ù…ÙŠ', en: 'Digital delivery' }, description: { ar: 'Ø®Ø¯Ù…Ø© "Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ© Ø§Ù„Ø¬Ø§Ù‡Ø²" ØªÙØ±Ø³Ù„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙ„Ø§ ØªØªØ·Ù„Ø¨ ØªÙˆØ§ØµÙ„ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨', en: 'Ready CV template is emailed directly.' } }
            ]
          },
          order: 2,
          isActive: true
        },
        {
          id: 'cta',
          type: 'custom',
          data: {
            title: { ar: 'Ø¬Ø§Ù‡Ø² Ù„Ø¨Ø¯Ø¡ Ù…Ø´Ø±ÙˆØ¹ÙƒØŸ', en: 'Ready to start your project?' },
            description: { ar: 'Ø§Ø®ØªØ± Ø®Ø¯Ù…ØªÙƒ Ø§Ù„Ø¢Ù† ÙˆØ§Ø¨Ø¯Ø£ Ø±Ø­Ù„Ø© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…', en: 'Choose your service and start your creative journey.' },
            button: { text: { ar: 'ØªØµÙØ­ Ø§Ù„Ø®Ø¯Ù…Ø§Øª', en: 'Browse services' }, link: '/services' }
          },
          order: 3,
          isActive: true
        }
      ],
      metadata: {
        title: { ar: 'ÙƒÙŠÙ ØªØ·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ | Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…', en: 'How to Order | Basma Design' },
        description: { ar: 'Ø§ØªØ¨Ø¹ Ø®Ø·ÙˆØ§Øª Ø¨Ø³ÙŠØ·Ø© Ù„Ø·Ù„Ø¨ Ø®Ø¯Ù…ØªÙƒ...', en: 'Follow simple steps to order your service.' },
        keywords: ['Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø©','Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…','how to order']
      }
    },
    policies: {
      sections: [
        {
          id: 'terms',
          type: 'content',
          title: 'Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…',
          subtitle: 'Ø´Ø±ÙˆØ· Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹Ù†Ø§ ÙˆØ®Ø¯Ù…Ø§ØªÙ†Ø§',
          content: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨ÙƒÙ… ÙÙŠ Ù…ÙˆÙ‚Ø¹ Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…. Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù…ÙƒÙ… Ù„Ù…ÙˆÙ‚Ø¹Ù†Ø§ ÙˆØ®Ø¯Ù…Ø§ØªÙ†Ø§ØŒ ÙØ¥Ù†ÙƒÙ… ØªÙˆØ§ÙÙ‚ÙˆÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„ØªØ§Ù„ÙŠØ©:\n\nâ€¢ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ù…Ø© ØªØ®Ø¶Ø¹ Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¬ÙˆØ¯Ø© Ø§Ù„Ø¹Ø§Ù„ÙŠØ©\nâ€¢ ÙŠØªÙ… ØªØ³Ù„ÙŠÙ… Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ ÙÙŠ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©\nâ€¢ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ© Ù…Ø­ÙÙˆØ¸Ø©\nâ€¢ Ù†Ø­ØªÙØ¸ Ø¨Ø§Ù„Ø­Ù‚ ÙÙŠ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª\nâ€¢ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯ ØªØ·Ø¨Ù‚ Ø­Ø³Ø¨ Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø©\n\nÙ„Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„ØªÙØ§ØµÙŠÙ„ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
          order: 1,
          isActive: true
        }
      ]
    }
  };
  
  return contentMap[pageType] || { sections: [] };
};

/**
 * Get page content by page type
 */
export const getPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    // Case-insensitive lookup to avoid duplicates due to casing
    let pageContent = await PageContent.findOne({ pageType: new RegExp(`^${pageType}$`, 'i') });
    
    if (!pageContent) {
      // Initialize with real content from website if not exists
      pageContent = await initializePageContent(pageType);
    }

    // Log admin action (non-blocking)
    try {
      await AuditLog.logAction(req.user?._id, 'view', 'page-content', null, { pageType }, req);
    } catch (logErr) {
      }

    res.json({
      success: true,
      data: pageContent.content
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve page content'
    });
  }
};

/**
 * Update entire page content
 */
export const updatePageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    let contentData = req.body || {};

    // Accept both { content: {...} } and direct content object
    if (contentData && contentData.content && !contentData.sections) {
      contentData = contentData.content;
      }

    // Normalize sections to always be array with required fields
    const normalizeSection = (s, index) => {
      if (!s) return null;
      const id = s.id || String(Date.now() + index);
      // If payload is legacy like { id, type, title, subtitle, content }
      if (s.data === undefined && (s.title || s.subtitle || s.content)) {
        s = { id, type: s.type || 'custom', data: { title: s.title, subtitle: s.subtitle, content: s.content }, order: s.order ?? index, isActive: s.isActive !== false };
      }
      return {
        id,
        type: s.type || 'custom',
        data: s.data || {},
        order: typeof s.order === 'number' ? s.order : index,
        isActive: s.isActive !== false,
        settings: s.settings || {}
      };
    };

    if (!Array.isArray(contentData.sections)) {
      contentData.sections = [];
    } else {
      contentData.sections = contentData.sections.map((s, i) => normalizeSection(s, i)).filter(Boolean);
    }

    contentData.metadata = contentData.metadata || { title: { ar: '', en: '' }, description: { ar: '', en: '' }, keywords: [] };

    // Case-insensitive lookup
    let pageContent = await PageContent.findOne({ pageType: new RegExp(`^${pageType}$`, 'i') });
    
    // If not found, upsert a new one to avoid duplicate key errors on unique index
    if (!pageContent) {
      pageContent = await PageContent.findOneAndUpdate(
        { pageType: pageType },
        { $setOnInsert: { pageType: pageType } },
        { new: true, upsert: true }
      );
    }

    // Update content using findOneAndUpdate to avoid version conflicts
    const updatedPageContent = await PageContent.findOneAndUpdate(
      { _id: pageContent._id },
      {
        $set: {
          content: contentData,
          lastModified: new Date()
        }
      },
      { new: true }
    );

    // Log admin action (non-blocking)
    try {
      await AuditLog.logAction(req.user?._id, 'update', 'page-content', pageContent._id, { 
        pageType, 
        contentKeys: Object.keys(contentData)
      }, req);
    } catch (logErr) {
      }

    res.json({
      success: true,
      data: updatedPageContent.content,
      message: 'Page content updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø©',
      error: error?.message,
      details: error?.stack
    });
  }
};

/**
 * Add section to page
 */
export const addSection = async (req, res) => {
  try {
    const { pageType } = req.params;
    const sectionData = req.body;
    
    let pageContent = await PageContent.findOne({ pageType });
    
    if (!pageContent) {
      pageContent = await initializePageContent(pageType);
    }

    const newSection = {
      id: Date.now().toString(),
      ...sectionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!pageContent.content.sections) {
      pageContent.content.sections = [];
    }
    
    pageContent.content.sections.push(newSection);
    pageContent.lastModified = new Date();
    
    await pageContent.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'create', 'page-section', newSection.id, {
      pageType,
      sectionData: newSection
    }, req);

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: { section: newSection }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add section'
    });
  }
};

/**
 * Update section
 */
export const updateSection = async (req, res) => {
  try {
    const { pageType, sectionId } = req.params;
    const updateData = req.body;
    
    let pageContent = await PageContent.findOne({ pageType });
    
    if (!pageContent || !pageContent.content.sections) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    const sectionIndex = pageContent.content.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const oldSection = { ...pageContent.content.sections[sectionIndex] };
    pageContent.content.sections[sectionIndex] = {
      ...pageContent.content.sections[sectionIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    pageContent.lastModified = new Date();
    await pageContent.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'page-section', sectionId, {
      pageType,
      before: oldSection,
      after: pageContent.content.sections[sectionIndex]
    }, req);

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: { section: pageContent.content.sections[sectionIndex] }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update section'
    });
  }
};

/**
 * Delete section
 */
export const deleteSection = async (req, res) => {
  try {
    const { pageType, sectionId } = req.params;
    
    let pageContent = await PageContent.findOne({ pageType });
    
    if (!pageContent || !pageContent.content.sections) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    const sectionIndex = pageContent.content.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const deletedSection = pageContent.content.sections[sectionIndex];
    pageContent.content.sections.splice(sectionIndex, 1);
    pageContent.lastModified = new Date();
    
    await pageContent.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'page-section', sectionId, {
      pageType,
      section: deletedSection
    }, req);

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete section'
    });
  }
};

/**
 * Get all pages list
 */
export const getAllPages = async (req, res) => {
  try {
    const pages = Object.keys(pageContents).map(pageType => ({
      type: pageType,
      sectionsCount: pageContents[pageType].sections?.length || 0,
      lastUpdated: pageContents[pageType].updatedAt || null
    }));

    res.json({
      success: true,
      data: { pages }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pages'
    });
  }
};

// Default content is now handled by the getRealPageContent function above

