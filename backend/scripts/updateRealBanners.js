import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const realBannerData = [
  // البنرات الرئيسية للصفحة الرئيسية
  {
    pageSlug: "home",
    position: "top",
    content: "لا تكتفي بالظهور… كن علامة",
    subtitle: "إثارة الفضول، ربط الهوية بالتأثير",
    description: "اجعل حضورك يحكي قصتك",
    ctaButton: {
      text: "اطلب الآن وابدأ التأثير",
      link: "/contact",
      style: "primary"
    },
    backgroundColor: "#1e293b",
    textColor: "#ffffff"
  },
  {
    pageSlug: "home", 
    position: "middle",
    content: "عروض خاصة لفترة محدودة — لا تفوّت الفرصة",
    subtitle: "تحفيز الزائر لاكتشاف العروض أو الخدمات المميزة",
    description: "اكتشف خدمتك القادمة",
    ctaButton: {
      text: "اكتشف العروض",
      link: "/services",
      style: "secondary"
    },
    backgroundColor: "#7c3aed",
    textColor: "#ffffff"
  },
  {
    pageSlug: "home",
    position: "bottom", 
    content: "اكتشف كيف تتحوّل فكرتك إلى حضورٍ لا يُنسى",
    subtitle: "دعوة مباشرة للعمل",
    description: "مشروعك يستحق بداية تُلفت الأنظار",
    ctaButton: {
      text: "ابدأ مشروعك الآن",
      link: "/quote",
      style: "primary"
    },
    backgroundColor: "#dc2626",
    textColor: "#ffffff"
  },

  // بنرات صفحة الخدمات
  {
    pageSlug: "services",
    position: "top",
    content: "خدماتنا تُصمم لتُحدث فرقًا",
    subtitle: "حلول تصميم احترافية",
    description: "حضور بصري يُعبّر عنك",
    ctaButton: {
      text: "استكشف خدماتنا",
      link: "/services/all",
      style: "primary"
    },
    backgroundColor: "#0891b2",
    textColor: "#ffffff"
  },
  {
    pageSlug: "services",
    position: "middle",
    content: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا",
    subtitle: "إبداع يلامس التميز",
    description: "محتوى يُلفت، يُبهر، ويُبقي الأثر",
    ctaButton: {
      text: "اطلب تصميمك",
      link: "/contact",
      style: "secondary"
    },
    backgroundColor: "#059669",
    textColor: "#ffffff"
  },

  // بنرات صفحة من نحن
  {
    pageSlug: "about",
    position: "top",
    content: "مشروعك يستحق بداية تُلفت الأنظار",
    subtitle: "قصة شغف وإبداع",
    description: "حضور بصري يُعبّر عنك",
    ctaButton: {
      text: "تعرف على قصتنا",
      link: "/about/story",
      style: "primary"
    },
    backgroundColor: "#1e40af",
    textColor: "#ffffff"
  },
  {
    pageSlug: "about",
    position: "middle",
    content: "كتابة تُروّج لهويتك كما تستحق",
    subtitle: "خبرة تتحدث عن نفسها",
    description: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا",
    ctaButton: {
      text: "شاهد أعمالنا",
      link: "/portfolio",
      style: "secondary"
    },
    backgroundColor: "#7c2d12",
    textColor: "#ffffff"
  },

  // بنرات صفحة المدونة
  {
    pageSlug: "blog",
    position: "top",
    content: "محتوى يُلفت، يُبهر، ويُبقي الأثر",
    subtitle: "نصائح وأفكار إبداعية",
    description: "اكتشف أحدث اتجاهات التصميم",
    ctaButton: {
      text: "اقرأ المقالات",
      link: "/blog/articles",
      style: "primary"
    },
    backgroundColor: "#6366f1",
    textColor: "#ffffff"
  },

  // بنرات صفحة التواصل
  {
    pageSlug: "contact",
    position: "top",
    content: "اجعل حضورك يحكي قصتك",
    subtitle: "تواصل معنا اليوم",
    description: "مشروعك يستحق بداية تُلفت الأنظار",
    ctaButton: {
      text: "احجز استشارة مجانية",
      link: "/consultation",
      style: "primary"
    },
    backgroundColor: "#0891b2",
    textColor: "#ffffff"
  },

  // بنر ترويجي
  {
    pageSlug: "promo",
    position: "top",
    content: "عروض خاصة لفترة محدودة — لا تفوّت الفرصة",
    subtitle: "خصم حصري على جميع الخدمات",
    description: "اطلب الآن وابدأ التأثير",
    ctaButton: {
      text: "احصل على العرض",
      link: "/promo/special",
      style: "primary"
    },
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    features: [
      "خصم يصل إلى 30%",
      "استشارة مجانية",
      "تسليم سريع"
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
];

async function updateRealBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basmat-design');

    // Clear existing banners
    await Banner.deleteMany({});

    // Create updated banners with proper structure
    const bannersToInsert = realBannerData.map((banner, index) => ({
      title: {
        ar: banner.content,
        en: banner.content
      },
      subtitle: banner.subtitle ? {
        ar: banner.subtitle,
        en: banner.subtitle
      } : undefined,
      description: banner.description ? {
        ar: banner.description,
        en: banner.description
      } : undefined,
      type: banner.pageSlug === 'promo' ? 'promo' : 'basic',
      position: banner.position,
      pageSlug: banner.pageSlug,
      image: {
        url: `/images/${banner.pageSlug}-${banner.position}-banner.jpg`,
        alt: `${banner.content} - بصمة تصميم`
      },
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      ctaButton: banner.ctaButton ? {
        text: {
          ar: banner.ctaButton.text,
          en: banner.ctaButton.text
        },
        link: banner.ctaButton.link,
        style: banner.ctaButton.style
      } : undefined,
      features: banner.features ? banner.features.map(feature => ({
        text: {
          ar: feature,
          en: feature
        }
      })) : [],
      isActive: true,
      order: index + 1,
      startDate: banner.startDate,
      endDate: banner.endDate,
      views: 0,
      clicks: 0
    }));

    // Insert new banners
    const insertedBanners = await Banner.insertMany(bannersToInsert);

    // Display summary
    const summary = {};
    insertedBanners.forEach(banner => {
      const key = `${banner.pageSlug}-${banner.position}`;
      if (!summary[key]) summary[key] = 0;
      summary[key]++;
    });

    Object.entries(summary).forEach(([key, count]) => {
    });

    insertedBanners.forEach(banner => {
    });
    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

// Run the update function
updateRealBanners();
