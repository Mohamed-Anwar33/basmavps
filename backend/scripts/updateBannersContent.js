import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from '../src/models/Setting.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

const updateBannersSettings = () => ([
  // البنرات الرئيسية
  { category: 'banners', key: 'mainBanner1Title', value: 'لا تكتفي بالظهور… كن علامة', lang: 'ar' },
  { category: 'banners', key: 'mainBanner1Position', value: 'after_foundation', lang: 'both' },
  { category: 'banners', key: 'mainBanner1Purpose', value: 'إثارة الفضول، ربط الهوية بالتأثير', lang: 'ar' },
  
  { category: 'banners', key: 'mainBanner2Title', value: 'عروض خاصة لفترة محدودة — لا تفوّت الفرصة', lang: 'ar' },
  { category: 'banners', key: 'mainBanner2Position', value: 'after_services', lang: 'both' },
  { category: 'banners', key: 'mainBanner2Purpose', value: 'تحفيز الزائر لاكتشاف العروض أو الخدمات المميزة', lang: 'ar' },
  
  { category: 'banners', key: 'mainBanner3Title', value: 'اكتشف كيف تتحوّل فكرتك إلى حضورٍ لا يُنسى', lang: 'ar' },
  { category: 'banners', key: 'mainBanner3Position', value: 'before_footer', lang: 'both' },
  { category: 'banners', key: 'mainBanner3Purpose', value: 'دعوة مباشرة', lang: 'ar' },
  
  // إضافات للبنرات
  { category: 'banners', key: 'ctaOption1', value: 'اطلب الآن وابدأ التأثير', lang: 'ar' },
  { category: 'banners', key: 'ctaOption2', value: 'اكتشف خدمتك القادمة', lang: 'ar' },
  { category: 'banners', key: 'ctaOption3', value: 'اجعل حضورك يحكي قصتك', lang: 'ar' },
  
  // بنرات الصفحات
  { category: 'banners', key: 'pageBanner1', value: 'خدماتنا تُصمم لتُحدث فرقًا', lang: 'ar' },
  { category: 'banners', key: 'pageBanner2', value: 'مشروعك يستحق بداية تُلفت الأنظار', lang: 'ar' },
  { category: 'banners', key: 'pageBanner3', value: 'حضور بصري يُعبّر عنك', lang: 'ar' },
  { category: 'banners', key: 'pageBanner4', value: 'محتوى يُلفت، يُبهر، ويُبقي الأثر', lang: 'ar' },
  { category: 'banners', key: 'pageBanner5', value: 'تصاميم تُحاكي رؤيتك وتُترجمها بصريًا', lang: 'ar' },
  { category: 'banners', key: 'pageBanner6', value: 'كتابة تُروّج لهويتك كما تستحق', lang: 'ar' },
  
  // إعدادات عامة للبنرات
  { category: 'banners', key: 'isActive', value: true, lang: 'both' },
  { category: 'banners', key: 'displayDuration', value: 5000, lang: 'both' }, // 5 seconds
  { category: 'banners', key: 'animationType', value: 'fade', lang: 'both' },
]);

const run = async () => {
  try {
    await connectDB();

    const batches = updateBannersSettings();

    await Setting.deleteMany({ category: 'banners' });

    let count = 0;
    for (const s of batches) {
      await Setting.updateSetting(s.key, s.category, s.value, s.lang);
      count++;
    }
  } catch (error) {
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (process.argv[1]) {
  run();
}
