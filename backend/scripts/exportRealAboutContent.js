import mongoose from 'mongoose';
import Setting from '../src/models/Setting.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Real content from the actual About page
const realAboutContent = {
  // SEO Metadata
  seoTitle: "من نحن | بصمة تصميم - فريق التصميم والإبداع الرقمي",
  seoDescription: "تعرف على فريق بصمة تصميم وقيمنا ورؤيتنا في عالم التصميم والإبداع. شركة سعودية متخصصة في الهوية البصرية والمحتوى الرقمي مع فريق من الخبراء المبدعين.",
  seoKeywords: ["فريق بصمة تصميم", "شركة تصميم سعودية", "من نحن", "فريق إبداعي", "خبراء تصميم", "رؤية الشركة", "قيم التصميم"],
  seoOgImage: "/about-og-image.jpg",

  // Hero Section (Default Content)
  heroTitle: "نحن لا ننافس على الشكل، بل على الأثر",
  heroSubtitle: "في بصمة تصميم، نؤمن أن التصميم الحقيقي لا يقتصر على الجمال البصري، بل يمتد ليشمل القدرة على ترك أثر إيجابي ودائم في نفوس الجمهور.",

  // Mission Section (Default Content)
  missionTitle: "رسالتنا",
  missionDesc: "نسعى لأن نكون الشريك الإبداعي الموثوق لكل من يريد أن يترك بصمة مميزة في عالمه الرقمي. نحن نؤمن بقوة التصميم في تغيير الطريقة التي ينظر بها العالم لعلامتك التجارية.",
  missionQuote: "كل مشروع نعمل عليه هو فرصة لإبداع قصة بصرية فريدة تحكي عن قيمك وتطلعاتك، وتصل بها إلى قلوب وعقول جمهورك المستهدف.",

  // Mission Features (Static Content in Grid)
  missionFeatures: [
    { icon: "Target", title: "الدقة", subtitle: "في كل التفاصيل", color: "primary" },
    { icon: "Heart", title: "الشغف", subtitle: "بما نقوم به", color: "accent" },
    { icon: "Users", title: "التعاون", subtitle: "مع عملائنا", color: "green-500" },
    { icon: "Award", title: "التميز", subtitle: "في النتائج", color: "yellow-500" }
  ],

  // Team Section (Static Team Members)
  teamTitle: "من وراء الإبداع",
  teamSubtitle: "فريق من المبدعين والمتخصصين الذين يشاركونك شغف التميز والإبداع",
  team: [
    {
      name: "أحمد محمد",
      role: "مؤسس ومدير إبداعي", 
      description: "خبرة أكثر من 8 سنوات في مجال التصميم الجرافيكي والهوية البصرية"
    },
    {
      name: "سارة أحمد",
      role: "مصممة جرافيك",
      description: "متخصصة في تصميم السوشيال ميديا والمحتوى الرقمي الإبداعي"
    },
    {
      name: "محمد علي", 
      role: "كاتب محتوى",
      description: "خبير في كتابة المحتوى التسويقي والإبداعي باللغة العربية"
    }
  ],

  // Process Section (Static Process Steps)
  processTitle: "عمليتنا الإبداعية",
  processSubtitle: "منهجية مدروسة نتبعها مع كل مشروع لضمان الحصول على أفضل النتائج",
  process: [
    {
      icon: "CheckCircle",
      title: "الاستماع",
      description: "نستمع لأحلامك وأهدافك لنفهم رؤيتك بشكل عميق"
    },
    {
      icon: "Target", 
      title: "التصميم",
      description: "نحول أفكارك إلى تصاميم مبدعة تعكس هويتك الفريدة"
    },
    {
      icon: "Eye",
      title: "المراجعة", 
      description: "نعرض عليك النتائج ونتلقى ملاحظاتك للوصول للكمال"
    },
    {
      icon: "Award",
      title: "التسليم",
      description: "نسلمك عملك النهائي بأعلى جودة وفي الوقت المحدد"
    }
  ],

  // PageBanner Content (Static)
  pageBannerTitle: "تصاميم تُحاكي رؤيتك وتُترجمها بصريًا",
  pageBannerSubtitle: "حضور بصري يُعبّر عنك ويُترجم هويتك بأسلوب مميز",
  pageBannerCtaText: "ابدأ مشروعك",
  pageBannerCtaLink: "/contact",
  pageBannerVariant: "about",
  pageBannerFeatures: ["فريق محترف", "إبداع مستمر", "شفافية كاملة"],
  pageBannerSecondaryCtaText: "تواصل معنا",
  pageBannerSecondaryCtaLink: "/contact",

  // Vision Section (Default Content)
  visionTitle: "رؤيتنا للمستقبل",
  visionBody: "نطمح لأن نكون الاسم الأول الذي يتبادر للذهن عندما يفكر أحدهم في التصميم والإبداع في المنطقة العربية. نريد أن نساهم في رفع مستوى التصميم العربي ونجعله منافساً عالمياً.\n\nنحلم بعالم يقدر فيه التصميم الجيد، ويفهم تأثيره الحقيقي على نجاح الأعمال والمشاريع. عالم نساهم فيه بجعل كل علامة تجارية لها بصمة مميزة وأثر إيجابي.",

  // Values Section (Default Content)
  valuesTitle: "قيمنا الأساسية",
  valuesSubtitle: "المبادئ التي توجه كل قرار نتخذه وكل عمل نقوم به",
  values: [
    {
      icon: "Heart",
      title: "الأصالة",
      description: "نؤمن بأن كل مشروع فريد ويستحق تصميماً يعكس شخصيته الخاصة"
    },
    {
      icon: "Shield", 
      title: "الشفافية",
      description: "سياساتنا واضحة، أسعارنا محددة، والتزامنا صادق مع كل عميل"
    },
    {
      icon: "Award",
      title: "التميّز", 
      description: "نسعى للوصول لأعلى معايير الجودة في كل تفصيلة من عملنا"
    },
    {
      icon: "Clock",
      title: "الالتزام",
      description: "نحترم وقتك ونلتزم بالمواعيد المتفق عليها دون تأخير"
    }
  ],

  // CTA Section (Default Content)
  ctaTitle: "هل أنت مستعد لترك بصمتك؟",
  ctaDescription: "انضم إلى مئات العملاء الذين وثقوا بنا لتحويل أحلامهم إلى حقيقة بصرية مذهلة",
  ctaPrimaryText: "تواصل معنا",
  ctaPrimaryLink: "/contact", 
  ctaSecondaryText: "تعرف على خدماتنا",
  ctaSecondaryLink: "/services"
};

async function exportRealAboutContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing about settings
    await Setting.deleteMany({ category: 'about' });

    const settingsToInsert = [];

    // Insert all real content as settings
    for (const [key, value] of Object.entries(realAboutContent)) {
      settingsToInsert.push({
        key,
        category: 'about',
        value,
        lang: 'ar',
        isActive: true,
        meta: {
          description: `Real content from about page: ${key}`,
          lastModifiedBy: null,
          version: 1
        }
      });
    }

    // Insert all settings
    await Setting.insertMany(settingsToInsert);

    console.log('- Hero Section (القسم الرئيسي)');
    console.log('- Mission Section + Features (الرسالة + الميزات)');
    console.log('- Team Members (أعضاء الفريق الفعليين)');
    console.log('- Process Steps (خطوات العمل الفعلية)');
    console.log('- PageBanner Content (محتوى البانر الوسطي)');
    console.log('- Vision Section (الرؤية)');
    console.log('- Values Section (القيم الأساسية الفعلية)');
    console.log('- CTA Section (الدعوة للعمل)');

    await mongoose.connection.close();

  } catch (error) {
    process.exit(1);
  }
}

exportRealAboutContent();
