import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import dotenv from 'dotenv';

dotenv.config();

// توزيع الصور على البنرات
const iconMapping = {
  // الصفحة الرئيسية
  'home/top': '/ايقونات البنرات/illustration.png',
  'home/middle': '/ايقونات البنرات/growth.png', 
  'home/bottom': '/ايقونات البنرات/ui-ux-designer.png',
  
  // صفحة الخدمات
  'services/top': '/ايقونات البنرات/illustration (1).png',
  'services/bottom': '/ايقونات البنرات/ui-ux-designer.png',
  
  // صفحة من نحن
  'about/top': '/ايقونات البنرات/illustration.png',
  
  // صفحة التواصل
  'contact/top': '/ايقونات البنرات/growth.png',
  
  // صفحة المدونة
  'blog/top': '/ايقونات البنرات/illustration (1).png'
};

async function updateBannersWithIcons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // جلب جميع البنرات
    const banners = await Banner.find({});

    let updatedCount = 0;

    for (const banner of banners) {
      const key = `${banner.pageSlug}/${banner.position}`;
      const iconPath = iconMapping[key];
      
      if (iconPath) {
        // تحديث البنر بالصورة
        await Banner.findByIdAndUpdate(banner._id, {
          $set: {
            'image.url': iconPath,
            'image.alt': `أيقونة ${banner.title.ar}`,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
      } else {
      }
    }

    
    // عرض النتائج النهائية
    const updatedBanners = await Banner.find({}).select('title pageSlug position image');
    updatedBanners.forEach((banner, index) => {
      const iconStatus = banner.image?.url ? `✅ ${banner.image.url}` : '❌ No icon';
      console.log(`${index + 1}. ${banner.title.ar} (${banner.pageSlug}/${banner.position}) - ${iconStatus}`);
    });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

updateBannersWithIcons();
