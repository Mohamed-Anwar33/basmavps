import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const bannerData = [
  // Homepage Banners
  {
    title: {
      ar: "صمّم بصمتك الخاصة",
      en: "Design Your Own Mark"
    },
    subtitle: {
      ar: "ابدأ رحلتك نحو هوية رقمية لا تُنسى",
      en: "Start Your Journey to an Unforgettable Digital Identity"
    },
    description: {
      ar: "في بصمة تصميم، نحول أفكارك إلى تصاميم استثنائية تعكس شخصيتك وتحقق أهدافك",
      en: "At Basmat Design, we transform your ideas into exceptional designs that reflect your personality and achieve your goals"
    },
    type: "basic",
    position: "top",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/growth.png",
      alt: "بصمة تصميم - استراتيجية التسويق"
    },
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "تواصل معنا", en: "Contact Us" },
      link: "/contact",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "خدمات تصميم احترافية",
      en: "Professional Design Services"
    },
    subtitle: {
      ar: "نقدم حلول تصميم متكاملة لجميع احتياجاتك",
      en: "We provide comprehensive design solutions for all your needs"
    },
    description: {
      ar: "من تصميم الشعارات إلى إدارة السوشيال ميديا، نحن شريكك الموثوق في النجاح الرقمي",
      en: "From logo design to social media management, we are your trusted partner in digital success"
    },
    type: "basic",
    position: "middle",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/ui-ux-designer.png",
      alt: "بصمة تصميم - التصميم الرقمي"
    },
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اكتشف خدماتنا", en: "Discover Our Services" },
      link: "/services",
      style: "secondary"
    },
    isActive: true,
    order: 2
  },
  {
    title: {
      ar: "ابدأ مشروعك معنا اليوم",
      en: "Start Your Project With Us Today"
    },
    subtitle: {
      ar: "احصل على استشارة مجانية وعرض سعر مخصص",
      en: "Get a free consultation and custom quote"
    },
    description: {
      ar: "فريقنا من المصممين المحترفين جاهز لتحويل رؤيتك إلى واقع مذهل",
      en: "Our team of professional designers is ready to turn your vision into stunning reality"
    },
    type: "basic",
    position: "bottom",
    pageSlug: "home",
    image: {
      url: "/ايقونات%20البنرات/illustration.png",
      alt: "ابدأ مشروعك معنا"
    },
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "احصل على عرض سعر", en: "Get Quote" },
      link: "/quote",
      style: "primary"
    },
    isActive: true,
    order: 3
  },

  // About Page Banners
  {
    title: {
      ar: "من نحن - بصمة تصميم",
      en: "About Us - Basmat Design"
    },
    subtitle: {
      ar: "قصة شغف وإبداع في عالم التصميم",
      en: "A Story of Passion and Creativity in Design"
    },
    description: {
      ar: "تأسست بصمة تصميم برؤية واضحة: تقديم حلول تصميم مبتكرة تساعد العلامات التجارية على التميز والنمو",
      en: "Basmat Design was founded with a clear vision: to provide innovative design solutions that help brands stand out and grow"
    },
    type: "page",
    position: "top",
    pageSlug: "about",
    image: {
      url: "/ايقونات%20البنرات/illustration%20(1).png",
      alt: "بصمة تصميم - إدارة المحتوى"
    },
    backgroundColor: "#1e40af",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "تعرف على فريقنا", en: "Meet Our Team" },
      link: "/team",
      style: "primary"
    },
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: "رؤيتنا ورسالتنا",
      en: "Our Vision & Mission"
    },
    subtitle: {
      ar: "نسعى لأن نكون الخيار الأول في التصميم الرقمي",
      en: "We strive to be the first choice in digital design"
    },
    description: {
      ar: "رؤيتنا هي إعادة تعريف معايير التصميم الرقمي في المنطقة من خلال الإبداع والجودة العالية",
      en: "Our vision is to redefine digital design standards in the region through creativity and high quality"
    },
    type: "page",
    position: "middle",
    pageSlug: "about",
    image: {
      url: "/ايقونات البنرات/growth.png",
      alt: "رؤية ورسالة بصمة تصميم"
    },
    backgroundColor: "#059669",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اقرأ المزيد", en: "Read More" },
      link: "/about/vision",
      style: "secondary"
    },
    isActive: true,
    order: 2
  },

  // Services Page Banners
  {
    title: {
      ar: "خدماتنا المتميزة",
      en: "Our Distinguished Services"
    },
    subtitle: {
      ar: "حلول تصميم شاملة لجميع احتياجاتك الرقمية",
      en: "Comprehensive design solutions for all your digital needs"
    },
    description: {
      ar: "نقدم مجموعة واسعة من خدمات التصميم الاحترافية التي تلبي احتياجات العلامات التجارية المختلفة",
      en: "We offer a wide range of professional design services that meet the needs of different brands"
    },
    type: "basic",
    position: "top",
    pageSlug: "services",
    image: {
      url: "/ايقونات%20البنرات/ui-ux-designer.png",
      alt: "بصمة تصميم - تصميم UI/UX"
    },
    backgroundColor: "#dc2626",
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
      ar: "باقات مخصصة لكل عميل",
      en: "Custom Packages for Every Client"
    },
    subtitle: {
      ar: "اختر الباقة التي تناسب احتياجاتك وميزانيتك",
      en: "Choose the package that suits your needs and budget"
    },
    description: {
      ar: "نوفر باقات متنوعة تناسب الشركات الناشئة والمؤسسات الكبيرة على حد سواء",
      en: "We offer diverse packages suitable for both startups and large enterprises"
    },
    type: "basic",
    position: "middle",
    pageSlug: "services",
    image: {
      url: "/ايقونات%20البنرات/illustration.png",
      alt: "بصمة تصميم - تطوير المواقع"
    },
    backgroundColor: "#7c2d12",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اطلب باقتك", en: "Order Your Package" },
      link: "/packages",
      style: "secondary"
    },
    isActive: true,
    order: 2
  },

  // Blog Page Banners
  {
    title: {
      ar: "مدونة بصمة تصميم",
      en: "Basmat Design Blog"
    },
    subtitle: {
      ar: "نصائح وأفكار إبداعية في عالم التصميم",
      en: "Creative Tips and Ideas in the Design World"
    },
    description: {
      ar: "اكتشف أحدث الاتجاهات في التصميم واحصل على نصائح من خبرائنا لتطوير مشروعك",
      en: "Discover the latest design trends and get expert tips to develop your project"
    },
    type: "basic",
    position: "top",
    pageSlug: "blog",
    image: {
      url: "/ايقونات البنرات/illustration (1).png",
      alt: "مدونة التصميم"
    },
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "اقرأ المقالات", en: "Read Articles" },
      link: "/blog/articles",
      style: "primary"
    },
    isActive: true,
    order: 1
  },

  // Contact Page Banners
  {
    title: {
      ar: "تواصل معنا",
      en: "Contact Us"
    },
    subtitle: {
      ar: "نحن هنا للإجابة على جميع استفساراتك",
      en: "We're here to answer all your questions"
    },
    description: {
      ar: "تواصل مع فريقنا المختص للحصول على استشارة مجانية وبدء مشروعك معنا",
      en: "Contact our specialized team for a free consultation and start your project with us"
    },
    type: "basic",
    position: "top",
    pageSlug: "contact",
    image: {
      url: "/ايقونات البنرات/growth.png",
      alt: "تواصل مع بصمة تصميم"
    },
    backgroundColor: "#0891b2",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "احجز موعد", en: "Book Appointment" },
      link: "/book",
      style: "primary"
    },
    isActive: true,
    order: 1
  },

  // Promotional Banners
  {
    title: {
      ar: "عرض خاص - خصم 30%",
      en: "Special Offer - 30% Discount"
    },
    subtitle: {
      ar: "على جميع باقات تصميم الهوية البصرية",
      en: "On all visual identity design packages"
    },
    description: {
      ar: "استفد من عرضنا الحصري لفترة محدودة واحصل على هوية بصرية احترافية بأفضل الأسعار",
      en: "Take advantage of our exclusive limited-time offer and get a professional visual identity at the best prices"
    },
    type: "promo",
    position: "top",
    pageSlug: "promo",
    image: {
      url: "/ايقونات البنرات/ui-ux-designer.png",
      alt: "عرض خاص على التصميم"
    },
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    ctaButton: {
      text: { ar: "احصل على العرض", en: "Get Offer" },
      link: "/promo/identity",
      style: "primary"
    },
    features: [
      { ar: "تصميم شعار احترافي", en: "Professional logo design" },
      { ar: "دليل الهوية البصرية", en: "Visual identity guide" },
      { ar: "تطبيقات متنوعة", en: "Various applications" }
    ],
    isActive: true,
    order: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
];

async function seedBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basmat-design');

    // Clear existing banners
    await Banner.deleteMany({});

    // Insert new banners
    const insertedBanners = await Banner.insertMany(bannerData);

    // Display summary
    const summary = {};
    insertedBanners.forEach(banner => {
      const key = `${banner.pageSlug}-${banner.position}`;
      if (!summary[key]) summary[key] = 0;
      summary[key]++;
    });

    Object.entries(summary).forEach(([key, count]) => {
    });

    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding function
seedBanners();
