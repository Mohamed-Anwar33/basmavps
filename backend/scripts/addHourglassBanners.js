const mongoose = require('mongoose');
const Banner = require('../src/models/Banner');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basmat-design');
  } catch (error) {
    process.exit(1);
  }
};

const hourglassBanners = [
  {
    type: 'curved',
    position: 'top',
    pageSlug: 'home',
    content: 'بصمة تصميم - إبداع بلا حدود',
    subtitle: 'نحول أفكارك إلى واقع بصري مذهل',
    description: 'متخصصون في تصميم الهوية البصرية والمحتوى الرقمي مع فريق من الخبراء المبدعين في المملكة العربية السعودية',
    isActive: true,
    ctaButton: {
      text: 'اكتشف خدماتنا',
      link: '/services',
      style: 'primary'
    },
    gradientColors: {
      start: '#2D1B69',
      middle: '#5B21B6', 
      end: '#A855F7'
    },
    curveDepth: 60,
    textColor: '#ffffff',
    order: 1
  },
  {
    type: 'curved',
    position: 'bottom',
    pageSlug: 'home',
    content: 'جاهز لبدء مشروعك؟',
    subtitle: 'دعنا نساعدك في تحقيق رؤيتك',
    description: 'تواصل معنا اليوم واحصل على استشارة مجانية لمشروعك القادم',
    isActive: true,
    ctaButton: {
      text: 'تواصل معنا',
      link: '/contact',
      style: 'primary'
    },
    gradientColors: {
      start: '#1E1B4B',
      middle: '#4C1D95',
      end: '#7C3AED'
    },
    curveDepth: 40,
    textColor: '#ffffff',
    order: 2
  },
  {
    type: 'curved',
    position: 'top',
    pageSlug: 'about',
    content: 'من نحن - بصمة تصميم',
    subtitle: 'فريق من المبدعين والخبراء',
    description: 'شركة سعودية رائدة في مجال التصميم والإبداع الرقمي، نقدم حلول تصميم متكاملة تلبي احتياجات عملائنا',
    isActive: true,
    ctaButton: {
      text: 'تعرف على فريقنا',
      link: '#team',
      style: 'secondary'
    },
    gradientColors: {
      start: '#312E81',
      middle: '#6366F1',
      end: '#8B5CF6'
    },
    curveDepth: 60,
    textColor: '#ffffff',
    order: 1
  },
  {
    type: 'curved',
    position: 'middle',
    pageSlug: 'services',
    content: 'خدماتنا المتميزة',
    subtitle: 'حلول تصميم شاملة ومبتكرة',
    description: 'من تصميم الهوية البصرية إلى المحتوى الرقمي، نقدم خدمات تصميم عالية الجودة تناسب جميع احتياجاتك',
    isActive: true,
    ctaButton: {
      text: 'استكشف الخدمات',
      link: '#services-list',
      style: 'outline'
    },
    gradientColors: {
      start: '#1E3A8A',
      middle: '#3B82F6',
      end: '#60A5FA'
    },
    curveDepth: 50,
    textColor: '#ffffff',
    order: 1
  },
  {
    type: 'curved',
    position: 'top',
    pageSlug: 'portfolio',
    content: 'معرض أعمالنا',
    subtitle: 'مشاريع ملهمة وإبداعات متميزة',
    description: 'اكتشف مجموعة من أفضل أعمالنا التي تعكس خبرتنا وإبداعنا في مجال التصميم',
    isActive: true,
    ctaButton: {
      text: 'شاهد المزيد',
      link: '#portfolio-gallery',
      style: 'primary'
    },
    gradientColors: {
      start: '#581C87',
      middle: '#7C2D92',
      end: '#A855F7'
    },
    curveDepth: 55,
    textColor: '#ffffff',
    order: 1
  }
];

const addHourglassBanners = async () => {
  try {
    await connectDB();
    
    
    // Delete existing curved banners to avoid duplicates
    await Banner.deleteMany({ type: 'curved' });
    
    // Insert new hourglass banners
    const insertedBanners = await Banner.insertMany(hourglassBanners);
    
    // Display added banners
    insertedBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.content} - ${banner.position} (${banner.pageSlug})`);
    });
    
  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
addHourglassBanners();
