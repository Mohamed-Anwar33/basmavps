import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const curvedBannersData = [
  {
    title: {
      ar: 'مرحباً بك في بصمة تصميم',
      en: 'Welcome to Basmat Design'
    },
    subtitle: {
      ar: 'نحن نصنع التميز في كل تصميم',
      en: 'We create excellence in every design'
    },
    description: {
      ar: 'اكتشف عالماً من الإبداع والتميز مع خدماتنا المتنوعة في التصميم والتسويق الرقمي',
      en: 'Discover a world of creativity and excellence with our diverse design and digital marketing services'
    },
    type: 'curved',
    position: 'top',
    pageSlug: 'home',
    gradientColors: {
      start: '#8453F7',
      middle: '#4b2e83',
      end: '#7a4db3'
    },
    curveIntensity: 'medium',
    backgroundColor: '#8453F7',
    textColor: '#ffffff',
    ctaButton: {
      text: {
        ar: 'اكتشف خدماتنا',
        en: 'Discover Our Services'
      },
      link: '/services',
      style: 'primary'
    },
    features: [
      {
        text: {
          ar: 'تصميم احترافي',
          en: 'Professional Design'
        }
      },
      {
        text: {
          ar: 'جودة عالية',
          en: 'High Quality'
        }
      },
      {
        text: {
          ar: 'تسليم سريع',
          en: 'Fast Delivery'
        }
      }
    ],
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: 'خدمات تصميم متكاملة',
      en: 'Complete Design Services'
    },
    subtitle: {
      ar: 'من الشعار إلى الهوية البصرية الكاملة',
      en: 'From logo to complete visual identity'
    },
    description: {
      ar: 'نقدم حلول تصميم شاملة تشمل تصميم الشعارات، الهوية البصرية، مواقع الويب، والمطبوعات',
      en: 'We provide comprehensive design solutions including logos, visual identity, websites, and print materials'
    },
    type: 'curved',
    position: 'middle',
    pageSlug: 'services',
    gradientColors: {
      start: '#7a4db3',
      middle: '#8453F7',
      end: '#4b2e83'
    },
    curveIntensity: 'strong',
    backgroundColor: '#7a4db3',
    textColor: '#ffffff',
    ctaButton: {
      text: {
        ar: 'طلب استشارة مجانية',
        en: 'Request Free Consultation'
      },
      link: '/contact',
      style: 'primary'
    },
    secondaryCtaButton: {
      text: {
        ar: 'عرض الأعمال',
        en: 'View Portfolio'
      },
      link: '/portfolio',
      style: 'secondary'
    },
    features: [
      {
        text: {
          ar: 'تصميم شعارات',
          en: 'Logo Design'
        }
      },
      {
        text: {
          ar: 'هوية بصرية',
          en: 'Visual Identity'
        }
      },
      {
        text: {
          ar: 'تصميم مواقع',
          en: 'Web Design'
        }
      },
      {
        text: {
          ar: 'مطبوعات',
          en: 'Print Design'
        }
      }
    ],
    isActive: true,
    order: 1
  },
  {
    title: {
      ar: 'ابدأ مشروعك معنا اليوم',
      en: 'Start Your Project With Us Today'
    },
    subtitle: {
      ar: 'فريق محترف وخبرة واسعة في خدمتك',
      en: 'Professional team and extensive experience at your service'
    },
    description: {
      ar: 'لا تتردد في التواصل معنا للحصول على استشارة مجانية وبدء رحلتك نحو التميز',
      en: 'Do not hesitate to contact us for a free consultation and start your journey towards excellence'
    },
    type: 'curved',
    position: 'bottom',
    pageSlug: 'home',
    gradientColors: {
      start: '#4b2e83',
      middle: '#7a4db3',
      end: '#8453F7'
    },
    curveIntensity: 'light',
    backgroundColor: '#4b2e83',
    textColor: '#ffffff',
    ctaButton: {
      text: {
        ar: 'تواصل معنا الآن',
        en: 'Contact Us Now'
      },
      link: '/contact',
      style: 'primary'
    },
    features: [
      {
        text: {
          ar: 'استشارة مجانية',
          en: 'Free Consultation'
        }
      },
      {
        text: {
          ar: 'دعم 24/7',
          en: '24/7 Support'
        }
      },
      {
        text: {
          ar: 'ضمان الجودة',
          en: 'Quality Guarantee'
        }
      }
    ],
    isActive: true,
    order: 2
  },
  {
    title: {
      ar: 'عن بصمة تصميم',
      en: 'About Basmat Design'
    },
    subtitle: {
      ar: 'رؤيتنا هي أن نكون الخيار الأول للتصميم الإبداعي',
      en: 'Our vision is to be the first choice for creative design'
    },
    description: {
      ar: 'نحن فريق من المصممين المحترفين نسعى لتقديم أفضل الحلول التصميمية التي تلبي احتياجات عملائنا وتحقق أهدافهم',
      en: 'We are a team of professional designers striving to provide the best design solutions that meet our clients needs and achieve their goals'
    },
    type: 'curved',
    position: 'top',
    pageSlug: 'about',
    gradientColors: {
      start: '#8453F7',
      middle: '#7a4db3',
      end: '#4b2e83'
    },
    curveIntensity: 'medium',
    backgroundColor: '#8453F7',
    textColor: '#ffffff',
    ctaButton: {
      text: {
        ar: 'تعرف على فريقنا',
        en: 'Meet Our Team'
      },
      link: '/about#team',
      style: 'primary'
    },
    features: [
      {
        text: {
          ar: 'خبرة 5+ سنوات',
          en: '5+ Years Experience'
        }
      },
      {
        text: {
          ar: '500+ مشروع',
          en: '500+ Projects'
        }
      },
      {
        text: {
          ar: 'عملاء راضون',
          en: 'Satisfied Clients'
        }
      }
    ],
    isActive: true,
    order: 1
  }
];

async function addCurvedBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');

    // Clear existing curved banners
    await Banner.deleteMany({ type: 'curved' });

    // Add new curved banners
    const createdBanners = await Banner.insertMany(curvedBannersData);
    
    createdBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title.ar} (${banner.pageSlug}/${banner.position})`);
    });


  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
addCurvedBanners();
