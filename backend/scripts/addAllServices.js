import mongoose from 'mongoose';
import Service from '../src/models/Service.js';

const services = [
  {
    title: { ar: 'تصميم الهوية البصرية الكاملة', en: 'Complete Brand Identity Design' },
    slug: 'complete-brand-identity-design',
    description: { 
      ar: 'تصميم هوية بصرية متكاملة تشمل الشعار والألوان والخطوط وجميع المواد التسويقية', 
      en: 'Complete brand identity design including logo, colors, fonts and all marketing materials' 
    },
    price: { SAR: 1500, USD: 400 },
    originalPrice: { SAR: 1800, USD: 480 },
    category: 'branding',
    deliveryTime: { min: 7, max: 14 },
    revisions: 3,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
    features: {
      ar: ['تصميم الشعار الأساسي', 'اختيار الألوان المؤسسية', 'اختيار الخطوط المناسبة', 'دليل الهوية البصرية'],
      en: ['Primary logo design', 'Corporate color selection', 'Font selection', 'Brand guidelines']
    }
  },
  {
    title: { ar: 'تصميم شعار احترافي', en: 'Professional Logo Design' },
    slug: 'professional-logo-design',
    description: { 
      ar: 'تصميم شعار احترافي يعكس هوية علامتك التجارية بشكل مميز وجذاب', 
      en: 'Professional logo design that uniquely represents your brand identity' 
    },
    price: { SAR: 500, USD: 133 },
    originalPrice: { SAR: 600, USD: 160 },
    category: 'logos',
    deliveryTime: { min: 3, max: 7 },
    revisions: 2,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop'],
    features: {
      ar: ['تصميم أكثر من مفهوم', 'ملفات عالية الجودة', 'تصميم متجاوب'],
      en: ['Multiple concept designs', 'High-quality files', 'Responsive design']
    }
  },
  {
    title: { ar: 'تصميم موقع إلكتروني', en: 'Website Design' },
    description: { 
      ar: 'تصميم موقع إلكتروني حديث ومتجاوب يناسب جميع الأجهزة', 
      en: 'Modern and responsive website design suitable for all devices' 
    },
    price: 2500,
    discountedPrice: 2000,
    category: 'web-design',
    deliveryTime: { min: 14, max: 21 },
    revisions: 2,
    featured: true,
    status: 'active',
    images: ['/images/services/website-design.jpg'],
    features: [
      { ar: 'تصميم متجاوب', en: 'Responsive design' },
      { ar: 'تجربة مستخدم محسنة', en: 'Optimized user experience' },
      { ar: 'تحسين محركات البحث', en: 'SEO optimization' }
    ]
  },
  {
    title: { ar: 'تصميم تطبيق جوال', en: 'Mobile App Design' },
    description: { 
      ar: 'تصميم واجهات تطبيقات الجوال بشكل احترافي وعصري', 
      en: 'Professional and modern mobile app interface design' 
    },
    price: 3000,
    discountedPrice: 2500,
    category: 'app-design',
    deliveryTime: { min: 21, max: 30 },
    revisions: 3,
    featured: true,
    status: 'active',
    images: ['/images/services/app-design.jpg'],
    features: [
      { ar: 'تصميم iOS و Android', en: 'iOS and Android design' },
      { ar: 'نماذج تفاعلية', en: 'Interactive prototypes' },
      { ar: 'دليل التصميم', en: 'Design guidelines' }
    ]
  },
  {
    title: { ar: 'تصاميم السوشيال ميديا', en: 'Social Media Designs' },
    description: { 
      ar: 'تصميم محتوى إبداعي لمنصات التواصل الاجتماعي', 
      en: 'Creative content design for social media platforms' 
    },
    price: 800,
    discountedPrice: 600,
    category: 'social-media',
    deliveryTime: { min: 3, max: 7 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/social-media.jpg'],
    features: [
      { ar: 'تصاميم متعددة الأحجام', en: 'Multiple size designs' },
      { ar: 'قوالب قابلة للتخصيص', en: 'Customizable templates' },
      { ar: 'محتوى إبداعي', en: 'Creative content' }
    ]
  },
  {
    title: { ar: 'تصميم بروشور', en: 'Brochure Design' },
    description: { 
      ar: 'تصميم بروشورات تسويقية احترافية لعرض منتجاتك وخدماتك', 
      en: 'Professional marketing brochure design to showcase your products and services' 
    },
    price: 600,
    discountedPrice: 450,
    category: 'print-design',
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/brochure.jpg'],
    features: [
      { ar: 'تصميم ثلاثي الطي', en: 'Tri-fold design' },
      { ar: 'جودة طباعة عالية', en: 'High print quality' },
      { ar: 'محتوى جذاب', en: 'Engaging content' }
    ]
  },
  {
    title: { ar: 'تصميم بطاقة أعمال', en: 'Business Card Design' },
    description: { 
      ar: 'تصميم بطاقات أعمال أنيقة واحترافية تعكس هويتك المهنية', 
      en: 'Elegant and professional business card design reflecting your professional identity' 
    },
    price: 200,
    discountedPrice: 150,
    category: 'print-design',
    deliveryTime: { min: 2, max: 3 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/business-card.jpg'],
    features: [
      { ar: 'تصميم وجهين', en: 'Double-sided design' },
      { ar: 'اختيار الورق المناسب', en: 'Suitable paper selection' },
      { ar: 'معلومات منظمة', en: 'Organized information' }
    ]
  },
  {
    title: { ar: 'تصميم فلاير', en: 'Flyer Design' },
    description: { 
      ar: 'تصميم فلايرات إعلانية جذابة لترويج فعالياتك ومنتجاتك', 
      en: 'Attractive advertising flyer design to promote your events and products' 
    },
    price: 300,
    discountedPrice: 250,
    category: 'print-design',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/flyer.jpg'],
    features: [
      { ar: 'تصميم ملفت للنظر', en: 'Eye-catching design' },
      { ar: 'رسالة واضحة', en: 'Clear message' },
      { ar: 'ألوان جذابة', en: 'Attractive colors' }
    ]
  },
  {
    title: { ar: 'تصميم بوستر', en: 'Poster Design' },
    description: { 
      ar: 'تصميم بوسترات احترافية للفعاليات والإعلانات التجارية', 
      en: 'Professional poster design for events and commercial advertisements' 
    },
    price: 400,
    discountedPrice: 300,
    category: 'print-design',
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/poster.jpg'],
    features: [
      { ar: 'أحجام متعددة', en: 'Multiple sizes' },
      { ar: 'جودة عالية للطباعة', en: 'High quality for printing' },
      { ar: 'تصميم إبداعي', en: 'Creative design' }
    ]
  },
  {
    title: { ar: 'تصميم كتالوج', en: 'Catalog Design' },
    description: { 
      ar: 'تصميم كتالوجات منتجات احترافية لعرض مجموعتك بشكل منظم وجذاب', 
      en: 'Professional product catalog design to showcase your collection in an organized and attractive way' 
    },
    price: 1200,
    discountedPrice: 1000,
    category: 'print-design',
    deliveryTime: { min: 7, max: 10 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/catalog.jpg'],
    features: [
      { ar: 'تخطيط منظم', en: 'Organized layout' },
      { ar: 'صور عالية الجودة', en: 'High-quality images' },
      { ar: 'فهرسة احترافية', en: 'Professional indexing' }
    ]
  },
  {
    title: { ar: 'تصميم غلاف كتاب', en: 'Book Cover Design' },
    description: { 
      ar: 'تصميم أغلفة كتب مبدعة وجذابة تجذب القراء وتعكس محتوى الكتاب', 
      en: 'Creative and attractive book cover design that attracts readers and reflects the book content' 
    },
    price: 500,
    discountedPrice: 400,
    category: 'print-design',
    deliveryTime: { min: 5, max: 7 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/book-cover.jpg'],
    features: [
      { ar: 'تصميم الواجهة والخلف', en: 'Front and back cover design' },
      { ar: 'اختيار خطوط مناسبة', en: 'Suitable font selection' },
      { ar: 'تصميم الكعب', en: 'Spine design' }
    ]
  },
  {
    title: { ar: 'تصميم تغليف منتج', en: 'Product Packaging Design' },
    description: { 
      ar: 'تصميم تغليف منتجات مبتكر وجذاب يبرز علامتك التجارية', 
      en: 'Innovative and attractive product packaging design that highlights your brand' 
    },
    price: 800,
    discountedPrice: 650,
    category: 'packaging',
    deliveryTime: { min: 7, max: 10 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/packaging.jpg'],
    features: [
      { ar: 'تصميم ثلاثي الأبعاد', en: '3D design visualization' },
      { ar: 'اختيار مواد مناسبة', en: 'Suitable material selection' },
      { ar: 'تطبيق الهوية البصرية', en: 'Brand identity application' }
    ]
  },
  {
    title: { ar: 'تصميم لافتة إعلانية', en: 'Banner Design' },
    description: { 
      ar: 'تصميم لافتات إعلانية كبيرة الحجم للشوارع والمحال التجارية', 
      en: 'Large-scale advertising banner design for streets and commercial stores' 
    },
    price: 600,
    discountedPrice: 500,
    category: 'outdoor-advertising',
    deliveryTime: { min: 3, max: 6 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/banner.jpg'],
    features: [
      { ar: 'رؤية واضحة من بعيد', en: 'Clear visibility from distance' },
      { ar: 'ألوان زاهية', en: 'Vibrant colors' },
      { ar: 'رسالة مبسطة', en: 'Simplified message' }
    ]
  },
  {
    title: { ar: 'تصميم ستاند معرض', en: 'Exhibition Stand Design' },
    description: { 
      ar: 'تصميم ستاند معارض احترافي يجذب الزوار ويعرض علامتك التجارية بأفضل شكل', 
      en: 'Professional exhibition stand design that attracts visitors and showcases your brand optimally' 
    },
    price: 2000,
    discountedPrice: 1700,
    category: 'exhibition',
    deliveryTime: { min: 14, max: 21 },
    revisions: 3,
    featured: false,
    status: 'active',
    images: ['/images/services/exhibition-stand.jpg'],
    features: [
      { ar: 'تصميم ثلاثي الأبعاد', en: '3D design visualization' },
      { ar: 'تخطيط مساحة مثالي', en: 'Optimal space planning' },
      { ar: 'عناصر تفاعلية', en: 'Interactive elements' }
    ]
  },
  {
    title: { ar: 'تصميم قائمة طعام', en: 'Menu Design' },
    description: { 
      ar: 'تصميم قوائم طعام أنيقة وعملية للمطاعم والمقاهي', 
      en: 'Elegant and practical menu design for restaurants and cafes' 
    },
    price: 400,
    discountedPrice: 350,
    category: 'restaurant',
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/menu.jpg'],
    features: [
      { ar: 'تنظيم واضح للأقسام', en: 'Clear section organization' },
      { ar: 'صور شهية للأطباق', en: 'Appetizing dish photos' },
      { ar: 'سهولة القراءة', en: 'Easy readability' }
    ]
  },
  {
    title: { ar: 'تصميم شهادة', en: 'Certificate Design' },
    description: { 
      ar: 'تصميم شهادات تقدير وإنجاز أنيقة ومميزة للمؤسسات والفعاليات', 
      en: 'Elegant and distinctive certificate design for institutions and events' 
    },
    price: 300,
    discountedPrice: 250,
    category: 'certificate',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/certificate.jpg'],
    features: [
      { ar: 'إطار مزخرف', en: 'Decorative border' },
      { ar: 'خطوط أنيقة', en: 'Elegant fonts' },
      { ar: 'مساحة للمعلومات', en: 'Space for information' }
    ]
  },
  {
    title: { ar: 'تصميم دعوة زفاف', en: 'Wedding Invitation Design' },
    description: { 
      ar: 'تصميم دعوات زفاف رومانسية وأنيقة تناسب يومك المميز', 
      en: 'Romantic and elegant wedding invitation design perfect for your special day' 
    },
    price: 500,
    discountedPrice: 400,
    category: 'invitation',
    deliveryTime: { min: 5, max: 7 },
    revisions: 3,
    featured: false,
    status: 'active',
    images: ['/images/services/wedding-invitation.jpg'],
    features: [
      { ar: 'تصاميم رومانسية', en: 'Romantic designs' },
      { ar: 'خامات فاخرة', en: 'Luxury materials' },
      { ar: 'طباعة مذهبة', en: 'Gold printing' }
    ]
  },
  {
    title: { ar: 'تصميم ملف شركة', en: 'Company Profile Design' },
    description: { 
      ar: 'تصميم ملف شركة احترافي يعرض خدماتك وإنجازاتك بشكل مميز', 
      en: 'Professional company profile design showcasing your services and achievements distinctively' 
    },
    price: 1000,
    discountedPrice: 800,
    category: 'corporate',
    deliveryTime: { min: 7, max: 14 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/company-profile.jpg'],
    features: [
      { ar: 'تخطيط احترافي', en: 'Professional layout' },
      { ar: 'محتوى منظم', en: 'Organized content' },
      { ar: 'صور عالية الجودة', en: 'High-quality images' }
    ]
  },
  {
    title: { ar: 'تصميم عرض تقديمي', en: 'Presentation Design' },
    description: { 
      ar: 'تصميم عروض تقديمية احترافية ومؤثرة للاجتماعات والمؤتمرات', 
      en: 'Professional and impactful presentation design for meetings and conferences' 
    },
    price: 600,
    discountedPrice: 500,
    category: 'presentation',
    deliveryTime: { min: 5, max: 7 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/presentation.jpg'],
    features: [
      { ar: 'قوالب متنوعة', en: 'Various templates' },
      { ar: 'انتقالات سلسة', en: 'Smooth transitions' },
      { ar: 'رسوم بيانية', en: 'Infographics' }
    ]
  },
  {
    title: { ar: 'تصميم إنفوجرافيك', en: 'Infographic Design' },
    description: { 
      ar: 'تصميم إنفوجرافيك جذاب لعرض المعلومات والبيانات بشكل بصري مبسط', 
      en: 'Attractive infographic design to present information and data in a simplified visual format' 
    },
    price: 400,
    discountedPrice: 350,
    category: 'infographic',
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/infographic.jpg'],
    features: [
      { ar: 'تبسيط المعلومات', en: 'Information simplification' },
      { ar: 'رسوم توضيحية', en: 'Illustrative graphics' },
      { ar: 'ألوان متناسقة', en: 'Coordinated colors' }
    ]
  },
  {
    title: { ar: 'تصميم أيقونات', en: 'Icon Design' },
    description: { 
      ar: 'تصميم مجموعة أيقونات متناسقة ومميزة لموقعك أو تطبيقك', 
      en: 'Design cohesive and distinctive icon sets for your website or application' 
    },
    price: 600,
    discountedPrice: 500,
    category: 'icon-design',
    deliveryTime: { min: 5, max: 8 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/icons.jpg'],
    features: [
      { ar: 'أساليب متعددة', en: 'Multiple styles' },
      { ar: 'أحجام مختلفة', en: 'Different sizes' },
      { ar: 'تناسق في التصميم', en: 'Design consistency' }
    ]
  },
  {
    title: { ar: 'تصميم رسوم توضيحية', en: 'Illustration Design' },
    description: { 
      ar: 'تصميم رسوم توضيحية إبداعية تخدم احتياجاتك التسويقية والتعليمية', 
      en: 'Creative illustration design serving your marketing and educational needs' 
    },
    price: 800,
    discountedPrice: 650,
    category: 'illustration',
    deliveryTime: { min: 7, max: 10 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/illustration.jpg'],
    features: [
      { ar: 'أساليب فنية متنوعة', en: 'Various artistic styles' },
      { ar: 'رسوم مخصصة', en: 'Custom illustrations' },
      { ar: 'جودة عالية', en: 'High quality' }
    ]
  },
  {
    title: { ar: 'تصميم غلاف فيسبوك', en: 'Facebook Cover Design' },
    description: { 
      ar: 'تصميم غلاف فيسبوك احترافي يعكس شخصية حسابك أو شركتك', 
      en: 'Professional Facebook cover design reflecting your account or company personality' 
    },
    price: 200,
    discountedPrice: 150,
    category: 'social-media',
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/facebook-cover.jpg'],
    features: [
      { ar: 'مقاسات دقيقة', en: 'Precise dimensions' },
      { ar: 'تصميم جذاب', en: 'Attractive design' },
      { ar: 'رسالة واضحة', en: 'Clear message' }
    ]
  },
  {
    title: { ar: 'تصميم محتوى يوتيوب', en: 'YouTube Content Design' },
    description: { 
      ar: 'تصميم صور مصغرة وأغلفة قنوات يوتيوب جذابة تزيد من المشاهدات', 
      en: 'Attractive YouTube thumbnail and channel cover design that increases views' 
    },
    price: 300,
    discountedPrice: 250,
    category: 'social-media',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    featured: false,
    status: 'active',
    images: ['/images/services/youtube.jpg'],
    features: [
      { ar: 'صور مصغرة جذابة', en: 'Attractive thumbnails' },
      { ar: 'غلاف قناة احترافي', en: 'Professional channel cover' },
      { ar: 'تصميم متناسق', en: 'Consistent design' }
    ]
  },
  {
    title: { ar: 'تصميم متجر إلكتروني', en: 'E-commerce Design' },
    description: { 
      ar: 'تصميم متجر إلكتروني متكامل وسهل الاستخدام لزيادة مبيعاتك', 
      en: 'Complete and user-friendly e-commerce design to boost your sales' 
    },
    price: 3500,
    discountedPrice: 3000,
    category: 'e-commerce',
    deliveryTime: { min: 21, max: 35 },
    revisions: 3,
    featured: true,
    status: 'active',
    images: ['/images/services/ecommerce.jpg'],
    features: [
      { ar: 'تصميم متجاوب', en: 'Responsive design' },
      { ar: 'سلة تسوق متطورة', en: 'Advanced shopping cart' },
      { ar: 'نظام دفع آمن', en: 'Secure payment system' }
    ]
  },
  {
    title: { ar: 'تصميم لوحة تحكم', en: 'Dashboard Design' },
    description: { 
      ar: 'تصميم لوحات تحكم إدارية سهلة الاستخدام وغنية بالمعلومات', 
      en: 'User-friendly and information-rich administrative dashboard design' 
    },
    price: 2000,
    discountedPrice: 1700,
    category: 'dashboard',
    deliveryTime: { min: 14, max: 21 },
    revisions: 3,
    featured: false,
    status: 'active',
    images: ['/images/services/dashboard.jpg'],
    features: [
      { ar: 'واجهة سهلة الاستخدام', en: 'User-friendly interface' },
      { ar: 'رسوم بيانية تفاعلية', en: 'Interactive charts' },
      { ar: 'تخطيط منظم', en: 'Organized layout' }
    ]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/basma_db');
  } catch (error) {
    process.exit(1);
  }
};

const seedServices = async () => {
  try {
    await connectDB();
    
    // Clear existing services
    await Service.deleteMany({});
    
    // Insert new services
    const result = await Service.insertMany(services);
    
    mongoose.connection.close();
  } catch (error) {
    process.exit(1);
  }
};

seedServices();
