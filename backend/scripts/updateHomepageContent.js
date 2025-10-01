import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from '../src/models/Setting.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

const updateHomepageContent = async () => {
  try {

    // 1. Hero Section Content
    const heroSettings = [
      {
        category: 'hero',
        key: 'title',
        value: 'صمّم بصمتك الخاصة.',
        lang: 'ar'
      },
      {
        category: 'hero',
        key: 'subtitle', 
        value: 'ابدأ رحلتك نحو هوية رقمية لا تُنسى.',
        lang: 'ar'
      },
      {
        category: 'hero',
        key: 'ctaButtonText',
        value: 'اطلب خدمتك الآن',
        lang: 'ar'
      },
      {
        category: 'hero',
        key: 'ctaButtonLink',
        value: '/order',
        lang: 'both'
      }
    ];

    // 2. Foundational Statement Content
    const foundationalSettings = [
      {
        category: 'foundational',
        key: 'title',
        value: 'في بصمة تصميم، نمنح مشروعك حضورًا لا يُنسى',
        lang: 'ar'
      },
      {
        category: 'foundational',
        key: 'subtitle',
        value: 'نصمم، نكتب، ونبني لك هوية تترك أثرًا.',
        lang: 'ar'
      },
      {
        category: 'foundational',
        key: 'ctaPrimaryText',
        value: 'تواصل معنا',
        lang: 'ar'
      },
      {
        category: 'foundational',
        key: 'ctaPrimaryLink',
        value: '/contact',
        lang: 'both'
      },
      {
        category: 'foundational',
        key: 'ctaSecondaryText',
        value: 'تعرف علينا أكثر',
        lang: 'ar'
      },
      {
        category: 'foundational',
        key: 'ctaSecondaryLink',
        value: '/about',
        lang: 'both'
      }
    ];

    // 3. What Makes Us Different Content
    const whatDifferentSettings = [
      {
        category: 'whatDifferent',
        key: 'title',
        value: 'ما يميزنا',
        lang: 'ar'
      },
      {
        category: 'whatDifferent',
        key: 'subtitle',
        value: 'نقدم خدمات تصميم استثنائية تجمع بين الإبداع والاحترافية',
        lang: 'ar'
      },
      {
        category: 'whatDifferent',
        key: 'items',
        value: [
          {
            title: 'تصميم يحمل بصمتك',
            description: 'كل تصميم يُصنع ليعكس هويتك، ويوقف التمرير من أول نظرة',
            iconName: 'palette',
            iconColor: 'text-pink-600',
            bgGradient: 'from-pink-100 to-rose-100'
          },
          {
            title: 'شفافية و إحترافية',
            description: 'سياساتنا واضحة، وكل خدمة مدروسة من أول خطوة إلى التسليم',
            iconName: 'shield',
            iconColor: 'text-emerald-600',
            bgGradient: 'from-emerald-100 to-teal-100'
          },
          {
            title: 'تسليم مدروس',
            description: 'نلتزم بالوقت، لضمان الجودة والوضوح في التنفيذ',
            iconName: 'clock',
            iconColor: 'text-amber-600',
            bgGradient: 'from-amber-100 to-yellow-100'
          },
          {
            title: 'خدمة تُصمم لتُحدث فرقًا',
            description: 'ما نقدمه ليس مجرد منتج، بل تجربة إبداعية تُبنى على فهم مشروعك وأهدافك',
            iconName: 'sparkles',
            iconColor: 'text-indigo-600',
            bgGradient: 'from-indigo-100 to-violet-100'
          }
        ],
        lang: 'ar'
      }
    ];

    // 4. Counters Section Content
    const countersSettings = [
      {
        category: 'counters',
        key: 'title',
        value: 'أرقامنا',
        lang: 'ar'
      },
      {
        category: 'counters',
        key: 'subtitle',
        value: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل.',
        lang: 'ar'
      },
      {
        category: 'counters',
        key: 'items',
        value: [
          {
            label: 'المشاريع المنجزة',
            value: 468,
            suffix: '+',
            description: 'تصميمات تحمل بصمتنا الإبداعية',
            icon: 'Briefcase',
            color: 'emerald'
          },
          {
            label: 'العملاء',
            value: 258,
            suffix: '+',
            description: 'شركاء نجاح من مختلف القطاعات',
            icon: 'Users',
            color: 'indigo'
          },
          {
            label: 'سنوات الخبرة',
            value: 6,
            suffix: '+',
            description: 'في تصميم الهويات والمحتوى الرقمي',
            icon: 'Timer',
            color: 'amber'
          },
          {
            label: 'التقييمات',
            value: 4.9,
            suffix: '/5',
            description: 'معدل رضا العملاء بناءً على تقييمات حقيقية',
            icon: 'Star',
            color: 'rose'
          }
        ],
        lang: 'ar'
      }
    ];

    // 5. Closing CTA Content
    const closingCtaSettings = [
      {
        category: 'closingCta',
        key: 'title',
        value: 'اكتشف بصمتك الرقمية مع بصمة تصميم',
        lang: 'ar'
      },
      {
        category: 'closingCta',
        key: 'subtitle',
        value: 'خدماتنا تبدأ من الفكرة، وتنتهي بتأثير لا يُنسى',
        lang: 'ar'
      },
      {
        category: 'closingCta',
        key: 'description',
        value: 'ابدأ رحلتك معنا اليوم واحصل على تصميم يعكس هويتك ويحقق أهدافك',
        lang: 'ar'
      }
    ];

    // 6. Contact Information
    const contactSettings = [
      {
        category: 'contact',
        key: 'email',
        value: 'basmat.design0@gmail.com',
        lang: 'both'
      },
      {
        category: 'contact',
        key: 'whatsapp',
        value: 'https://wa.me/966XXXXXXXXX', // يحتاج رقم واتساب حقيقي
        lang: 'both'
      }
    ];

    // 7. Social Media Links
    const socialSettings = [
      {
        category: 'social',
        key: 'instagram',
        value: 'https://www.instagram.com/basmat.design0/',
        lang: 'both'
      },
      {
        category: 'social',
        key: 'tiktok',
        value: 'https://www.tiktok.com/@basmat.design0?is_from_webapp=1&sender_device=pc',
        lang: 'both'
      },
      {
        category: 'social',
        key: 'twitter',
        value: 'https://x.com/basmat_design0',
        lang: 'both'
      },
      {
        category: 'social',
        key: 'linkedin',
        value: '', // قيد العمل
        lang: 'both'
      }
    ];

    // 8. Legal Notice
    const legalSettings = [
      {
        category: 'legal',
        key: 'copyright',
        value: 'جميع الحقوق محفوظة لـ بصمة تصميم © 2025',
        lang: 'ar'
      },
      {
        category: 'legal',
        key: 'refundPolicy',
        value: 'جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع',
        lang: 'ar'
      }
    ];

    // 9. Footer (what the frontend Footer component expects)
    const footerSettings = [
      {
        category: 'footer',
        key: 'brandText',
        value: 'نصمم، نكتب، ونبني لك هوية تترك أثرًا',
        lang: 'ar'
      },
      {
        category: 'footer',
        key: 'email',
        value: 'basmat.design0@gmail.com',
        lang: 'both'
      },
      {
        category: 'footer',
        key: 'instagram',
        value: 'https://www.instagram.com/basmat.design0/',
        lang: 'both'
      },
      {
        category: 'footer',
        key: 'linkedin',
        value: '',
        lang: 'both'
      },
      {
        category: 'footer',
        key: 'quickLinks',
        value: [
          { label: 'من نحن', href: '/about' },
          { label: 'خدماتنا', href: '/services' },
          { label: 'طلب خدمة', href: '/order' },
          { label: 'تواصل معنا', href: '/contact' },
          { label: 'الأسئلة الشائعة', href: '/faq' },
          { label: 'السياسات', href: '/policies' },
        ],
        lang: 'ar'
      },
      {
        category: 'footer',
        key: 'paypalBadgeText',
        value: 'PayPal',
        lang: 'both'
      },
      {
        category: 'footer',
        key: 'contactCtaText',
        value: 'اطلب خدمتك الآن',
        lang: 'ar'
      },
      {
        category: 'footer',
        key: 'contactCtaLink',
        value: '/services',
        lang: 'both'
      },
      {
        category: 'footer',
        key: 'copyright',
        value: '© بصمة تصميم 2025 - جميع الحقوق محفوظة',
        lang: 'ar'
      },
      {
        category: 'footer',
        key: 'refundNote',
        value: 'جميع المدفوعات غير قابلة للاسترداد',
        lang: 'ar'
      },
    ];

    // Combine all settings
    const allSettings = [
      ...heroSettings,
      ...foundationalSettings,
      ...whatDifferentSettings,
      ...countersSettings,
      ...closingCtaSettings,
      ...contactSettings,
      ...socialSettings,
      ...legalSettings,
      ...footerSettings
    ];

    // Clear existing homepage settings
    await Setting.deleteMany({
      category: { 
        $in: ['hero', 'foundational', 'whatDifferent', 'counters', 'closingCta', 'contact', 'social', 'legal', 'footer'] 
      }
    });

    // Insert new settings
    for (const setting of allSettings) {
      await Setting.updateSetting(
        setting.key,
        setting.category,
        setting.value,
        setting.lang
      );
    }


  } catch (error) {
    throw error;
  }
};

const runUpdate = async () => {
  try {
    await connectDB();
    await updateHomepageContent();
  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run if this file is executed directly (robust on Windows paths)
try {
  const scriptArg = process.argv[1];
  const scriptUrl = new URL(import.meta.url);
  // Decode and normalize pathname for Windows
  const urlPath = decodeURI(scriptUrl.pathname)
    .replace(/^\//, '') // remove leading slash on Windows
    .replace(/\//g, '\\');
  const normalize = (p) => (p || '')
    .replace(/[\\/]+/g, '\\')
    .toLowerCase();
  if (normalize(scriptArg) === normalize(urlPath)) {
    await runUpdate();
  }
} catch (e) {
  // Fallback: if anything fails, still attempt to run when called directly
  if (process.argv[1]) {
    await runUpdate();
  }
}

export default runUpdate;
