import mongoose from 'mongoose';
import Service from '../src/models/Service.js';

const services = [
  {
    title: { ar: 'تصميم بوست سوشيال ميديا', en: 'Social Media Post Design' },
    slug: 'social-media-post-design',
    description: { 
      ar: 'محتوى بصري يوقف التمرير — لأن البصمة تبدأ من أول نظرة. في عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل. نصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية', 
      en: 'Visual content that stops scrolling — because your mark starts from the first glance. In a world crowded with content, your design must stop the follower, catch their attention, and make them interact. We design professional posts that reflect your project identity, with an attractive visual style that achieves your marketing goals' 
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
      ar: "أعلن بأسلوب ملفت و مقنع — مع بصمة تصميم، الإعلان له طابع مختلف. نصمم لك بوست إعلاني يجذب الانتباه ويحفّز التفاعل، بصياغة بصرية مدروسة ومؤثرة.",
      en: "Advertise with an attractive and convincing style — with design signature, advertising has a different character."
    },
    price: { SAR: 75, USD: 20 },
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    category: "design",
    features: {
      ar: ["تصميم إعلان احترافي بصيغة جذابة", "تعديلين مجانيين", "تسليم بصيغ متعددة"],
      en: ["Professional ad design in attractive format", "2 free revisions", "Multiple format delivery"]
    },
    deliveryFormats: ["PNG", "PDF", "ZIP"],
    nonRefundable: true,
    isActive: true
  },
  {
    title: { ar: "تصميم كاروسيل (5–6 بوستات)", en: "Carousel Design (5-6 Posts)" },
    slug: "carousel-design-5-6-posts",
    description: { 
      ar: "سرد بصري متسلسل يروي قصة مشروعك — كل شريحة تحكي. نصمم لك سلسلة بوستات مترابطة بأسلوب كاروسيل، مثالية للعرض التفاعلي على إنستغرام أو لينكدإن.",
      en: "Sequential visual storytelling that tells your project's story — each slide tells a story."
    },
    price: { SAR: 112.5, USD: 30 },
    deliveryTime: { min: 3, max: 7 },
    revisions: 2,
    category: "design",
    features: {
      ar: ["تصميم 5–6 بوستات مترابطة", "تعديلين مجانيين", "تسليم بصيغ متعددة"],
      en: ["5-6 interconnected posts design", "2 free revisions", "Multiple format delivery"]
    },
    deliveryFormats: ["PNG", "PDF", "ZIP"],
    nonRefundable: true,
    isActive: true
  },
  {
    title: { ar: "بكج 10 تصاميم سوشيال ميديا", en: "10 Social Media Designs Package" },
    slug: "10-social-media-designs-package",
    description: { 
      ar: "حزمة متكاملة لحضور رقمي قوي — الجودة والوفرة في بصمة واحدة. احصل على 10 تصاميم متنوعة ومخصصة لحساباتك، بأسلوب احترافي يعكس هوية مشروعك.",
      en: "Complete package for strong digital presence — quality and abundance in one signature."
    },
    price: { SAR: 525, USD: 140 },
    deliveryTime: { min: 4, max: 8 },
    revisions: 2,
    category: "design",
    features: {
      ar: ["10 تصاميم متنوعة حسب الطلب", "تعديلين مجانيين", "تسليم بصيغ متعددة"],
      en: ["10 varied designs as requested", "2 free revisions", "Multiple format delivery"]
    },
    deliveryFormats: ["PNG", "PDF", "ZIP"],
    nonRefundable: true,
    isActive: true
  },
  {
    title: { ar: "تصميم واجهة حساب LinkedIn (بنر + لوقو)", en: "LinkedIn Profile Design (Banner + Logo)" },
    slug: "linkedin-profile-design-banner-logo",
    description: { 
      ar: "خلّي حضورك المهني يترك بصمة واضحة. نصمم لك بنر احترافي ولوقو بسيط يعكس هويتك المهنية ويمنح حسابك مظهرًا احترافيًا وجذابًا.",
      en: "Make your professional presence leave a clear mark."
    },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 1, max: 4 },
    revisions: 2,
    category: "design",
    features: {
      ar: ["تصميم بنر احترافي", "تصميم لوقو بسيط", "تعديلين مجانيين"],
      en: ["Professional banner design", "Simple logo design", "2 free revisions"]
    },
    deliveryFormats: ["PNG", "PDF", "ZIP"],
    nonRefundable: true,
    isActive: true
  }
];

const addRealServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');

    const Service = mongoose.model('Service', new mongoose.Schema({}, {strict: false}));

    // Clear existing services first
    await Service.deleteMany({});

    // Add new services
    for (const service of realServices) {
      await Service.create(service);
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

addRealServices();
