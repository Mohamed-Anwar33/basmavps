import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Blog from '../src/models/Blog.js';
import FAQ from '../src/models/FAQ.js';
import Setting from '../src/models/Setting.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return;
    }

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@basma.com',
        password: await bcrypt.hash('admin123456', 12),
        role: 'superadmin',
        isEmailVerified: true
      },
      {
        name: 'Admin User',
        email: 'moderator@basma.com',
        password: await bcrypt.hash('moderator123', 12),
        role: 'admin',
        isEmailVerified: true
      },
      {
        name: 'Editor User',
        email: 'editor@basma.com',
        password: await bcrypt.hash('editor123', 12),
        role: 'editor',
        isEmailVerified: true
      }
    ];

    await User.insertMany(users);
  } catch (error) {
  }
};

const seedServices = async () => {
  try {
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      return;
    }

    const services = [
      {
        title: {
          ar: 'تصميم الهوية البصرية',
          en: 'Brand Identity Design'
        },
        description: {
          ar: 'نقوم بتصميم هوية بصرية متكاملة لعلامتك التجارية تشمل الشعار والألوان والخطوط',
          en: 'We create comprehensive brand identity including logo, colors, and typography'
        },
        price: {
          ar: 'يبدأ من 500 ريال',
          en: 'Starting from 500 SAR'
        },
        category: 'branding',
        featured: true,
        status: 'active',
        images: ['/images/services/branding-1.jpg'],
        features: [
          { ar: 'تصميم الشعار', en: 'Logo Design' },
          { ar: 'دليل الهوية البصرية', en: 'Brand Guidelines' },
          { ar: 'تطبيقات الهوية', en: 'Brand Applications' }
        ]
      },
      {
        title: {
          ar: 'تصميم المواقع الإلكترونية',
          en: 'Website Design'
        },
        description: {
          ar: 'تصميم وتطوير مواقع إلكترونية احترافية متجاوبة مع جميع الأجهزة',
          en: 'Professional responsive website design and development'
        },
        price: {
          ar: 'يبدأ من 1500 ريال',
          en: 'Starting from 1500 SAR'
        },
        category: 'web-design',
        featured: true,
        status: 'active',
        images: ['/images/services/web-design-1.jpg'],
        features: [
          { ar: 'تصميم متجاوب', en: 'Responsive Design' },
          { ar: 'تحسين محركات البحث', en: 'SEO Optimization' },
          { ar: 'لوحة إدارة', en: 'Admin Panel' }
        ]
      },
      {
        title: {
          ar: 'التسويق الرقمي',
          en: 'Digital Marketing'
        },
        description: {
          ar: 'خدمات التسويق الرقمي الشاملة لزيادة انتشار علامتك التجارية',
          en: 'Comprehensive digital marketing services to boost your brand presence'
        },
        price: {
          ar: 'يبدأ من 800 ريال',
          en: 'Starting from 800 SAR'
        },
        category: 'marketing',
        featured: false,
        status: 'active',
        images: ['/images/services/marketing-1.jpg'],
        features: [
          { ar: 'إدارة وسائل التواصل', en: 'Social Media Management' },
          { ar: 'الإعلانات المدفوعة', en: 'Paid Advertising' },
          { ar: 'تحليل الأداء', en: 'Performance Analytics' }
        ]
      }
    ];

    await Service.insertMany(services);
  } catch (error) {
  }
};

const seedBlogs = async () => {
  try {
    const existingBlogs = await Blog.countDocuments();
    if (existingBlogs > 0) {
      return;
    }

    const admin = await User.findOne({ role: 'superadmin' });
    
    const blogs = [
      {
        title: {
          ar: 'أهمية الهوية البصرية للشركات',
          en: 'The Importance of Brand Identity for Companies'
        },
        content: {
          ar: 'الهوية البصرية هي الوجه الذي تظهر به الشركة للعالم...',
          en: 'Brand identity is the face that a company shows to the world...'
        },
        excerpt: {
          ar: 'تعرف على أهمية الهوية البصرية وكيف تؤثر على نجاح شركتك',
          en: 'Learn about the importance of brand identity and how it affects your company success'
        },
        author: admin._id,
        status: 'published',
        featured: true,
        tags: ['branding', 'design', 'business'],
        readingTime: 5
      },
      {
        title: {
          ar: 'اتجاهات تصميم المواقع في 2024',
          en: 'Web Design Trends in 2024'
        },
        content: {
          ar: 'نستعرض أحدث اتجاهات تصميم المواقع الإلكترونية لعام 2024...',
          en: 'We explore the latest web design trends for 2024...'
        },
        excerpt: {
          ar: 'اكتشف أحدث اتجاهات تصميم المواقع التي ستهيمن على 2024',
          en: 'Discover the latest web design trends that will dominate 2024'
        },
        author: admin._id,
        status: 'published',
        featured: false,
        tags: ['web-design', 'trends', 'ui-ux'],
        readingTime: 7
      }
    ];

    await Blog.insertMany(blogs);
  } catch (error) {
  }
};

const seedFAQs = async () => {
  try {
    const existingFAQs = await FAQ.countDocuments();
    if (existingFAQs > 0) {
      return;
    }

    const faqs = [
      {
        question: {
          ar: 'كم يستغرق تصميم الهوية البصرية؟',
          en: 'How long does brand identity design take?'
        },
        answer: {
          ar: 'عادة ما يستغرق تصميم الهوية البصرية من 2-4 أسابيع حسب تعقيد المشروع',
          en: 'Brand identity design usually takes 2-4 weeks depending on project complexity'
        },
        category: 'general',
        order: 1
      },
      {
        question: {
          ar: 'هل تقدمون خدمة الصيانة للمواقع؟',
          en: 'Do you provide website maintenance services?'
        },
        answer: {
          ar: 'نعم، نقدم خدمات صيانة شاملة للمواقع تشمل التحديثات والنسخ الاحتياطية',
          en: 'Yes, we provide comprehensive website maintenance including updates and backups'
        },
        category: 'services',
        order: 2
      },
      {
        question: {
          ar: 'ما هي طرق الدفع المتاحة؟',
          en: 'What payment methods are available?'
        },
        answer: {
          ar: 'نقبل الدفع عبر البطاقات الائتمانية، التحويل البنكي، وأبل باي',
          en: 'We accept credit cards, bank transfers, and Apple Pay'
        },
        category: 'payment',
        order: 3
      }
    ];

    await FAQ.insertMany(faqs);
  } catch (error) {
  }
};

const seedSettings = async () => {
  try {
    const existingSettings = await Setting.countDocuments();
    if (existingSettings > 0) {
      return;
    }

    const admin = await User.findOne({ role: 'superadmin' });

    const settings = [
      {
        category: 'site',
        key: 'general',
        value: {
          ar: {
            siteName: 'بصمة تصميم',
            tagline: 'نحن نصنع الفرق في عالم التصميم',
            description: 'شركة متخصصة في تصميم الهوية البصرية والمواقع الإلكترونية'
          },
          en: {
            siteName: 'Basmat Design',
            tagline: 'We make a difference in the design world',
            description: 'Specialized company in brand identity and website design'
          }
        },
        updatedBy: admin._id
      },
      {
        category: 'contact',
        key: 'info',
        value: {
          ar: {
            phone: '+966 50 123 4567',
            email: 'info@basma.com',
            address: 'الرياض، المملكة العربية السعودية',
            workingHours: 'الأحد - الخميس: 9:00 ص - 6:00 م'
          },
          en: {
            phone: '+966 50 123 4567',
            email: 'info@basma.com',
            address: 'Riyadh, Saudi Arabia',
            workingHours: 'Sunday - Thursday: 9:00 AM - 6:00 PM'
          }
        },
        updatedBy: admin._id
      },
      {
        category: 'social',
        key: 'links',
        value: {
          facebook: 'https://facebook.com/basmadesign',
          twitter: 'https://twitter.com/basmadesign',
          instagram: 'https://instagram.com/basmadesign',
          linkedin: 'https://linkedin.com/company/basmadesign'
        },
        updatedBy: admin._id
      }
    ];

    await Setting.insertMany(settings);
  } catch (error) {
  }
};

const seedAll = async () => {
  try {
    await connectDB();
    
    
    await seedUsers();
    await seedServices();
    await seedBlogs();
    await seedFAQs();
    await seedSettings();
    
    
    // Display admin credentials
    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedAll();
}

export default seedAll;
