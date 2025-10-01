import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

const servicesData = [
  {
    title: {
      ar: "تصميم بوست سوشيال ميديا",
      en: "Social Media Post Design"
    },
    slug: "social-media-post-design",
    description: {
      ar: "محتوى بصري يوقف التمرير — لأن البصمة تبدأ من أول نظرة.\nفي عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل.\nنصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية\n• يشمل تصميم بوست واحد متوافق مع الهوية\n• مدة التنفيذ: 1-4 ايام عمل\n• التسليم: حسب الطريقة الانسب لك png, pdf, ملف مضغوط\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل",
      en: "Visual content that stops scrolling — because the impression starts from the first glance.\nIn a world crowded with content, your design must stop the follower, catch their attention, and make them interact.\nWe design professional posts that reflect your project identity, with an attractive visual style that achieves your marketing goals\n• Includes designing one post compatible with identity\n• Execution time: 1-4 working days\n• Delivery: According to the most suitable method for you png, pdf, compressed file\nEvery service we provide carries our creative signature, and is designed specifically to suit you\n\nThe service includes only two free modifications\nAny additional modification is calculated as an independent service and is priced according to the type of modification required\n\nImportant note: The service is non-cancellable or refundable after payment is completed\nAfter payment, you are transferred directly to WhatsApp to send details"
    },
    price: {
      SAR: 37.5,
      USD: 10
    },
    originalPrice: {
      SAR: 56.25,
      USD: 15
    },
    durationDays: 4,
    category: "social-media",
    features: {
      ar: ["تصميم بوست واحد متوافق مع الهوية", "مدة التنفيذ 1-4 أيام", "تعديلين مجانيين", "تسليم بصيغ متعددة"],
      en: ["One post design compatible with identity", "1-4 days execution time", "Two free revisions", "Multiple format delivery"]
    },
    deliveryLinks: [],
    isActive: true,
    isFeatured: true,
    order: 1
  },
  {
    title: {
      ar: "تصميم بوست إعلاني للسوشيال ميديا",
      en: "Social Media Advertisement Post Design"
    },
    slug: "social-media-ad-post-design",
    description: {
      ar: "أعلن بأسلوب ملفت و مقنع — مع بصمة تصميم، الإعلان له طابع مختلف\nنصمم لك بوست إعلاني يجذب الانتباه ويحفّز التفاعل، بصياغة بصرية مدروسة ومؤثرة.\n• تصميم إعلان احترافي بصيغة جذابة\n• مدة التنفيذ: 2 - 4 ايام عمل\n• التسليم: حسب الطريقة الانسب لك png, pdf, ملف مضغوط\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل",
      en: "Advertise in an eye-catching and convincing style — with design signature, advertising has a different character\nWe design an advertising post that attracts attention and encourages interaction, with thoughtful and effective visual formulation.\n• Professional advertisement design in attractive format\n• Execution time: 2 - 4 working days\n• Delivery: According to the most suitable method for you png, pdf, compressed file\nEvery service we provide carries our creative signature, and is designed specifically to suit you\n\nThe service includes only two free modifications\nAny additional modification is calculated as an independent service and is priced according to the type of modification required\n\nImportant note: The service is non-cancellable or refundable after payment is completed\nAfter payment, you are transferred directly to WhatsApp to send details"
    },
    price: {
      SAR: 75,
      USD: 20
    },
    durationDays: 4,
    category: "social-media",
    features: {
      ar: ["تصميم إعلان احترافي", "صياغة بصرية مدروسة", "تعديلين مجانيين", "تسليم بصيغ متعددة"],
      en: ["Professional advertisement design", "Thoughtful visual formulation", "Two free revisions", "Multiple format delivery"]
    },
    deliveryLinks: [],
    isActive: true,
    isFeatured: false,
    order: 2
  }
];

async function updateServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing services
    await Service.deleteMany({});

    // Insert new services
    const result = await Service.insertMany(servicesData);

  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

updateServices();
