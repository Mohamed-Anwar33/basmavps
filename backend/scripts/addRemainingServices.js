import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

const additionalServices = [
  {
    title: { ar: "تصميم بنر سوشيال ميديا", en: "Social Media Banner Design" },
    description: { 
      ar: "تصميم بنر جذاب للمنصات الاجتماعية",
      en: "Attractive banner design for social platforms"
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 1, max: 3 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "banners",
    features: { 
      ar: ["تصميم بنر جذاب للمنصات", "تصميم احترافي", "متوافق مع جميع المنصات"],
      en: ["Attractive banner design for platforms", "Professional design", "Compatible with all platforms"]
    },
    slug: "social-media-banner",
    nonRefundable: true,
    isActive: true,
    order: 7
  },
  {
    title: { ar: "تصميم بنر إعلاني", en: "Advertising Banner Design" },
    description: { 
      ar: "تصميم بنر دعائي احترافي",
      en: "Professional advertising banner design"
    },
    price: { SAR: 56.25, USD: 15 },
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "banners",
    features: { 
      ar: ["تصميم بنر دعائي احترافي", "جذاب ومؤثر", "يحقق أهدافك التسويقية"],
      en: ["Professional advertising banner design", "Attractive and impactful", "Achieves your marketing goals"]
    },
    slug: "advertising-banner",
    nonRefundable: true,
    isActive: true,
    order: 8
  },
  {
    title: { ar: "تصميم بنر متجر إلكتروني", en: "E-commerce Store Banner Design" },
    description: { 
      ar: "تصميم بنر مخصص للمتاجر الإلكترونية",
      en: "Custom banner design for e-commerce stores"
    },
    price: { SAR: 75, USD: 20 },
    deliveryTime: { min: 1, max: 5 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "banners",
    features: { 
      ar: ["تصميم بنر مخصص للمتاجر", "يعكس هوية المتجر", "يجذب العملاء"],
      en: ["Custom banner design for stores", "Reflects store identity", "Attracts customers"]
    },
    slug: "ecommerce-banner",
    nonRefundable: true,
    isActive: true,
    order: 9
  },
  {
    title: { ar: "قالب سير ذاتية قابلة للتعديل", en: "Editable Resume Template" },
    description: { 
      ar: "جاهزة عبر Canva — بصمة احترافية في دقائق.",
      en: "Ready via Canva — professional signature in minutes."
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 0, max: 0 },
    deliveryFormats: ["رابط Canva"],
    revisions: 0,
    category: "resumes",
    features: { 
      ar: ["قابل للتعديل والإضافة", "إمكانية تغيير الألوان", "خطوط متنوعة ومميزة"],
      en: ["Editable and customizable", "Color change capability", "Diverse and distinctive fonts"]
    },
    slug: "editable-resume-template",
    nonRefundable: true,
    isActive: true,
    order: 10,
    digitalDelivery: {
      type: 'links',
      links: [
        {
          title: 'قالب سيرة ذاتية احترافية',
          url: 'https://canva.com/template-link',
          locale: 'ar'
        }
      ]
    }
  },
  {
    title: { ar: "تصميم سيرة ذاتية عادية", en: "Regular Resume Design" },
    description: { 
      ar: "نعكس خبراتك بأسلوب بصري احترافي.",
      en: "We reflect your experience in a professional visual style."
    },
    price: { SAR: 56.25, USD: 15 },
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "resumes",
    features: { 
      ar: ["تصميم احترافي", "يعكس خبراتك", "أسلوب بصري جذاب"],
      en: ["Professional design", "Reflects your experience", "Attractive visual style"]
    },
    slug: "regular-resume-design",
    nonRefundable: true,
    isActive: true,
    order: 11
  },
  {
    title: { ar: "تصميم سيرة ذاتية ATS", en: "ATS Resume Design" },
    description: { 
      ar: "سيرة ذاتية متوافقة مع أنظمة التتبع الآلي للشركات",
      en: "Resume compatible with Applicant Tracking Systems"
    },
    price: { SAR: 75, USD: 20, originalSAR: 56.25, originalUSD: 15 },
    deliveryTime: { min: 1, max: 5 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "resumes",
    features: { 
      ar: ["متوافقة مع أنظمة ATS", "تصميم احترافي", "تحسين فرص القبول"],
      en: ["ATS compatible", "Professional design", "Improves acceptance chances"]
    },
    slug: "ats-resume-design",
    nonRefundable: true,
    isActive: true,
    order: 12
  },
  {
    title: { ar: "كتابة محتوى إعلاني للسوشيال ميديا", en: "Social Media Advertising Content Writing" },
    description: { 
      ar: "سكربت واحد بصيغة تسويقية جذابة",
      en: "One script in attractive marketing format"
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ["Word", "PDF"],
    revisions: 2,
    category: "content",
    features: { 
      ar: ["سكربت واحد بصيغة تسويقية جذابة", "محتوى إعلاني مؤثر", "يحقق أهدافك التسويقية"],
      en: ["One script in attractive marketing format", "Impactful advertising content", "Achieves your marketing goals"]
    },
    slug: "social-media-ad-content",
    nonRefundable: true,
    isActive: true,
    order: 13
  },
  {
    title: { ar: "كتابة محتوى بوست سوشيال ميديا", en: "Social Media Post Content Writing" },
    description: { 
      ar: "سكربت واحد بسيط ومباشر",
      en: "One simple and direct script"
    },
    price: { SAR: 18.75, USD: 5 },
    deliveryTime: { min: 1, max: 3 },
    deliveryFormats: ["Word", "PDF"],
    revisions: 2,
    category: "content",
    features: { 
      ar: ["سكربت واحد بسيط ومباشر", "محتوى جذاب", "مناسب لجميع المنصات"],
      en: ["One simple and direct script", "Attractive content", "Suitable for all platforms"]
    },
    slug: "social-media-post-content",
    nonRefundable: true,
    isActive: true,
    order: 14
  },
  {
    title: { ar: "بكج 10 سكربتات سوشيال ميديا", en: "10 Social Media Scripts Package" },
    description: { 
      ar: "حزمة متكاملة من السكربتات المتنوعة",
      en: "Complete package of diverse scripts"
    },
    price: { SAR: 150, USD: 40, originalSAR: 131.25, originalUSD: 35 },
    deliveryTime: { min: 3, max: 6 },
    deliveryFormats: ["Word", "PDF"],
    revisions: 2,
    category: "content",
    features: { 
      ar: ["يشمل 10 سكربتات متنوعة", "محتوى احترافي", "يغطي مختلف المواضيع"],
      en: ["Includes 10 diverse scripts", "Professional content", "Covers various topics"]
    },
    slug: "social-media-scripts-package",
    nonRefundable: true,
    isActive: true,
    order: 15
  },
  {
    title: { ar: "كتابة مقال للمدونات", en: "Blog Article Writing" },
    description: { 
      ar: "مقال احترافي مخصص حسب المجال",
      en: "Professional article customized according to field"
    },
    price: { SAR: 93.75, USD: 25 },
    deliveryTime: { min: 2, max: 5 },
    deliveryFormats: ["Word", "PDF"],
    revisions: 2,
    category: "content",
    features: { 
      ar: ["مقال احترافي مخصص حسب المجال", "محتوى عالي الجودة", "SEO محسن"],
      en: ["Professional article customized by field", "High quality content", "SEO optimized"]
    },
    slug: "blog-article-writing",
    nonRefundable: true,
    isActive: true,
    order: 16
  },
  {
    title: { ar: "تصميم شعار كتابي", en: "Text Logo Design" },
    description: { 
      ar: "تصميم اسم تجاري بأسلوب فني",
      en: "Business name design in artistic style"
    },
    price: { SAR: 150, USD: 40, originalSAR: 131.25, originalUSD: 35 },
    deliveryTime: { min: 3, max: 8 },
    deliveryFormats: ["PNG", "PDF", "SVG", "AI"],
    revisions: 2,
    category: "logos",
    features: { 
      ar: ["تصميم اسم تجاري بأسلوب فني", "خطوط مميزة", "ألوان احترافية"],
      en: ["Business name design in artistic style", "Distinctive fonts", "Professional colors"]
    },
    slug: "text-logo-design",
    nonRefundable: true,
    isActive: true,
    order: 17
  },
  {
    title: { ar: "شعار مطور (أشكال)", en: "Advanced Logo (Shapes)" },
    description: { 
      ar: "تصميم شعار بأيقونات وتكوينات متعددة",
      en: "Logo design with icons and multiple compositions"
    },
    price: { SAR: 225, USD: 60 },
    deliveryTime: { min: 3, max: 8 },
    deliveryFormats: ["PNG", "PDF", "SVG", "AI"],
    revisions: 2,
    category: "logos",
    features: { 
      ar: ["تصميم شعار بأيقونات وتكوينات متعددة", "إبداع وابتكار", "تصاميم متنوعة"],
      en: ["Logo design with icons and multiple compositions", "Creativity and innovation", "Diverse designs"]
    },
    slug: "advanced-logo-shapes",
    nonRefundable: true,
    isActive: true,
    order: 18
  },
  {
    title: { ar: "تصميم شعار للشركات والمتاجر", en: "Corporate and Store Logo Design" },
    description: { 
      ar: "تصميم احترافي يعكس هوية تجارية كاملة",
      en: "Professional design reflecting complete business identity"
    },
    price: { SAR: 318.75, USD: 85 },
    deliveryTime: { min: 3, max: 8 },
    deliveryFormats: ["PNG", "PDF", "SVG", "AI"],
    revisions: 2,
    category: "logos",
    features: { 
      ar: ["تصميم احترافي يعكس هوية تجارية كاملة", "مناسب للشركات الكبيرة", "هوية بصرية متكاملة"],
      en: ["Professional design reflecting complete business identity", "Suitable for large companies", "Complete visual identity"]
    },
    slug: "corporate-logo-design",
    nonRefundable: true,
    isActive: true,
    order: 19
  },
  {
    title: { ar: "استشارة تطوير الحسابات على السوشيال ميديا", en: "Social Media Account Development Consultation" },
    description: { 
      ar: "تحليل احترافي لحسابك — لأن التطوير يبدأ من فهم التفاصيل\nنقوم بمراجعة شاملة لـ 1–3 حسابات على منصات التواصل، ونقدم لك تقريرًا عمليًا يوضح:\n• نقاط القوة والضعف في التصميم والمحتوى\n• اقتراحات لتحسين الهوية البصرية والتفاعل\n• أفكار لتطوير الشكل العام وجذب الجمهور المناسب\n• خطوات قابلة للتنفيذ لرفع جودة الحسابات وتحقيق أهدافك",
      en: "Professional analysis of your account — because development starts with understanding details"
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 2, max: 4 },
    deliveryFormats: ["Word", "PDF"],
    revisions: 0,
    category: "consultation",
    features: { 
      ar: ["مراجعة شاملة لـ 1–3 حسابات", "تقرير عملي مفصل", "اقتراحات للتحسين", "خطوات قابلة للتنفيذ"],
      en: ["Comprehensive review of 1-3 accounts", "Detailed practical report", "Improvement suggestions", "Actionable steps"]
    },
    slug: "social-media-consultation",
    nonRefundable: true,
    isActive: true,
    order: 20
  },
  {
    title: { ar: "استشارة تطوير الأعمال", en: "Business Development Consultation" },
    description: { 
      ar: "خطوة أولى نحو تطوير مشروعك — بدون أي التزام مالي.\nاحصل على جلسة استشارية مجانية تناقش فيها مشروعك، أفكارك، أو التحديات اللي تواجهك.\nنساعدك في:\n• توجيه عام حول بناء الهوية التجارية\n• اقتراحات لتحسين تجربة العميل أو المحتوى التسويقي\n• أفكار أولية لتطوير الخدمات أو المنتجات\nالاستشارة مجانية تمامًا، وتُقدم عبر واتساب أو مكالمة قصيرة\nمدة الجلسة: 15–20 دقيقة",
      en: "First step towards developing your project — without any financial commitment."
    },
    price: { SAR: 0, USD: 0 },
    deliveryTime: { min: 0, max: 0 },
    deliveryFormats: ["استشارة مباشرة"],
    revisions: 0,
    category: "consultation",
    features: { 
      ar: ["استشارة مجانية", "جلسة 15-20 دقيقة", "عبر واتساب أو مكالمة", "بدون التزام مالي"],
      en: ["Free consultation", "15-20 minute session", "Via WhatsApp or call", "No financial commitment"]
    },
    slug: "business-development-consultation",
    nonRefundable: true,
    isActive: true,
    order: 21
  },
  {
    title: { ar: "إدارة حسابات السوشيال ميديا", en: "Social Media Account Management" },
    description: { 
      ar: "حضور رقمي متكامل — لأن النجاح يبدأ من استراتيجية واضحة وتنفيذ احترافي.\nنقدم لك خدمة شاملة لإدارة محتوى حساباتك على السوشيال ميديا، تشمل:\n• إعداد خطة محتوى شهرية مدروسة حسب أهدافك\n• كتابة وتصميم 15 بوست احترافي يعكس هوية مشروعك\n• نشر يومي للستوريز بأسلوب جذاب ومتجدد\n• تنسيق الحساب بصريًا عند الطلب (الألوان، الأغلفة، الترتيب العام)\n• إدارة الحسابات والتفاعل مع الجمهور حسب الاتفاق\n• جدولة النشر باحترافية لضمان استمرارية الحضور\n• تقارير أداء دورية توضح النتائج وتوصيات التحسين",
      en: "Complete digital presence — because success starts with clear strategy and professional execution."
    },
    price: { SAR: 937.5, USD: 250, originalSAR: 825, originalUSD: 220 },
    deliveryTime: { min: 30, max: 30 },
    deliveryFormats: ["خدمة شهرية"],
    revisions: 0,
    category: "management",
    features: { 
      ar: ["إعداد خطة محتوى شهرية", "كتابة وتصميم 15 بوست احترافي", "نشر يومي للستوريز", "تنسيق الحساب بصريًا", "إدارة التفاعل مع الجمهور", "جدولة النشر", "تقارير أداء دورية"],
      en: ["Monthly content plan preparation", "Writing and designing 15 professional posts", "Daily stories publishing", "Visual account coordination", "Audience interaction management", "Publishing scheduling", "Periodic performance reports"]
    },
    slug: "social-media-management",
    nonRefundable: true,
    isActive: true,
    order: 22
  }
];

async function addRemainingServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Insert additional services
    for (const serviceData of additionalServices) {
      const service = new Service(serviceData);
      await service.save();
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

addRemainingServices();
