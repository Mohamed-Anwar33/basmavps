import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import dotenv from 'dotenv';

dotenv.config();

const banners = [
  // الصفحة الرئيسية - البنرات الثلاثة
  {
    title: {
      ar: "لا تكتفي بالظهور… كن علامة",
      en: "Don't just appear... be a brand"
    },
    subtitle: {
      ar: "اجعل حضورك يحكي قصتك",
      en: "Let your presence tell your story"
    },
    description: {
      ar: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا بأسلوب مميز يترك أثراً لا يُنسى",
      en: "Designs that mirror your vision and translate it visually in a distinctive style that leaves an unforgettable impact"
    },
    type: "curved",
    position: "top",
    pageSlug: "home",
    backgroundColor: "#4b2e83",
    textColor: "#ffffff",
    variant: "primary",
    size: "lg",
    ctaButton: {
      text: {
        ar: "اطلب الآن وابدأ التأثير",
        en: "Order now and start the impact"
      },
      link: "/contact",
      style: "primary"
    },
    gradientColors: {
      start: "#2D1B69",
      middle: "#5B21B6", 
      end: "#A855F7"
    },
    curveIntensity: "medium",
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "عروض خاصة لفترة محدودة — لا تفوّت الفرصة",
      en: "Special offers for a limited time — don't miss the opportunity"
    },
    subtitle: {
      ar: "اكتشف خدمتك القادمة",
      en: "Discover your next service"
    },
    description: {
      ar: "استفد من عروضنا الحصرية واحصل على خدمات تصميم متميزة بأسعار لا تُقاوم",
      en: "Take advantage of our exclusive offers and get exceptional design services at irresistible prices"
    },
    type: "curved",
    position: "middle",
    pageSlug: "home",
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
    variant: "accent",
    size: "md",
    ctaButton: {
      text: {
        ar: "اكتشف العروض",
        en: "Discover offers"
      },
      link: "/services",
      style: "primary"
    },
    gradientColors: {
      start: "#7c3aed",
      middle: "#a855f7",
      end: "#c084fc"
    },
    curveIntensity: "light",
    isActive: true,
    order: 2
  },
  {
    title: {
      ar: "اكتشف كيف تتحوّل فكرتك إلى حضورٍ لا يُنسى",
      en: "Discover how your idea transforms into an unforgettable presence"
    },
    subtitle: {
      ar: "مشروعك يستحق بداية تُلفت الأنظار",
      en: "Your project deserves a start that catches attention"
    },
    description: {
      ar: "نحوّل أفكارك إلى واقع بصري مذهل يترك بصمة مميزة في أذهان جمهورك",
      en: "We transform your ideas into stunning visual reality that leaves a distinctive mark in your audience's minds"
    },
    type: "curved",
    position: "bottom",
    pageSlug: "home",
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
    variant: "secondary",
    size: "lg",
    ctaButton: {
      text: {
        ar: "ابدأ مشروعك الآن",
        en: "Start your project now"
      },
      link: "/contact",
      style: "primary"
    },
    gradientColors: {
      start: "#4338ca",
      middle: "#6366f1",
      end: "#8b5cf6"
    },
    curveIntensity: "strong",
    isActive: true,
    order: 3
  },

  // صفحة الخدمات
  {
    title: {
      ar: "خدماتنا تُصمم لتُحدث فرقًا",
      en: "Our services are designed to make a difference"
    },
    subtitle: {
      ar: "حضور بصري يُعبّر عنك",
      en: "Visual presence that expresses you"
    },
    description: {
      ar: "مجموعة شاملة من الخدمات الإبداعية المصممة خصيصاً لتلبية احتياجاتك وتحقيق أهدافك",
      en: "A comprehensive range of creative services designed specifically to meet your needs and achieve your goals"
    },
    type: "curved",
    position: "top",
    pageSlug: "services",
    backgroundColor: "#059669",
    textColor: "#ffffff",
    variant: "services",
    size: "md",
    ctaButton: {
      text: {
        ar: "استكشف خدماتنا",
        en: "Explore our services"
      },
      link: "/services",
      style: "primary"
    },
    gradientColors: {
      start: "#047857",
      middle: "#059669",
      end: "#10b981"
    },
    curveIntensity: "medium",
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا",
      en: "Designs that mirror your vision and translate it visually"
    },
    subtitle: {
      ar: "محتوى يُلفت، يُبهر، ويُبقي الأثر",
      en: "Content that attracts, amazes, and leaves an impact"
    },
    description: {
      ar: "نحن نؤمن أن كل مشروع فريد ويستحق تصميماً يعكس شخصيته الخاصة ويحقق أهدافه",
      en: "We believe that every project is unique and deserves a design that reflects its own personality and achieves its goals"
    },
    type: "curved",
    position: "bottom",
    pageSlug: "services",
    backgroundColor: "#0891b2",
    textColor: "#ffffff",
    variant: "services",
    size: "lg",
    ctaButton: {
      text: {
        ar: "اطلب خدمتك",
        en: "Request your service"
      },
      link: "/contact",
      style: "primary"
    },
    gradientColors: {
      start: "#0e7490",
      middle: "#0891b2",
      end: "#06b6d4"
    },
    curveIntensity: "light",
    isActive: true,
    order: 2
  },

  // صفحة من نحن
  {
    title: {
      ar: "كتابة تُروّج لهويتك كما تستحق",
      en: "Writing that promotes your identity as it deserves"
    },
    subtitle: {
      ar: "نحن لا ننافس على الشكل، بل على الأثر",
      en: "We don't compete on form, but on impact"
    },
    description: {
      ar: "فريق من المبدعين المتخصصين في تحويل الأفكار إلى واقع بصري مؤثر ومميز",
      en: "A team of creatives specialized in transforming ideas into impactful and distinctive visual reality"
    },
    type: "curved",
    position: "top",
    pageSlug: "about",
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    variant: "about",
    size: "lg",
    ctaButton: {
      text: {
        ar: "تعرف علينا أكثر",
        en: "Learn more about us"
      },
      link: "/about",
      style: "primary"
    },
    gradientColors: {
      start: "#b91c1c",
      middle: "#dc2626",
      end: "#ef4444"
    },
    curveIntensity: "medium",
    isActive: true,
    order: 1
  },

  // صفحة التواصل
  {
    title: {
      ar: "مشروعك يستحق بداية تُلفت الأنظار",
      en: "Your project deserves a start that catches attention"
    },
    subtitle: {
      ar: "ابدأ رحلتك معنا اليوم",
      en: "Start your journey with us today"
    },
    description: {
      ar: "تواصل معنا الآن ودعنا نحول أفكارك إلى واقع بصري مذهل يحقق أهدافك",
      en: "Contact us now and let us transform your ideas into stunning visual reality that achieves your goals"
    },
    type: "curved",
    position: "top",
    pageSlug: "contact",
    backgroundColor: "#7c2d12",
    textColor: "#ffffff",
    variant: "contact",
    size: "md",
    ctaButton: {
      text: {
        ar: "تواصل معنا",
        en: "Contact us"
      },
      link: "/contact",
      style: "primary"
    },
    gradientColors: {
      start: "#92400e",
      middle: "#b45309",
      end: "#d97706"
    },
    curveIntensity: "light",
    isActive: true,
    order: 1
  },

  // صفحة المدونة
  {
    title: {
      ar: "محتوى يُلفت، يُبهر، ويُبقي الأثر",
      en: "Content that attracts, amazes, and leaves an impact"
    },
    subtitle: {
      ar: "اكتشف أحدث الاتجاهات في عالم التصميم",
      en: "Discover the latest trends in the design world"
    },
    description: {
      ar: "مقالات ونصائح قيّمة لمساعدتك في فهم عالم التصميم والتسويق الرقمي",
      en: "Valuable articles and tips to help you understand the world of design and digital marketing"
    },
    type: "curved",
    position: "top",
    pageSlug: "blog",
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
    variant: "blog",
    size: "md",
    ctaButton: {
      text: {
        ar: "اقرأ المزيد",
        en: "Read more"
      },
      link: "/blog",
      style: "primary"
    },
    gradientColors: {
      start: "#6d28d9",
      middle: "#7c3aed",
      end: "#8b5cf6"
    },
    curveIntensity: "medium",
    isActive: true,
    order: 1
  }
];

async function addRealBanners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing banners
    await Banner.deleteMany({});

    // Add new banners
    const createdBanners = await Banner.insertMany(banners);

    // Display created banners
    createdBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title.ar} (${banner.pageSlug}/${banner.position})`);
    });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

addRealBanners();
