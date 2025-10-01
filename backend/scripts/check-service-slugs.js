import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 فحص Service slugs...');

async function checkServiceSlugs() {
  try {
    // الاتصال بـ MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بـ MongoDB Atlas');
    
    // جلب أول 5 services مع slugs
    const services = await mongoose.connection.db
      .collection('services')
      .find({ isActive: true }, { projection: { title: 1, slug: 1, _id: 1 } })
      .limit(5)
      .toArray();
    
    console.log('\n📋 Services والـ slugs الخاصة بهم:');
    console.log('═'.repeat(60));
    
    services.forEach((service, index) => {
      const title = service.title?.ar || service.title?.en || service.title || 'No Title';
      const slug = service.slug || 'NO SLUG';
      console.log(`${index + 1}. Title: ${title}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   ID: ${service._id}`);
      console.log('');
    });
    
    if (services.length > 0) {
      const firstService = services[0];
      console.log(`🔗 لاختبار الـ service الأول:`);
      console.log(`   URL: http://localhost:5000/api/services/${firstService.slug}`);
      console.log(`   Frontend: http://localhost:3000/services/${firstService.slug}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

checkServiceSlugs();
