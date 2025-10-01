import mongoose from 'mongoose';
import HomepageSection from '../src/models/HomepageSection.js';
import dotenv from 'dotenv';

dotenv.config();

const initializeHomepageData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/basma_design');

    // Check if data already exists
    const existingData = await HomepageSection.find();
    if (existingData.length > 0) {
      return;
    }

    // Initialize real homepage sections from actual website content
    const realSections = [
      {
        sectionType: 'whatMakesUsDifferent',
        isActive: true,
        order: 1,
        whatMakesUsDifferent: {
          title: {
            ar: 'ما يميزنا',
            en: 'What Makes Us Different'
          },
          subtitle: {
            ar: 'نقدم خدمات تصميم استثنائية تجمع بين الإبداع والاحترافية',
            en: 'We provide exceptional design services that combine creativity and professionalism'
          },
          items: [
            {
              title: { ar: 'تصميم يحمل بصمتك', en: 'Design with Your Signature' },
              description: { ar: 'كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين', en: 'Every design is crafted to reflect your unique identity and set you apart from competitors' },
              iconName: 'palette',
              iconColor: 'text-pink-600',
              bgGradient: 'from-pink-100 to-rose-100'
            },
            {
              title: { ar: 'شفافية و إحترافية', en: 'Transparency & Professionalism' },
              description: { ar: 'سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة', en: 'Our policies are clear and our dealings are based on trust and absolute professionalism' },
              iconName: 'shield',
              iconColor: 'text-emerald-600',
              bgGradient: 'from-emerald-100 to-teal-100'
            },
            {
              title: { ar: 'تسليم مدروس', en: 'Thoughtful Delivery' },
              description: { ar: 'نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع', en: 'We stick to deadlines and ensure high quality in every project' },
              iconName: 'clock',
              iconColor: 'text-amber-600',
              bgGradient: 'from-amber-100 to-yellow-100'
            },
            {
              title: { ar: 'خدمة تُصمم لتُحدث فرقًا', en: 'Service Designed to Make a Difference' },
              description: { ar: 'تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس', en: 'An integrated creative experience that transforms your vision into tangible reality' },
              iconName: 'sparkles',
              iconColor: 'text-indigo-600',
              bgGradient: 'from-indigo-100 to-violet-100'
            }
          ]
        }
      },
      {
        sectionType: 'counters',
        isActive: true,
        order: 2,
        counters: {
          items: [
            {
              label: { ar: 'مشاريع مكتملة', en: 'Completed Projects' },
              value: 468,
              suffix: { ar: '+', en: '+' },
              iconName: 'briefcase',
              iconColor: 'text-emerald-600',
              chipBg: 'from-emerald-100 to-teal-100'
            },
            {
              label: { ar: 'عملاء راضون', en: 'Satisfied Clients' },
              value: 258,
              suffix: { ar: '+', en: '+' },
              iconName: 'users',
              iconColor: 'text-indigo-600',
              chipBg: 'from-indigo-100 to-blue-100'
            },
            {
              label: { ar: 'سنوات خبرة', en: 'Years of Experience' },
              value: 6,
              suffix: { ar: '+', en: '+' },
              iconName: 'timer',
              iconColor: 'text-amber-600',
              chipBg: 'from-amber-100 to-yellow-100'
            },
            {
              label: { ar: 'تقييم العملاء', en: 'Client Rating' },
              value: 4.9,
              suffix: { ar: '/5', en: '/5' },
              iconName: 'star',
              iconColor: 'text-rose-600',
              chipBg: 'from-rose-100 to-pink-100'
            }
          ]
        }
      },
      {
        sectionType: 'closingCTA',
        isActive: true,
        order: 3,
        closingCTA: {
          title: {
            ar: 'اكتشف بصمتك الرقمية مع بصمة تصميم',
            en: 'Discover Your Digital Fingerprint with Basma Design'
          },
          subtitle: {
            ar: 'خدماتنا تبدأ من الفكرة، وتنتهي بتأثير لا يُنسى',
            en: 'Our services start with an idea and end with an unforgettable impact'
          },
          description: {
            ar: 'ابدأ رحلتك معنا اليوم واحصل على تصميم يعكس هويتك ويحقق أهدافك',
            en: 'Start your journey with us today and get a design that reflects your identity and achieves your goals'
          },
          primaryButton: {
            text: { ar: 'ابدأ مشروعك', en: 'Start Your Project' },
            href: '/services'
          },
          secondaryButton: {
            text: { ar: 'تواصل معنا', en: 'Contact Us' },
            href: '/contact'
          }
        }
      }
    ];

    // Insert real sections
    const insertedSections = await HomepageSection.insertMany(realSections);
    
    // Display created sections
    insertedSections.forEach(section => {
      console.log(`- ${section.sectionType} (${section.isActive ? 'Active' : 'Inactive'})`);
    });

  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
};

// Run the initialization
initializeHomepageData();
