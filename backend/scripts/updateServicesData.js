import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

const servicesData = [
  {
    title: { ar: "تصميم بوست سوشيال ميديا", en: "Social Media Post Design" },
    description: { 
      ar: "محتوى بصري يوقف التمرير — لأن البصمة تبدأ من أول نظرة.\nفي عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل.\nنصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية",
      en: "Visual content that stops scrolling — because the mark starts from first sight."
    },
    price: { SAR: 56.25, USD: 15, originalSAR: 37.5, originalUSD: 10 },
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "social-media",
    features: { 
      ar: ["يشمل تصميم بوست واحد متوافق مع الهوية", "تصميم احترافي يعكس هوية مشروعك", "أسلوب بصري جذاب"],
      en: ["Includes one post design compatible with identity", "Professional design reflecting your project identity", "Attractive visual style"]
    },
    slug: "social-media-post-design",
    nonRefundable: true,
    isActive: true,
    order: 1
  },
  {
    title: { ar: "تصميم بوست إعلاني للسوشيال ميديا", en: "Advertising Post Design for Social Media" },
    description: { 
      ar: "أعلن بأسلوب ملفت و مقنع — مع بصمة تصميم، الإعلان له طابع مختلف\nنصمم لك بوست إعلاني يجذب الانتباه ويحفّز التفاعل، بصياغة بصرية مدروسة ومؤثرة.",
      en: "Advertise with an eye-catching and convincing style — with design signature, advertising has a different character"
    },
    price: { SAR: 75, USD: 20 },
    deliveryTime: { min: 2, max: 4 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "social-media",
    features: { 
      ar: ["تصميم إعلان احترافي بصيغة جذابة", "يجذب الانتباه ويحفز التفاعل", "بصياغة بصرية مدروسة ومؤثرة"],
      en: ["Professional advertising design in attractive format", "Attracts attention and encourages interaction", "With thoughtful and impactful visual formulation"]
    },
    slug: "advertising-post-design",
    nonRefundable: true,
    isActive: true,
    order: 2
  },
  {
    title: { ar: "تصميم كاروسيل (5–6 بوستات)", en: "Carousel Design (5-6 Posts)" },
    description: { 
      ar: "سرد بصري متسلسل يروي قصة مشروعك — كل شريحة تحكي.\nنصمم لك سلسلة بوستات مترابطة بأسلوب كاروسيل، مثالية للعرض التفاعلي على إنستغرام أو لينكدإن.",
      en: "Sequential visual narrative that tells your project's story — each slide tells."
    },
    price: { SAR: 112.5, USD: 30 },
    deliveryTime: { min: 3, max: 7 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "social-media",
    features: { 
      ar: ["تصميم 5–6 بوستات مترابطة", "مثالية للعرض التفاعلي", "سرد بصري متسلسل"],
      en: ["Design of 5-6 interconnected posts", "Ideal for interactive display", "Sequential visual narrative"]
    },
    slug: "carousel-design",
    nonRefundable: true,
    isActive: true,
    order: 3
  },
  {
    title: { ar: "بكج 10 تصاميم سوشيال ميديا", en: "10 Social Media Designs Package" },
    description: { 
      ar: "حزمة متكاملة لحضور رقمي قوي — الجودة والوفرة في بصمة واحدة.\nاحصل على 10 تصاميم متنوعة ومخصصة لحساباتك، بأسلوب احترافي يعكس هوية مشروعك.",
      en: "Complete package for strong digital presence — quality and abundance in one signature."
    },
    price: { SAR: 525, USD: 140 },
    deliveryTime: { min: 4, max: 8 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "social-media",
    features: { 
      ar: ["يشمل 10 تصاميم متنوعة حسب الطلب", "أسلوب احترافي", "يعكس هوية مشروعك"],
      en: ["Includes 10 diverse designs as requested", "Professional style", "Reflects your project identity"]
    },
    slug: "social-media-package-10",
    nonRefundable: true,
    isActive: true,
    order: 4
  },
  {
    title: { ar: "تصميم واجهة حساب LinkedIn (بنر + لوقو)", en: "LinkedIn Account Interface Design (Banner + Logo)" },
    description: { 
      ar: "خلّي حضورك المهني يترك بصمة واضحة.\nنصمم لك بنر احترافي ولوقو بسيط يعكس هويتك المهنية ويمنح حسابك مظهرًا احترافيًا وجذابًا.",
      en: "Make your professional presence leave a clear mark."
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ["PNG", "PDF", "ملف مضغوط"],
    revisions: 2,
    category: "linkedin",
    features: { 
      ar: ["بنر احترافي", "لوقو بسيط", "يعكس هويتك المهنية"],
      en: ["Professional banner", "Simple logo", "Reflects your professional identity"]
    },
    slug: "linkedin-interface-design",
    nonRefundable: true,
    isActive: true,
    order: 5
  },
  {
    title: { ar: "تنفيذ حساب LinkedIn بالكامل", en: "Complete LinkedIn Account Setup" },
    description: { 
      ar: "بناء احترافي لحسابك من الصفر — نرتب لك كل شيء.\nنقوم بإنشاء حساب LinkedIn احترافي يشمل التصميم والمحتوى، ليعكس خبراتك ويجذب الفرص المناسبة.",
      en: "Professional building of your account from scratch — we arrange everything for you."
    },
    price: { SAR: 131.25, USD: 35, originalSAR: 93.75, originalUSD: 25 },
    deliveryTime: { min: 1, max: 6 },
    deliveryFormats: ["تسليم مباشر على الحساب"],
    revisions: 2,
    category: "linkedin",
    features: { 
      ar: ["تصميم البنر واللوقو", "كتابة نبذة وكلمات مفتاحية", "تعديل رابط URL", "ترتيب وإضافة الأقسام"],
      en: ["Banner and logo design", "Writing bio and keywords", "URL link editing", "Organizing and adding sections"]
    },
    slug: "complete-linkedin-setup",
    nonRefundable: true,
    isActive: true,
    order: 6
  }
];

async function updateServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing services
    await Service.deleteMany({});

    // Insert new services
    for (const serviceData of servicesData) {
      const service = new Service(serviceData);
      await service.save();
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

updateServices();
