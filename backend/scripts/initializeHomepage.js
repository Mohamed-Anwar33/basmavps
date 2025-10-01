import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HomepageSection from '../src/models/HomepageSection.js';

dotenv.config();

const initializeHomepageSections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    
    // Check if sections already exist
    const existingSections = await HomepageSection.find({});
    
    if (existingSections.length > 0) {
      process.exit(0);
    }
    
    // Create default sections
    const defaultSections = [
      {
        sectionType: 'whatMakesUsDifferent',
        order: 1,
        isActive: true,
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
              title: { ar: 'تصميم يحمل بصمتك', en: 'Design That Carries Your Mark' },
              description: { ar: 'كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين', en: 'Every design is crafted to reflect your unique identity and distinguish you from competitors' },
              iconName: 'palette',
              iconColor: 'text-pink-600',
              bgGradient: 'from-pink-100 to-rose-100',
              order: 1
            },
            {
              title: { ar: 'شفافية و احترافية', en: 'Transparency & Professionalism' },
              description: { ar: 'سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة', en: 'Our policies are clear and our dealings are built on trust and absolute professionalism' },
              iconName: 'shield',
              iconColor: 'text-emerald-600',
              bgGradient: 'from-emerald-100 to-teal-100',
              order: 2
            },
            {
              title: { ar: 'تسليم مدروس', en: 'Thoughtful Delivery' },
              description: { ar: 'نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع', en: 'We commit to deadlines and guarantee high quality in every project' },
              iconName: 'clock',
              iconColor: 'text-amber-600',
              bgGradient: 'from-amber-100 to-yellow-100',
              order: 3
            },
            {
              title: { ar: 'خدمة تُصمم لتُحدث فرقًا', en: 'Service Designed to Make a Difference' },
              description: { ar: 'تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس', en: 'A comprehensive creative experience that transforms your vision into tangible reality' },
              iconName: 'sparkles',
              iconColor: 'text-indigo-600',
              bgGradient: 'from-indigo-100 to-violet-100',
              order: 4
            }
          ]
        }
      },
      {
        sectionType: 'counters',
        order: 2,
        isActive: true,
        counters: {
          title: {
            ar: 'أرقامنا',
            en: 'Our Numbers'
          },
          subtitle: {
            ar: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل',
            en: 'Our numbers speak about our commitment, creativity, and partnership with every client'
          },
          items: [
            {
              label: { ar: 'مشاريع مكتملة', en: 'Completed Projects' },
              value: 468,
              suffix: { ar: '+', en: '+' },
              iconName: 'briefcase',
              iconColor: 'text-emerald-600',
              chipBg: 'from-emerald-100 to-teal-100',
              order: 1
            },
            {
              label: { ar: 'عملاء راضون', en: 'Satisfied Clients' },
              value: 258,
              suffix: { ar: '+', en: '+' },
              iconName: 'users',
              iconColor: 'text-indigo-600',
              chipBg: 'from-indigo-100 to-blue-100',
              order: 2
            },
            {
              label: { ar: 'سنوات خبرة', en: 'Years of Experience' },
              value: 6,
              suffix: { ar: '+', en: '+' },
              iconName: 'timer',
              iconColor: 'text-amber-600',
              chipBg: 'from-amber-100 to-yellow-100',
              order: 3
            },
            {
              label: { ar: 'تقييم العملاء', en: 'Client Rating' },
              value: 4.9,
              suffix: { ar: '/5', en: '/5' },
              iconName: 'star',
              iconColor: 'text-rose-600',
              chipBg: 'from-rose-100 to-pink-100',
              order: 4
            }
          ]
        }
      },
      {
        sectionType: 'closingCTA',
        order: 3,
        isActive: true,
        closingCTA: {
          title: {
            ar: 'ابدأ مشروعك معنا',
            en: 'Start Your Project With Us'
          },
          subtitle: {
            ar: 'حول فكرتك إلى واقع مع فريق بصمة تصميم المحترف',
            en: 'Turn your idea into reality with Basma Design professional team'
          },
          description: {
            ar: 'نحن هنا لنساعدك في تحقيق أهدافك التجارية من خلال حلول تصميم مبتكرة ومتميزة',
            en: 'We are here to help you achieve your business goals through innovative and distinctive design solutions'
          },
          primaryButton: {
            text: { ar: 'ابدأ مشروعك', en: 'Start Your Project' },
            link: '/services'
          },
          secondaryButton: {
            text: { ar: 'تواصل معنا', en: 'Contact Us' },
            link: '/contact'
          },
          backgroundGradient: 'from-primary/90 to-accent/90'
        }
      }
    ];
    
    const createdSections = await HomepageSection.insertMany(defaultSections);
    
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

initializeHomepageSections();
