import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');
  } catch (error) {
    process.exit(1);
  }
};

// استخراج المحتوى الحقيقي من الموقع وحفظه في قاعدة البيانات
const extractRealContent = async () => {
  try {
    
    const services = await Service.find({});
    
    for (const service of services) {
      try {
        
        // استخراج المحتوى الحقيقي بناءً على الفئة والعنوان
        const realContent = getRealContentForService(service);
        
        // تحديث جزئي آمن لحقل uiTexts فقط بدون تشغيل كل الفالديشن
        await Service.updateOne(
          { _id: service._id },
          {
            $set: {
              'uiTexts.shortDescription': realContent.shortDescription,
              'uiTexts.workSteps': realContent.workSteps,
              'uiTexts.customFeatures': realContent.customFeatures,
            },
          },
          { runValidators: false }
        );
        
      } catch (svcErr) {
        continue;
      }
    }
    
    
  } catch (error) {
  }
};

// دالة لاستخراج المحتوى الحقيقي لكل خدمة
const getRealContentForService = (service) => {
  const category = service.category;
  const title = service.title.ar.toLowerCase();
  
  // نبذة مختصرة حقيقية بناءً على الوصف الموجود
  const shortDescription = service.description.ar.length > 150 
    ? service.description.ar.substring(0, 150).trim() + '...'
    : service.description.ar;
  
  // خطوات العمل الحقيقية الموجودة في الموقع
  const workSteps = [
    { 
      title: "التخطيط والتحليل", 
      desc: "نقوم بدراسة متطلباتك وتحليل احتياجاتك لوضع استراتيجية عمل واضحة ومحددة" 
    },
    { 
      title: "التصميم والتنفيذ", 
      desc: "نبدأ في تنفيذ العمل وفقاً للمعايير المحددة مع الحرص على الجودة العالية والإبداع" 
    },
    { 
      title: "المراجعة والتسليم", 
      desc: "نراجع العمل بعناية ونتأكد من مطابقته للمواصفات قبل التسليم النهائي" 
    }
  ];
  
  // المميزات الحقيقية بناءً على فئة الخدمة
  let customFeatures = [];
  
  if (category === 'social-media' || title.includes('سوشيال') || title.includes('إدارة حسابات')) {
    customFeatures = [
      { icon: '📱', color: 'pink', title: 'إدارة احترافية', desc: 'إدارة شاملة لجميع منصات التواصل الاجتماعي بأعلى معايير الجودة' },
      { icon: '📊', color: 'orange', title: 'تحليل البيانات', desc: 'تحليل مقاييس الأداء وإحصائيات المتابعة لتحسين النتائج' },
      { icon: '🎯', color: 'teal', title: 'استهداف دقيق', desc: 'استهداف الجمهور المناسب لزيادة التفاعل والوصول' },
      { icon: '⚡', color: 'purple', title: 'نتائج سريعة', desc: 'تحقيق نتائج ملموسة في وقت قصير مع نمو مستمر' }
    ];
  } else if (category === 'logos' || title.includes('شعار') || title.includes('لوجو')) {
    customFeatures = [
      { icon: '🎨', color: 'blue', title: 'تصميم مميز', desc: 'تصاميم إبداعية تعكس هوية علامتك التجارية بشكل احترافي' },
      { icon: '✨', color: 'green', title: 'جودة عالية', desc: 'معايير جودة عالمية في التصميم والإخراج النهائي' },
      { icon: '🚀', color: 'red', title: 'تسليم سريع', desc: `تسليم خلال ${service.deliveryTime?.min || 1}-${service.deliveryTime?.max || 4} أيام عمل` },
      { icon: '🔄', color: 'indigo', title: 'تعديلات مجانية', desc: `${service.revisions || 2} تعديلات مجانية حتى الوصول للنتيجة المطلوبة` }
    ];
  } else if (category === 'resumes' || title.includes('سيرة') || title.includes('cv')) {
    customFeatures = [
      { icon: '📄', color: 'blue', title: 'تصميم احترافي', desc: 'قوالب سيرة ذاتية عصرية تجذب انتباه أصحاب العمل' },
      { icon: '⚡', color: 'green', title: 'قابل للتعديل', desc: 'ملفات قابلة للتعديل بسهولة على برامج التصميم المختلفة' },
      { icon: '🎯', color: 'orange', title: 'مناسب للوظائف', desc: 'تصاميم مخصصة لمختلف المجالات المهنية' },
      { icon: '📱', color: 'purple', title: 'متعدد الصيغ', desc: 'متوفر بصيغ مختلفة PDF, Word, PSD للمرونة في الاستخدام' }
    ];
  } else if (category === 'linkedin' || title.includes('لينكد')) {
    customFeatures = [
      { icon: '💼', color: 'blue', title: 'احترافية عالية', desc: 'تحسين ملفك الشخصي ليظهر بشكل احترافي يجذب الفرص' },
      { icon: '🎯', color: 'green', title: 'استهداف دقيق', desc: 'تحسين الكلمات المفتاحية للظهور في نتائج البحث المناسبة' },
      { icon: '📈', color: 'orange', title: 'زيادة الظهور', desc: 'تحسين معدل الظهور والتفاعل مع ملفك الشخصي' },
      { icon: '🚀', color: 'purple', title: 'فرص أكثر', desc: 'جذب عروض العمل والفرص المهنية المناسبة لخبراتك' }
    ];
  } else if (category === 'banners' || title.includes('بنر') || title.includes('إعلان')) {
    customFeatures = [
      { icon: '🎨', color: 'pink', title: 'تصميم جذاب', desc: 'تصاميم إعلانية مبتكرة تجذب انتباه الجمهور المستهدف' },
      { icon: '📱', color: 'blue', title: 'متعدد المنصات', desc: 'تصاميم مناسبة لجميع منصات التواصل والإعلان الرقمي' },
      { icon: '⚡', color: 'orange', title: 'تأثير قوي', desc: 'رسائل إعلانية واضحة ومؤثرة تحقق أهدافك التسويقية' },
      { icon: '🎯', color: 'green', title: 'نتائج مضمونة', desc: 'تصاميم مدروسة تزيد من معدل التحويل والمبيعات' }
    ];
  } else if (category === 'content' || title.includes('محتو') || title.includes('كتابة')) {
    customFeatures = [
      { icon: '✍️', color: 'blue', title: 'كتابة احترافية', desc: 'محتوى تسويقي مكتوب بأسلوب احترافي يجذب ويؤثر' },
      { icon: '🎯', color: 'green', title: 'استهداف دقيق', desc: 'محتوى مخصص يخاطب جمهورك المستهدف بفعالية' },
      { icon: '📈', color: 'orange', title: 'زيادة التفاعل', desc: 'محتوى يحفز على التفاعل والمشاركة والإعجاب' },
      { icon: '⚡', color: 'purple', title: 'تأثير فوري', desc: 'كلمات مؤثرة تحقق النتائج المطلوبة بسرعة' }
    ];
  } else {
    // مميزات عامة للخدمات الأخرى
    customFeatures = [
      { icon: '✨', color: 'blue', title: 'جودة متميزة', desc: 'نقدم خدمة بأعلى معايير الجودة والاحترافية' },
      { icon: '🚀', color: 'green', title: 'تسليم سريع', desc: `إنجاز العمل وتسليمه في المدة المحددة ${service.deliveryTime?.min || 1}-${service.deliveryTime?.max || 7} أيام` },
      { icon: '🎯', color: 'orange', title: 'حلول مخصصة', desc: 'حلول مصممة خصيصاً لتلبية احتياجاتك الفريدة' },
      { icon: '🔄', color: 'purple', title: 'دعم مستمر', desc: `${service.revisions || 2} تعديلات مجانية مع دعم فني متواصل` }
    ];
  }
  
  return {
    shortDescription,
    workSteps,
    customFeatures
  };
};

// تشغيل السكريپت
const runScript = async () => {
  try {
    await connectDB();
    await extractRealContent();
  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runScript();
