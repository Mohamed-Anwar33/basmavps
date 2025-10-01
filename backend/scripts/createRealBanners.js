import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from '../src/models/Banner.js';

dotenv.config();

const realBanners = [
  // البنرات الرئيسية للصفحة الرئيسية
  {
    title: {
      ar: "لا تكتفي بالظهور… كن علامة",
      en: "Don't Just Appear... Be a Brand"
    },
    subtitle: {
      ar: "اجعل حضورك يحكي قصتك",
      en: "Make Your Presence Tell Your Story"
    },
    description: {
      ar: "في بصمة تصميم، نحول هويتك إلى تأثير دائم يترك أثراً لا يُنسى في أذهان جمهورك",
      en: "At Basmat Design, we transform your identity into a lasting impact that leaves an unforgettable impression on your audience"
    },
    type: "basic",
    position: "top",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/growth.png",
      alt: "بصمة تصميم - كن علامة مميزة"
    },
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اطلب الآن وابدأ التأثير", en: "Order Now and Start Impact" },
      link: "/contact",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "عروض خاصة لفترة محدودة — لا تفوّت الفرصة",
      en: "Special Limited-Time Offers - Don't Miss Out"
    },
    subtitle: {
      ar: "اكتشف خدمتك القادمة",
      en: "Discover Your Next Service"
    },
    description: {
      ar: "احصل على خصومات حصرية على جميع خدمات التصميم والهوية البصرية لفترة محدودة",
      en: "Get exclusive discounts on all design and visual identity services for a limited time"
    },
    type: "promo",
    position: "middle",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/ui-ux-designer.png",
      alt: "بصمة تصميم - عروض خاصة"
    },
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اكتشف العروض", en: "Discover Offers" },
      link: "/services",
      style: "secondary"
    },
    isActive: true,
    order: 2
  },
  {
    title: {
      ar: "اكتشف كيف تتحوّل فكرتك إلى حضورٍ لا يُنسى",
      en: "Discover How Your Idea Transforms into an Unforgettable Presence"
    },
    subtitle: {
      ar: "مشروعك يستحق بداية تُلفت الأنظار",
      en: "Your Project Deserves an Eye-Catching Start"
    },
    description: {
      ar: "من الفكرة الأولى إلى التنفيذ النهائي، نرافقك في رحلة تحويل رؤيتك إلى واقع مذهل",
      en: "From the first idea to final execution, we accompany you on the journey of turning your vision into stunning reality"
    },
    type: "basic",
    position: "bottom",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/illustration.png",
      alt: "بصمة تصميم - حضور لا يُنسى"
    },
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "ابدأ مشروعك الآن", en: "Start Your Project Now" },
      link: "/quote",
      style: "primary"
    },
    isActive: true,
    order: 3
  },

  // بنرات الصفحات الفرعية
  {
    title: {
      ar: "خدماتنا تُصمم لتُحدث فرقًا",
      en: "Our Services Are Designed to Make a Difference"
    },
    subtitle: {
      ar: "حضور بصري يُعبّر عنك",
      en: "Visual Presence That Expresses You"
    },
    description: {
      ar: "نقدم مجموعة شاملة من خدمات التصميم المتخصصة التي تلبي احتياجاتك وتحقق أهدافك",
      en: "We offer a comprehensive range of specialized design services that meet your needs and achieve your goals"
    },
    type: "page",
    position: "top",
    pageSlug: "services",
    image: {
      url: "/ايقونات%20البنرات/ui-ux-designer.png",
      alt: "بصمة تصميم - خدمات متميزة"
    },
    backgroundColor: "#1e40af",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "استكشف الخدمات", en: "Explore Services" },
      link: "/services/all",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا",
      en: "Designs That Mirror Your Vision and Translate It Visually"
    },
    subtitle: {
      ar: "محتوى يُلفت، يُبهر، ويُبقي الأثر",
      en: "Content That Attracts, Amazes, and Leaves an Impact"
    },
    description: {
      ar: "نحن نؤمن أن كل مشروع له قصة فريدة تستحق أن تُروى بأسلوب بصري مميز ومؤثر",
      en: "We believe every project has a unique story that deserves to be told with a distinctive and impactful visual style"
    },
    type: "page",
    position: "bottom",
    pageSlug: "about",
    image: {
      url: "/ايقونات%20البنرات/illustration%20(1).png",
      alt: "بصمة تصميم - تصاميم مميزة"
    },
    backgroundColor: "#059669",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "تعرف على قصتنا", en: "Learn Our Story" },
      link: "/about",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "كتابة تُروّج لهويتك كما تستحق",
      en: "Writing That Promotes Your Identity As It Deserves"
    },
    subtitle: {
      ar: "مشروعك يستحق بداية تُلفت الأنظار",
      en: "Your Project Deserves an Eye-Catching Start"
    },
    description: {
      ar: "نحن هنا لنساعدك في بناء حضور رقمي قوي ومؤثر يعكس قيمك ويحقق أهدافك التجارية",
      en: "We're here to help you build a strong and impactful digital presence that reflects your values and achieves your business goals"
    },
    type: "page",
    position: "top",
    pageSlug: "blog",
    image: {
      url: "/ايقونات%20البنرات/illustration.png",
      alt: "بصمة تصميم - كتابة مؤثرة"
    },
    backgroundColor: "#7c2d12",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اقرأ المزيد", en: "Read More" },
      link: "/blog",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "حضور بصري يُعبّر عنك",
      en: "Visual Presence That Expresses You"
    },
    subtitle: {
      ar: "اجعل حضورك يحكي قصتك",
      en: "Make Your Presence Tell Your Story"
    },
    description: {
      ar: "تواصل معنا اليوم ودعنا نساعدك في تحويل رؤيتك إلى واقع مذهل يترك أثراً دائماً",
      en: "Contact us today and let us help you transform your vision into stunning reality that leaves a lasting impact"
    },
    type: "page",
    position: "top",
    pageSlug: "contact",
    image: {
      url: "/ايقونات%20البنرات/growth.png",
      alt: "بصمة تصميم - تواصل معنا"
    },
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "ابدأ المحادثة", en: "Start Conversation" },
      link: "/contact",
      style: "primary"
    },
    isActive: true,
    order: 1
  }
];

async function createRealBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing banners
    const deleteResult = await Banner.deleteMany({});

    // Insert new real banners
    const insertResult = await Banner.insertMany(realBanners);

    // Display summary
    const summary = {};
    insertResult.forEach(banner => {
      const key = `${banner.pageSlug}-${banner.position}`;
      summary[key] = (summary[key] || 0) + 1;
    });

    Object.entries(summary).forEach(([key, count]) => {
    });

    insertResult.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title.ar} (${banner.pageSlug}/${banner.position})`);
    });

  } catch (error) {
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
}

// Run the script
createRealBanners();
