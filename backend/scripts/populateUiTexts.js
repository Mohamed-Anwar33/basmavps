import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Service model
import Service from '../src/models/Service.js';

// Default uiTexts content extracted from frontend components
const defaultUiTexts = {
  qualityTitle: {
    ar: 'جودة احترافية',
    en: 'Professional Quality'
  },
  qualitySubtitle: {
    ar: 'بصمة إبداعية مميزة',
    en: 'Distinctive Creative Touch'
  },
  detailsTitle: {
    ar: 'تفاصيل الخدمة',
    en: 'Service Details'
  },
  details: {
    ar: 'في عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل\nنصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية\nيشمل تصميم بوست واحد متوافق مع جودة منصات التواصل الاجتماعي',
    en: 'In a content-crowded world, your design must stop the follower, catch their attention, and engage them\nWe design professional posts that reflect your project identity, with an attractive visual style that achieves your marketing goals\nIncludes designing one post compatible with social media platform quality'
  },
  noticeTitle: {
    ar: 'تنويه هام',
    en: 'Important Notice'
  },
  notice: {
    ar: 'الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل',
    en: 'Service is non-refundable and non-cancellable after payment completion\nAfter payment, you will be redirected directly to WhatsApp to send details'
  }
};

// Category-specific uiTexts
const categorySpecificTexts = {
  'social-media': {
    details: {
      ar: 'إدارة شاملة لحساباتك على منصات التواصل الاجتماعي\nتصميم محتوى بصري جذاب يعكس هوية علامتك التجارية\nتفاعل مع المتابعين وبناء مجتمع قوي حول علامتك التجارية',
      en: 'Comprehensive management of your social media accounts\nAttractive visual content design that reflects your brand identity\nEngage with followers and build a strong community around your brand'
    }
  },
  'branding': {
    details: {
      ar: 'تصميم هوية بصرية متكاملة تميز علامتك التجارية\nشعار احترافي مع دليل استخدام شامل\nتطبيق الهوية على جميع المواد التسويقية والرقمية',
      en: 'Complete visual identity design that distinguishes your brand\nProfessional logo with comprehensive usage guide\nApplying identity to all marketing and digital materials'
    }
  },
  'web-design': {
    details: {
      ar: 'تصميم موقع ويب متجاوب وسريع التحميل\nتجربة مستخدم محسنة لزيادة التحويلات\nتصميم متوافق مع محركات البحث SEO',
      en: 'Responsive and fast-loading website design\nOptimized user experience to increase conversions\nSEO-friendly design compatible with search engines'
    }
  },
  'logos': {
    details: {
      ar: 'تصميم شعار احترافي يعكس قيم وشخصية علامتك التجارية\nعدة مفاهيم إبداعية للاختيار من بينها\nتسليم الشعار بصيغ متعددة عالية الجودة',
      en: 'Professional logo design that reflects your brand values and personality\nMultiple creative concepts to choose from\nLogo delivery in multiple high-quality formats'
    }
  },
  'consultation': {
    details: {
      ar: 'استشارة تسويقية شاملة لتطوير استراتيجية علامتك التجارية\nتحليل السوق والمنافسين وتحديد الفرص\nخطة عمل واضحة مع خطوات تنفيذية محددة',
      en: 'Comprehensive marketing consultation to develop your brand strategy\nMarket and competitor analysis and opportunity identification\nClear action plan with specific implementation steps'
    }
  }
};

async function populateUiTexts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all services
    const services = await Service.find({});

    let updatedCount = 0;
    let skippedCount = 0;

    for (const service of services) {
      // Check if service already has complete uiTexts
      const hasCompleteUiTexts = service.uiTexts && 
        service.uiTexts.qualityTitle && 
        service.uiTexts.qualitySubtitle && 
        service.uiTexts.detailsTitle && 
        service.uiTexts.details && 
        service.uiTexts.noticeTitle && 
        service.uiTexts.notice;

      if (hasCompleteUiTexts) {
        skippedCount++;
        continue;
      }

      // Get category-specific content if available
      const categoryTexts = categorySpecificTexts[service.category] || {};
      
      // Prepare uiTexts to update
      const uiTextsToUpdate = {
        qualityTitle: service.uiTexts?.qualityTitle || defaultUiTexts.qualityTitle,
        qualitySubtitle: service.uiTexts?.qualitySubtitle || defaultUiTexts.qualitySubtitle,
        detailsTitle: service.uiTexts?.detailsTitle || defaultUiTexts.detailsTitle,
        details: service.uiTexts?.details || categoryTexts.details || defaultUiTexts.details,
        noticeTitle: service.uiTexts?.noticeTitle || defaultUiTexts.noticeTitle,
        notice: service.uiTexts?.notice || defaultUiTexts.notice
      };

      // Update the service
      await Service.findByIdAndUpdate(
        service._id,
        { 
          $set: { 
            uiTexts: uiTextsToUpdate 
          }
        },
        { new: true }
      );

      updatedCount++;
    }

    console.log(`⏭️  Skipped: ${skippedCount} services (already had complete uiTexts)`);

  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
populateUiTexts();
