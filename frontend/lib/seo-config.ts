// نظام إدارة SEO الديناميكي للخدمات والمقالات الجديدة

export interface ServiceData {
  id: string
  title: string
  description: string
  shortDescription: string
  keywords: string[]
  category: string
  price?: string
  features?: string[]
  icon?: string
}

export interface BlogPostData {
  slug: string
  title: string
  description: string
  keywords: string[]
  category: string
  author: string
  publishDate: string
  readTime: number
  tags: string[]
}

// بيانات الخدمات - يمكن إضافة خدمات جديدة هنا
export const servicesData: ServiceData[] = [
  {
    id: "logo-design",
    title: "تصميم الشعارات",
    description: "تصميم شعارات احترافية وفريدة تعكس هوية علامتك التجارية وتميزها في السوق. نحن نصمم شعارات إبداعية تترك انطباعاً قوياً لدى عملائك.",
    shortDescription: "تصميم شعارات احترافية وفريدة تعكس هوية علامتك التجارية",
    keywords: [
      "تصميم شعارات", "تصميم لوجو", "شعار احترافي", "هوية بصرية",
      "تصميم علامة تجارية", "لوجو شركة", "تصميم شعار مميز"
    ],
    category: "تصميم جرافيك",
    price: "يبدأ من 299 ريال",
    features: [
      "تصميمات متعددة للاختيار",
      "ملفات عالية الجودة",
      "تعديلات مجانية",
      "تسليم سريع"
    ]
  },
  {
    id: "social-media",
    title: "إدارة السوشيال ميديا",
    description: "إدارة وتصميم محتوى منصات التواصل الاجتماعي بطريقة احترافية تزيد من تفاعل الجمهور وتحقق أهدافك التسويقية.",
    shortDescription: "إدارة وتصميم محتوى منصات التواصل الاجتماعي بطريقة احترافية",
    keywords: [
      "سوشيال ميديا", "إدارة حسابات", "محتوى رقمي", "تصميم منشورات",
      "تسويق رقمي", "انستقرام", "تويتر", "فيسبوك"
    ],
    category: "تسويق رقمي",
    price: "يبدأ من 499 ريال شهرياً"
  },
  {
    id: "branding",
    title: "الهوية البصرية",
    description: "تطوير هوية بصرية متكاملة لعلامتك التجارية تشمل الألوان والخطوط والعناصر البصرية التي تميز شركتك.",
    shortDescription: "تطوير هوية بصرية متكاملة لعلامتك التجارية",
    keywords: [
      "هوية بصرية", "علامة تجارية", "دليل الهوية", "ألوان الشركة",
      "خطوط الشركة", "عناصر بصرية", "تطوير العلامة التجارية"
    ],
    category: "استراتيجية العلامة التجارية",
    price: "يبدأ من 799 ريال"
  },
  {
    id: "advertising-banners",
    title: "تصميم البنرات الإعلانية",
    description: "تصميم بنرات إعلانية جذابة وفعالة للحملات التسويقية على جميع المنصات الرقمية والمطبوعات.",
    shortDescription: "تصميم بنرات إعلانية جذابة وفعالة للحملات التسويقية",
    keywords: [
      "بنرات إعلانية", "إعلانات رقمية", "تصميم إعلان", "حملات تسويقية",
      "بنرات ويب", "إعلانات مطبوعة", "تصميم إعلاني"
    ],
    category: "إعلانات وتسويق",
    price: "يبدأ من 199 ريال"
  },
  {
    id: "content-writing",
    title: "كتابة المحتوى",
    description: "خدمات كتابة المحتوى الإبداعي والتسويقي الذي يجذب الجمهور ويحقق أهدافك التسويقية.",
    shortDescription: "كتابة المحتوى الإبداعي والتسويقي المؤثر",
    keywords: [
      "كتابة محتوى", "محتوى إبداعي", "محتوى تسويقي", "كاتب محتوى",
      "نسخة إعلانية", "محتوى رقمي", "كتابة مقالات"
    ],
    category: "المحتوى والكتابة",
    price: "يبدأ من 149 ريال"
  },
  {
    id: "cv-design",
    title: "تصميم السير الذاتية",
    description: "تصميم سير ذاتية احترافية ومميزة تبرز مهاراتك وخبراتك بطريقة جذابة ومؤثرة.",
    shortDescription: "تصميم سير ذاتية احترافية ومميزة",
    keywords: [
      "تصميم سيرة ذاتية", "CV تصميم", "سيرة ذاتية احترافية",
      "تصميم ريزومه", "ملف شخصي", "سيرة ذاتية إبداعية"
    ],
    category: "تصميم شخصي",
    price: "يبدأ من 99 ريال"
  }
]

// بيانات المقالات - يمكن إضافة مقالات جديدة هنا
export const blogPostsData: BlogPostData[] = [
  {
    slug: "logo-design-tips",
    title: "نصائح لتصميم شعار احترافي يميز علامتك التجارية",
    description: "اكتشف أهم النصائح والإرشادات من خبراء التصميم لإنشاء شعار مميز وفعال يعكس هوية علامتك التجارية ويترك انطباعاً قوياً.",
    keywords: [
      "تصميم شعار", "نصائح تصميم", "شعار احترافي", "هوية بصرية",
      "علامة تجارية", "لوجو مميز", "أسرار التصميم"
    ],
    category: "تصميم",
    author: "فريق بصمة تصميم",
    publishDate: "2024-10-01",
    readTime: 5,
    tags: ["تصميم", "شعارات", "نصائح", "هوية بصرية"]
  },
  {
    slug: "social-media-strategy",
    title: "استراتيجية السوشيال ميديا الفعالة للشركات",
    description: "تعلم كيف تبني استراتيجية ناجحة لمنصات التواصل الاجتماعي تزيد من تفاعل الجمهور وتحقق أهدافك التسويقية.",
    keywords: [
      "استراتيجية سوشيال ميديا", "تسويق رقمي", "منصات التواصل",
      "محتوى رقمي", "تفاعل الجمهور", "خطة تسويقية"
    ],
    category: "تسويق رقمي",
    author: "فريق بصمة تصميم",
    publishDate: "2024-09-28",
    readTime: 7,
    tags: ["تسويق", "سوشيال ميديا", "استراتيجية", "محتوى"]
  },
  {
    slug: "branding-importance",
    title: "أهمية الهوية البصرية للشركات والمؤسسات",
    description: "فهم أهمية الهوية البصرية وتأثيرها على نجاح علامتك التجارية في السوق وكيفية بناء هوية قوية ومؤثرة.",
    keywords: [
      "هوية بصرية", "أهمية الهوية", "علامة تجارية", "نجاح الأعمال",
      "تطوير الهوية", "استراتيجية العلامة التجارية"
    ],
    category: "استراتيجية الأعمال",
    author: "فريق بصمة تصميم",
    publishDate: "2024-09-25",
    readTime: 6,
    tags: ["هوية بصرية", "علامة تجارية", "استراتيجية", "أعمال"]
  }
]

// دالة توليد metadata للخدمات
export function generateServiceMetadata(serviceId: string) {
  const service = servicesData.find(s => s.id === serviceId)
  if (!service) return null

  return {
    title: `${service.title} - بصمة تصميم`,
    description: service.description,
    keywords: [...service.keywords, "بصمة تصميم", "شركة تصميم"],
    openGraph: {
      title: `${service.title} - بصمة تصميم`,
      description: service.shortDescription,
      type: 'service' as const,
      url: `https://basmatdesign.cloud/services/${serviceId}`,
      images: [{
        url: `/services/${serviceId}-og.jpg`,
        width: 1200,
        height: 630,
        alt: service.title
      }]
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${service.title} - بصمة تصميم`,
      description: service.shortDescription,
      images: [`/services/${serviceId}-og.jpg`]
    }
  }
}

// دالة توليد metadata للمقالات
export function generateBlogMetadata(slug: string) {
  const post = blogPostsData.find(p => p.slug === slug)
  if (!post) return null

  return {
    title: `${post.title} - مدونة بصمة تصميم`,
    description: post.description,
    keywords: [...post.keywords, "بصمة تصميم", "مدونة تصميم"],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article' as const,
      url: `https://basmatdesign.cloud/blog/${slug}`,
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.tags,
      images: [{
        url: `/blog/${slug}-og.jpg`,
        width: 1200,
        height: 630,
        alt: post.title
      }]
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description: post.description,
      images: [`/blog/${slug}-og.jpg`]
    }
  }
}

// دالة توليد structured data للخدمات
export function generateServiceStructuredData(serviceId: string) {
  const service = servicesData.find(s => s.id === serviceId)
  if (!service) return null

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "بصمة تصميم",
      "url": "https://basmatdesign.cloud"
    },
    "serviceType": service.category,
    "url": `https://basmatdesign.cloud/services/${serviceId}`,
    ...(service.price && {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "SAR",
        "availability": "https://schema.org/InStock"
      }
    }),
    "areaServed": {
      "@type": "Country",
      "name": "Saudi Arabia"
    }
  }
}

// دالة توليد structured data للمقالات
export function generateBlogStructuredData(slug: string) {
  const post = blogPostsData.find(p => p.slug === slug)
  if (!post) return null

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.publishDate,
    "dateModified": post.publishDate,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://basmatdesign.cloud/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "بصمة تصميم",
      "logo": {
        "@type": "ImageObject",
        "url": "https://basmatdesign.cloud/LOGO.png"
      }
    },
    "image": `https://basmatdesign.cloud/blog/${slug}-og.jpg`,
    "url": `https://basmatdesign.cloud/blog/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://basmatdesign.cloud/blog/${slug}`
    },
    "keywords": post.keywords.join(", "),
    "articleSection": post.category,
    "wordCount": post.readTime * 200, // تقدير عدد الكلمات
    "timeRequired": `PT${post.readTime}M`
  }
}
