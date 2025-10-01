import mongoose from 'mongoose';
import Service from '../src/models/Service.js';

const services = [
  {
    title: { ar: 'تصميم بوست سوشيال ميديا', en: 'Social Media Post Design' },
    slug: 'social-media-post-design',
    description: { 
      ar: 'محتوى بصري يوقف التمرير — لأن البصمة تبدأ من أول نظرة. في عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل. نصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية', 
      en: 'Visual content that stops scrolling — because your mark starts from the first glance. We design professional posts that reflect your project identity, with an attractive visual style that achieves your marketing goals' 
    },
    price: { SAR: 56, USD: 15 },
    originalPrice: { SAR: 75, USD: 20 },
    category: 'social-media',
    deliveryTime: { min: 1, max: 4 },
    revisions: 2,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71.jpg'],
    features: {
      ar: ['تصميم بوست واحد متوافق مع الهوية', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['One post design compatible with brand identity', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم بوست إعلاني للسوشيال ميديا', en: 'Social Media Advertisement Post Design' },
    slug: 'social-media-ad-post-design',
    description: { 
      ar: 'أعلن بأسلوب ملفت و مقنع — مع بصمة تصميم، الإعلان له طابع مختلف. نصمم لك بوست إعلاني يجذب الانتباه ويحفّز التفاعل، بصياغة بصرية مدروسة ومؤثرة', 
      en: 'Advertise with an eye-catching and convincing style — with design signature, advertising has a different character. We design an advertising post that attracts attention and stimulates interaction' 
    },
    price: { SAR: 75, USD: 20 },
    category: 'social-media',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f.jpg'],
    features: {
      ar: ['تصميم إعلان احترافي بصيغة جذابة', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['Professional advertisement design in attractive format', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم كاروسيل (5–6 بوستات)', en: 'Carousel Design (5-6 Posts)' },
    slug: 'carousel-design-5-6-posts',
    description: { 
      ar: 'سرد بصري متسلسل يروي قصة مشروعك — كل شريحة تحكي. نصمم لك سلسلة بوستات مترابطة بأسلوب كاروسيل، مثالية للعرض التفاعلي على إنستغرام أو لينكدإن', 
      en: 'Sequential visual narrative that tells your project story — each slide tells. We design a series of interconnected posts in carousel style, perfect for interactive display on Instagram or LinkedIn' 
    },
    price: { SAR: 113, USD: 30 },
    category: 'social-media',
    deliveryTime: { min: 3, max: 7 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07.jpg'],
    features: {
      ar: ['تصميم 5–6 بوستات مترابطة', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['Design of 5-6 interconnected posts', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'بكج 10 تصاميم سوشيال ميديا', en: '10 Social Media Designs Package' },
    slug: 'social-media-designs-package-10',
    description: { 
      ar: 'حزمة متكاملة لحضور رقمي قوي — الجودة والوفرة في بصمة واحدة. احصل على 10 تصاميم متنوعة ومخصصة لحساباتك، بأسلوب احترافي يعكس هوية مشروعك', 
      en: 'Integrated package for strong digital presence — quality and abundance in one signature. Get 10 diverse and customized designs for your accounts, in a professional style that reflects your project identity' 
    },
    price: { SAR: 525, USD: 140 },
    category: 'social-media',
    deliveryTime: { min: 4, max: 8 },
    revisions: 2,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0.jpg'],
    features: {
      ar: ['10 تصاميم متنوعة حسب الطلب', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['10 diverse designs as requested', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم واجهة حساب LinkedIn (بنر + لوقو)', en: 'LinkedIn Profile Design (Banner + Logo)' },
    slug: 'linkedin-profile-design-banner-logo',
    description: { 
      ar: 'خلّي حضورك المهني يترك بصمة واضحة. نصمم لك بنر احترافي ولوقو بسيط يعكس هويتك المهنية ويمنح حسابك مظهرًا احترافيًا وجذابًا', 
      en: 'Make your professional presence leave a clear mark. We design a professional banner and simple logo that reflects your professional identity and gives your account a professional and attractive appearance' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'linkedin',
    deliveryTime: { min: 1, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d.jpg'],
    features: {
      ar: ['تصميم بنر احترافي', 'تصميم لوقو بسيط', 'التسليم بصيغ متعددة PNG, PDF'],
      en: ['Professional banner design', 'Simple logo design', 'Delivery in multiple formats PNG, PDF']
    }
  },
  {
    title: { ar: 'تنفيذ حساب LinkedIn بالكامل', en: 'Complete LinkedIn Account Setup' },
    slug: 'complete-linkedin-account-setup',
    description: { 
      ar: 'بناء احترافي لحسابك من الصفر — نرتب لك كل شيء. نقوم بإنشاء حساب LinkedIn احترافي يشمل التصميم والمحتوى، ليعكس خبراتك ويجذب الفرص المناسبة', 
      en: 'Professional building of your account from scratch — we arrange everything for you. We create a professional LinkedIn account that includes design and content, to reflect your expertise and attract suitable opportunities' 
    },
    price: { SAR: 94, USD: 25 },
    originalPrice: { SAR: 131, USD: 35 },
    category: 'linkedin',
    deliveryTime: { min: 1, max: 6 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71.jpg'],
    features: {
      ar: ['تصميم البنر واللوقو', 'كتابة نبذة وكلمات مفتاحية', 'تعديل رابط URL', 'ترتيب وإضافة الأقسام'],
      en: ['Banner and logo design', 'Bio and keywords writing', 'URL link editing', 'Sections arrangement and addition']
    }
  },
  {
    title: { ar: 'تصميم بنر سوشيال ميديا', en: 'Social Media Banner Design' },
    slug: 'social-media-banner-design',
    description: { 
      ar: 'تصميم بنر جذاب للمنصات الاجتماعية يلفت الانتباه ويعكس هوية مشروعك بأسلوب احترافي', 
      en: 'Attractive social media banner design that catches attention and reflects your project identity in a professional style' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'banners',
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f.jpg'],
    features: {
      ar: ['تصميم بنر جذاب للمنصات', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['Attractive banner design for platforms', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم بنر إعلاني', en: 'Advertisement Banner Design' },
    slug: 'advertisement-banner-design',
    description: { 
      ar: 'تصميم بنر دعائي احترافي يجذب العملاء ويحفز على التفاعل مع منتجاتك وخدماتك', 
      en: 'Professional advertising banner design that attracts customers and encourages interaction with your products and services' 
    },
    price: { SAR: 56, USD: 15 },
    category: 'banners',
    deliveryTime: { min: 1, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07.jpg'],
    features: {
      ar: ['تصميم بنر دعائي احترافي', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['Professional advertising banner design', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم بنر متجر إلكتروني', en: 'E-commerce Banner Design' },
    slug: 'ecommerce-banner-design',
    description: { 
      ar: 'تصميم بنر مخصص للمتاجر الإلكترونية يعرض منتجاتك بطريقة جذابة ويزيد من المبيعات', 
      en: 'Custom e-commerce banner design that showcases your products attractively and increases sales' 
    },
    price: { SAR: 75, USD: 20 },
    category: 'banners',
    deliveryTime: { min: 1, max: 5 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0.jpg'],
    features: {
      ar: ['تصميم بنر مخصص للمتاجر', 'التسليم بصيغ متعددة PNG, PDF', 'تعديلين مجانيين'],
      en: ['Custom banner design for stores', 'Delivery in multiple formats PNG, PDF', 'Two free revisions']
    }
  },
  {
    title: { ar: 'قالب سير ذاتية قابلة للتعديل', en: 'Editable CV Template' },
    slug: 'editable-cv-template',
    description: { 
      ar: 'قالب سيرة ذاتية جاهز عبر Canva — بصمة احترافية في دقائق. قابل للتعديل والإضافة مع إمكانية تغيير الألوان وخطوط متنوعة ومميزة', 
      en: 'Ready CV template via Canva — professional signature in minutes. Editable and customizable with color changing options and diverse distinctive fonts' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'cv-templates',
    deliveryTime: { min: 0, max: 1 },
    revisions: 0,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d.jpg'],
    features: {
      ar: ['قابل للتعديل والإضافة', 'إمكانية تغيير الألوان', 'خطوط متنوعة ومميزة', 'يتم إرسال رابط القالب مباشرة'],
      en: ['Editable and customizable', 'Color changing capability', 'Diverse distinctive fonts', 'Template link sent directly']
    }
  },
  {
    title: { ar: 'تصميم بوست سوشيال ميديا', en: 'Social Media Post Design' },
    slug: 'social-media-post-design',
    description: { 
      ar: 'تصميم منشورات جذابة للمنصات الاجتماعية تعكس هوية مشروعك وتزيد من التفاعل مع جمهورك', 
      en: 'Attractive social media post design that reflects your project identity and increases engagement with your audience' 
    },
    price: { SAR: 19, USD: 5 },
    category: 'social-media',
    deliveryTime: { min: 1, max: 2 },
    revisions: 2,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71.jpg'],
    features: {
      ar: ['تصميم منشور جذاب', 'مناسب لجميع المنصات', 'تعديلين مجانيين'],
      en: ['Attractive post design', 'Suitable for all platforms', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم ستوري انستقرام', en: 'Instagram Story Design' },
    slug: 'instagram-story-design',
    description: { 
      ar: 'تصميم قصص انستقرام مميزة وجذابة تلفت انتباه متابعيك وتزيد من معدل المشاهدة', 
      en: 'Distinctive and attractive Instagram story design that catches your followers attention and increases view rate' 
    },
    price: { SAR: 19, USD: 5 },
    category: 'social-media',
    deliveryTime: { min: 1, max: 2 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71.jpg'],
    features: {
      ar: ['تصميم ستوري مميز', 'مقاسات انستقرام الصحيحة', 'تعديلين مجانيين'],
      en: ['Distinctive story design', 'Correct Instagram dimensions', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم فلاير دعائي', en: 'Promotional Flyer Design' },
    slug: 'promotional-flyer-design',
    description: { 
      ar: 'تصميم فلاير دعائي احترافي يروج لمنتجاتك وخدماتك بطريقة جذابة ومؤثرة', 
      en: 'Professional promotional flyer design that promotes your products and services in an attractive and effective way' 
    },
    price: { SAR: 56, USD: 15 },
    category: 'print-design',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07.jpg'],
    features: {
      ar: ['تصميم فلاير احترافي', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Professional flyer design', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم بروشور', en: 'Brochure Design' },
    slug: 'brochure-design',
    description: { 
      ar: 'تصميم بروشور احترافي يعرض خدماتك ومنتجاتك بطريقة منظمة وجذابة للعملاء', 
      en: 'Professional brochure design that showcases your services and products in an organized and attractive way for customers' 
    },
    price: { SAR: 94, USD: 25 },
    category: 'print-design',
    deliveryTime: { min: 3, max: 6 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0.jpg'],
    features: {
      ar: ['تصميم بروشور منظم', 'عدة صفحات', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Organized brochure design', 'Multiple pages', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم كارت شخصي', en: 'Business Card Design' },
    slug: 'business-card-design',
    description: { 
      ar: 'تصميم كارت شخصي أنيق ومميز يعكس هويتك المهنية ويترك انطباعاً إيجابياً لدى العملاء', 
      en: 'Elegant and distinctive business card design that reflects your professional identity and leaves a positive impression on customers' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'print-design',
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d.jpg'],
    features: {
      ar: ['تصميم كارت أنيق', 'وجهين للكارت', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Elegant card design', 'Two-sided card', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم شعار مع الهوية', en: 'Logo with Brand Identity Design' },
    slug: 'logo-with-brand-identity',
    description: { 
      ar: 'تصميم شعار مميز مع هوية بصرية متكاملة تشمل الألوان والخطوط وعناصر التصميم', 
      en: 'Distinctive logo design with complete visual identity including colors, fonts and design elements' 
    },
    price: { SAR: 188, USD: 50 },
    category: 'branding',
    deliveryTime: { min: 5, max: 10 },
    revisions: 3,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d.jpg'],
    features: {
      ar: ['تصميم شعار مميز', 'هوية بصرية متكاملة', 'دليل استخدام الهوية', '3 تعديلات مجانية'],
      en: ['Distinctive logo design', 'Complete visual identity', 'Brand usage guidelines', '3 free revisions']
    }
  },
  {
    title: { ar: 'تصميم غلاف كتاب', en: 'Book Cover Design' },
    slug: 'book-cover-design',
    description: { 
      ar: 'تصميم غلاف كتاب احترافي وجذاب يعكس محتوى الكتاب ويلفت انتباه القراء', 
      en: 'Professional and attractive book cover design that reflects the book content and catches readers attention' 
    },
    price: { SAR: 75, USD: 20 },
    category: 'print-design',
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم غلاف احترافي', 'غلاف أمامي وخلفي', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Professional cover design', 'Front and back cover', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم منيو مطعم', en: 'Restaurant Menu Design' },
    slug: 'restaurant-menu-design',
    description: { 
      ar: 'تصميم منيو مطعم أنيق ومنظم يعرض الأطباق والأسعار بطريقة جذابة ومريحة للعين', 
      en: 'Elegant and organized restaurant menu design that displays dishes and prices in an attractive and eye-friendly way' 
    },
    price: { SAR: 94, USD: 25 },
    category: 'print-design',
    deliveryTime: { min: 3, max: 6 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم منيو منظم', 'عدة صفحات', 'تنسيق الأطباق والأسعار', 'تعديلين مجانيين'],
      en: ['Organized menu design', 'Multiple pages', 'Dishes and prices formatting', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم بوستر إعلاني', en: 'Advertising Poster Design' },
    slug: 'advertising-poster-design',
    description: { 
      ar: 'تصميم بوستر إعلاني كبير الحجم يجذب الانتباه ويوصل رسالتك الإعلانية بوضوح', 
      en: 'Large-size advertising poster design that catches attention and clearly conveys your advertising message' 
    },
    price: { SAR: 75, USD: 20 },
    category: 'print-design',
    deliveryTime: { min: 2, max: 5 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07.jpg'],
    features: {
      ar: ['تصميم بوستر كبير الحجم', 'رسالة إعلانية واضحة', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Large-size poster design', 'Clear advertising message', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم شهادة تقدير', en: 'Certificate of Appreciation Design' },
    slug: 'certificate-design',
    description: { 
      ar: 'تصميم شهادة تقدير أنيقة ومميزة تكرم المتميزين وتعكس قيمة الإنجاز المحقق', 
      en: 'Elegant and distinctive certificate of appreciation design that honors achievers and reflects the value of accomplishment' 
    },
    price: { SAR: 56, USD: 15 },
    category: 'print-design',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم شهادة أنيقة', 'إطار مميز', 'نص قابل للتعديل', 'تعديلين مجانيين'],
      en: ['Elegant certificate design', 'Distinctive frame', 'Editable text', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم كفر هاتف', en: 'Phone Case Design' },
    slug: 'phone-case-design',
    description: { 
      ar: 'تصميم كفر هاتف مخصص وفريد يعكس شخصيتك ويحمي هاتفك بأسلوب عصري', 
      en: 'Custom and unique phone case design that reflects your personality and protects your phone in a modern style' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'print-design',
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم مخصص وفريد', 'مناسب لجميع أنواع الهواتف', 'جودة عالية للطباعة', 'تعديلين مجانيين'],
      en: ['Custom and unique design', 'Suitable for all phone types', 'High quality for printing', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم تيشيرت', en: 'T-shirt Design' },
    slug: 'tshirt-design',
    description: { 
      ar: 'تصميم تيشيرت مبدع ومميز يعبر عن أفكارك ويجعلك تبرز بأسلوب عصري وجذاب', 
      en: 'Creative and distinctive t-shirt design that expresses your ideas and makes you stand out in a modern and attractive style' 
    },
    price: { SAR: 56, USD: 15 },
    category: 'print-design',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم مبدع ومميز', 'مناسب للطباعة على القماش', 'ألوان زاهية', 'تعديلين مجانيين'],
      en: ['Creative and distinctive design', 'Suitable for fabric printing', 'Vibrant colors', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم كوب قهوة', en: 'Coffee Mug Design' },
    slug: 'coffee-mug-design',
    description: { 
      ar: 'تصميم كوب قهوة شخصي ومميز يضفي لمسة خاصة على لحظات شرب القهوة اليومية', 
      en: 'Personal and distinctive coffee mug design that adds a special touch to your daily coffee drinking moments' 
    },
    price: { SAR: 38, USD: 10 },
    category: 'print-design',
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم شخصي ومميز', 'مناسب للطباعة على الأكواب', 'ألوان ثابتة', 'تعديلين مجانيين'],
      en: ['Personal and distinctive design', 'Suitable for mug printing', 'Fixed colors', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم دعوة زفاف', en: 'Wedding Invitation Design' },
    slug: 'wedding-invitation-design',
    description: { 
      ar: 'تصميم دعوة زفاف رومانسية وأنيقة تعكس فرحة المناسبة وتترك انطباعاً لا يُنسى', 
      en: 'Romantic and elegant wedding invitation design that reflects the joy of the occasion and leaves an unforgettable impression' 
    },
    price: { SAR: 75, USD: 20 },
    category: 'print-design',
    deliveryTime: { min: 3, max: 5 },
    revisions: 3,
    isFeatured: true,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم رومانسي وأنيق', 'تفاصيل مخصصة للعروسين', 'جودة عالية للطباعة', '3 تعديلات مجانية'],
      en: ['Romantic and elegant design', 'Custom details for the couple', 'High quality for printing', '3 free revisions']
    }
  },
  {
    title: { ar: 'تصميم دعوة عيد ميلاد', en: 'Birthday Invitation Design' },
    slug: 'birthday-invitation-design',
    description: { 
      ar: 'تصميم دعوة عيد ميلاد مرحة وملونة تضفي البهجة على الاحتفال وتدعو الأصدقاء للمشاركة', 
      en: 'Fun and colorful birthday invitation design that brings joy to the celebration and invites friends to participate' 
    },
    price: { SAR: 56, USD: 15 },
    category: 'print-design',
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم مرح وملون', 'مناسب لجميع الأعمار', 'تفاصيل قابلة للتخصيص', 'تعديلين مجانيين'],
      en: ['Fun and colorful design', 'Suitable for all ages', 'Customizable details', 'Two free revisions']
    }
  },
  {
    title: { ar: 'تصميم عرض تقديمي', en: 'Presentation Design' },
    slug: 'presentation-design',
    description: { 
      ar: 'تصميم عرض تقديمي احترافي ومنظم يساعدك في إيصال أفكارك بوضوح وإقناع جمهورك', 
      en: 'Professional and organized presentation design that helps you convey your ideas clearly and convince your audience' 
    },
    price: { SAR: 113, USD: 30 },
    category: 'marketing',
    deliveryTime: { min: 3, max: 7 },
    revisions: 2,
    isFeatured: false,
    isActive: true,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c.jpg'],
    features: {
      ar: ['تصميم احترافي ومنظم', 'عدة شرائح', 'رسوم بيانية وإحصائيات', 'تعديلين مجانيين'],
      en: ['Professional and organized design', 'Multiple slides', 'Charts and statistics', 'Two free revisions']
    }
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
