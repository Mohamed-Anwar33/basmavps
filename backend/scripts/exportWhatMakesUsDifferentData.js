import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import the PageContent model
import PageContent from '../src/models/PageContent.js';

const exportWhatMakesUsDifferentData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Define the what-makes-us-different section data
    const whatMakesUsDifferentData = {
      title: {
        ar: "لماذا بصمة تصميم؟",
        en: "Why Basmat Design?"
      },
      subtitle: {
        ar: "لأننا نصمم ليبقى الأثر، ونكتب لنحرك الشعور، ونبني حضورًا رقمياً يعبر عنك.",
        en: "Because we design to leave an impact, write to move emotions, and build a digital presence that expresses you."
      },
      items: [
        {
          title: {
            ar: "تصميم يحمل بصمتك",
            en: "Design that carries your signature"
          },
          description: {
            ar: "كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين",
            en: "Every design is crafted to reflect your unique identity and distinguish you from competitors"
          },
          iconName: "palette",
          iconColor: "text-pink-600",
          bgGradient: "from-pink-100 to-rose-100"
        },
        {
          title: {
            ar: "شفافية و إحترافية",
            en: "Transparency & Professionalism"
          },
          description: {
            ar: "سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة",
            en: "Our policies are clear and our dealings are built on trust and absolute professionalism"
          },
          iconName: "shield",
          iconColor: "text-emerald-600",
          bgGradient: "from-emerald-100 to-teal-100"
        },
        {
          title: {
            ar: "تسليم مدروس",
            en: "Thoughtful Delivery"
          },
          description: {
            ar: "نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع",
            en: "We commit to deadlines and guarantee high quality in every project"
          },
          iconName: "clock",
          iconColor: "text-amber-600",
          bgGradient: "from-amber-100 to-yellow-100"
        },
        {
          title: {
            ar: "خدمة تُصمم لتُحدث فرقًا",
            en: "Service designed to make a difference"
          },
          description: {
            ar: "تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس",
            en: "A comprehensive creative experience that transforms your vision into tangible reality"
          },
          iconName: "sparkles",
          iconColor: "text-indigo-600",
          bgGradient: "from-indigo-100 to-violet-100"
        }
      ]
    };

    // Check if what-makes-us-different section already exists
    let existingSection = await PageContent.findOne({ pageType: 'what-makes-us-different' });

    if (existingSection) {
      existingSection.content.legacy = whatMakesUsDifferentData;
      existingSection.metadata = {
        ar: {
          title: whatMakesUsDifferentData.title.ar,
          description: whatMakesUsDifferentData.subtitle.ar
        },
        en: {
          title: whatMakesUsDifferentData.title.en,
          description: whatMakesUsDifferentData.subtitle.en
        }
      };
      existingSection.updatedAt = new Date();
      await existingSection.save();
    } else {
      const newSection = new PageContent({
        pageType: 'what-makes-us-different',
        content: {
          legacy: whatMakesUsDifferentData
        },
        metadata: {
          ar: {
            title: whatMakesUsDifferentData.title.ar,
            description: whatMakesUsDifferentData.subtitle.ar
          },
          en: {
            title: whatMakesUsDifferentData.title.en,
            description: whatMakesUsDifferentData.subtitle.en
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newSection.save();
    }

    console.log('- Title (AR):', whatMakesUsDifferentData.title.ar);
    console.log('- Title (EN):', whatMakesUsDifferentData.title.en);
    console.log('- Subtitle (AR):', whatMakesUsDifferentData.subtitle.ar);
    
    whatMakesUsDifferentData.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title.ar} (${item.iconName})`);
    });

  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

exportWhatMakesUsDifferentData();
