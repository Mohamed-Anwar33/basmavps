import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Service model
import Service from '../src/models/Service.js';

// محتوى الخدمات الجديد كما أرسله المستخدم
const servicesContent = {
  'تصميم بوست سوشيال ميديا': {
    price: { SAR: 37, USD: 10 },
    originalPrice: { SAR: 56, USD: 15 },
    description: 'محتوى بصري يوقف التمرير — لأن البصمة تبدأ من أول نظرة.\nفي عالم مزدحم بالمحتوى، تصميمك لازم يوقف المتابع، يلفت نظره، ويخليه يتفاعل.\nنصمم لك بوستات احترافية تعكس هوية مشروعك، بأسلوب بصري جذاب يحقق أهدافك التسويقية',
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['يشمل تصميم بوست واحد متوافق مع الهوية', 'أسلوب بصري جذاب يحقق أهدافك التسويقية', 'متوافق مع جودة منصات التواصل الاجتماعي'],
    uiTexts: {
      qualityTitle: { ar: 'كل خدمة نقدمها تحمل بصمتنا الإبداعية', en: 'Every service carries our creative signature' },
      qualitySubtitle: { ar: 'وتُصمم خصيصًا لتناسبك', en: 'Designed specifically for you' },
      detailsTitle: { ar: 'تفاصيل الخدمة', en: 'Service Details' },
      details: { ar: 'تشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب', en: 'Service includes two free revisions only\nAny additional revision is calculated as an independent service' },
      noticeTitle: { ar: 'تنويه هام', en: 'Important Notice' },
      notice: { ar: 'الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل', en: 'Service is non-refundable after payment completion\nAfter payment, you will be redirected to WhatsApp to send details' }
    }
  },
  'تصميم بوست إعلاني للسوشيال ميديا': {
    price: { SAR: 75, USD: 20 },
    description: 'أعلن بأسلوب ملفت و مقنع — مع بصمة تصميم، الإعلان له طابع مختلف\nنصمم لك بوست إعلاني يجذب الانتباه ويحفّز التفاعل، بصياغة بصرية مدروسة ومؤثرة.',
    deliveryTime: { min: 2, max: 4 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم إعلان احترافي بصيغة جذابة', 'بصياغة بصرية مدروسة ومؤثرة', 'يجذب الانتباه ويحفّز التفاعل']
  },
  'تصميم كاروسيل (5–6 بوستات)': {
    price: { SAR: 112, USD: 30 },
    description: 'سرد بصري متسلسل يروي قصة مشروعك — كل شريحة تحكي.\nنصمم لك سلسلة بوستات مترابطة بأسلوب كاروسيل، مثالية للعرض التفاعلي على إنستغرام أو لينكدإن.',
    deliveryTime: { min: 3, max: 7 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم 5–6 بوستات مترابطة', 'أسلوب كاروسيل تفاعلي', 'مثالية لإنستغرام ولينكدإن']
  },
  'بكج 10 تصاميم سوشيال ميديا': {
    price: { SAR: 525, USD: 140 },
    description: 'حزمة متكاملة لحضور رقمي قوي — الجودة والوفرة في بصمة واحدة.\nاحصل على 10 تصاميم متنوعة ومخصصة لحساباتك، بأسلوب احترافي يعكس هوية مشروعك.',
    deliveryTime: { min: 4, max: 8 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['يشمل 10 تصاميم متنوعة حسب الطلب', 'أسلوب احترافي يعكس هوية مشروعك', 'حزمة متكاملة لحضور رقمي قوي']
  },
  'تصميم واجهة حساب LinkedIn (بنر + لوقو)': {
    price: { SAR: 37, USD: 10 },
    description: 'خلّي حضورك المهني يترك بصمة واضحة.\nنصمم لك بنر احترافي ولوقو بسيط يعكس هويتك المهنية ويمنح حسابك مظهرًا احترافيًا وجذابًا.',
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['بنر احترافي للينكدإن', 'لوقو بسيط وأنيق', 'يعكس هويتك المهنية']
  },
  'تنفيذ حساب LinkedIn بالكامل': {
    price: { SAR: 93, USD: 25 },
    originalPrice: { SAR: 131, USD: 35 },
    description: 'بناء احترافي لحسابك من الصفر — نرتب لك كل شيء.\nنقوم بإنشاء حساب LinkedIn احترافي يشمل التصميم والمحتوى، ليعكس خبراتك ويجذب الفرص المناسبة.',
    deliveryTime: { min: 1, max: 6 },
    revisions: 2,
    features: ['تصميم البنر واللوقو', 'كتابة نبذة و كلمات مفتاحية', 'تعديل رابط URL', 'ترتيب و اضافة الأقسام']
  },
  'تصميم بنر سوشيال ميديا': {
    price: { SAR: 37, USD: 10 },
    description: 'بنر جذاب يلفت الانتباه ويعبر عن هوية مشروعك بأسلوب احترافي.',
    deliveryTime: { min: 1, max: 3 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم بنر جذاب للمنصات', 'أسلوب احترافي', 'يعبر عن هوية مشروعك']
  },
  'تصميم بنر إعلاني': {
    price: { SAR: 56, USD: 15 },
    description: 'بنر دعائي احترافي يجذب الانتباه ويحقق أهدافك التسويقية.',
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم بنر دعائي احترافي', 'يجذب الانتباه', 'يحقق أهدافك التسويقية']
  },
  'تصميم بنر متجر إلكتروني': {
    price: { SAR: 75, USD: 20 },
    description: 'بنر مخصص للمتاجر الإلكترونية يعزز من هوية علامتك التجارية ويجذب العملاء.',
    deliveryTime: { min: 1, max: 5 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم بنر مخصص للمتاجر', 'يعزز هوية علامتك التجارية', 'يجذب العملاء']
  },
  'قالب سير ذاتية قابلة للتعديل': {
    price: { SAR: 37, USD: 10 },
    description: 'جاهزة عبر Canva — بصمة احترافية في دقائق.\nقالب سيرة ذاتية احترافي قابل للتعديل والتخصيص حسب احتياجاتك.',
    deliveryFormats: ['رابط Canva'],
    features: ['قابل للتعديل والاضافة', 'امكانية تغيير الالوان', 'خطوط متنوعة ومميزة'],
    digitalDelivery: {
      type: 'instant',
      description: 'يتم إرسال رابط القالب مباشرة بعد الدفع'
    }
  },
  'تصميم سيرة ذاتية عادية': {
    price: { SAR: 56, USD: 15 },
    description: 'نعكس خبراتك بأسلوب بصري احترافي.\nتصميم سيرة ذاتية احترافية تبرز مهاراتك وخبراتك بطريقة جذابة.',
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['تصميم احترافي', 'يبرز مهاراتك وخبراتك', 'أسلوب بصري جذاب']
  },
  'تصميم سيرة ذاتية ATS': {
    price: { SAR: 56, USD: 15 },
    originalPrice: { SAR: 75, USD: 20 },
    description: 'نعكس خبراتك بأسلوب بصري احترافي متوافق مع أنظمة ATS.\nسيرة ذاتية احترافية محسنة لأنظمة تتبع المتقدمين وقابلة للقراءة آليًا.',
    deliveryTime: { min: 1, max: 5 },
    deliveryFormats: ['PNG', 'PDF', 'ملف مضغوط'],
    revisions: 2,
    features: ['متوافق مع أنظمة ATS', 'قابل للقراءة آليًا', 'تصميم احترافي محسن']
  },
  'كتابة محتوى إعلاني للسوشيال ميديا': {
    price: { SAR: 37, USD: 10 },
    description: 'سكربت إعلاني واحد بصيغة تسويقية جذابة يحفز على التفاعل والشراء.',
    deliveryTime: { min: 1, max: 4 },
    deliveryFormats: ['Word', 'PDF'],
    revisions: 2,
    features: ['سكربت واحد بصيغة تسويقية جذابة', 'يحفز على التفاعل والشراء', 'محتوى مدروس ومؤثر']
  },
  'كتابة محتوى بوست سوشيال ميديا': {
    price: { SAR: 19, USD: 5 },
    description: 'سكربت بوست واحد بسيط ومباشر للسوشيال ميديا.',
    deliveryTime: { min: 1, max: 3 },
    deliveryFormats: ['Word', 'PDF'],
    revisions: 2,
    features: ['سكربت واحد بسيط ومباشر', 'مناسب لجميع المنصات', 'محتوى واضح ومؤثر']
  },
  'بكج 10 سكربتات سوشيال ميديا': {
    price: { SAR: 131, USD: 35 },
    originalPrice: { SAR: 150, USD: 40 },
    description: 'مجموعة شاملة من 10 سكربتات متنوعة للسوشيال ميديا تغطي احتياجاتك التسويقية.',
    deliveryTime: { min: 3, max: 6 },
    deliveryFormats: ['Word', 'PDF'],
    revisions: 2,
    features: ['يشمل 10 سكربتات متنوعة', 'محتوى تسويقي شامل', 'يغطي احتياجاتك التسويقية']
  },
  'كتابة مقال للمدونات': {
    price: { SAR: 93, USD: 25 },
    description: 'مقال احترافي مخصص حسب مجالك يعزز من حضورك الرقمي ويجذب القراء.',
    deliveryTime: { min: 2, max: 5 },
    deliveryFormats: ['Word', 'PDF'],
    revisions: 2,
    features: ['مقال احترافي مخصص حسب المجال', 'يعزز الحضور الرقمي', 'محتوى جذاب للقراء']
  },
  'تصميم شعار كتابي': {
    price: { SAR: 131, USD: 35 },
    originalPrice: { SAR: 150, USD: 40 },
    description: 'تصميم اسم تجاري بأسلوب فني راقي يعبر عن هوية علامتك التجارية.',
    deliveryTime: { min: 3, max: 8 },
    revisions: 2,
    features: ['تصميم اسم تجاري بأسلوب فني', 'يعبر عن هوية العلامة التجارية', 'تصميم راقي ومميز']
  },
  'شعار مطور (أشكال)': {
    price: { SAR: 225, USD: 60 },
    description: 'تصميم شعار متطور بأيقونات وتكوينات متعددة لهوية بصرية شاملة.',
    deliveryTime: { min: 3, max: 8 },
    revisions: 2,
    features: ['تصميم شعار بأيقونات وتكوينات متعددة', 'هوية بصرية شاملة', 'تصميم متطور ومتنوع']
  },
  'تصميم شعار للشركات والمتاجر': {
    price: { SAR: 318, USD: 85 },
    description: 'تصميم شعار احترافي متكامل يعكس هوية تجارية كاملة للشركات والمتاجر الكبيرة.',
    deliveryTime: { min: 3, max: 8 },
    revisions: 2,
    features: ['تصميم احترافي يعكس هوية تجارية كاملة', 'مناسب للشركات والمتاجر الكبيرة', 'تصميم متكامل وشامل']
  },
  'استشارة تطوير الحسابات على السوشيال ميديا': {
    price: { SAR: 37, USD: 10 },
    description: 'تحليل احترافي لحسابك — لأن التطوير يبدأ من فهم التفاصيل\nنقوم بمراجعة شاملة لـ 1–3 حسابات على منصات التواصل، ونقدم لك تقريرًا عمليًا يوضح نقاط القوة والضعف والتحسينات المطلوبة.',
    deliveryTime: { min: 2, max: 4 },
    deliveryFormats: ['Word', 'PDF'],
    features: ['مراجعة شاملة لـ 1–3 حسابات', 'تقرير عملي بنقاط القوة والضعف', 'اقتراحات للتحسين والتطوير', 'خطوات قابلة للتنفيذ']
  },
  'استشارة تطوير الأعمال': {
    price: { SAR: 0, USD: 0 },
    description: 'خطوة أولى نحو تطوير مشروعك — بدون أي التزام مالي.\nاحصل على جلسة استشارية مجانية تناقش فيها مشروعك، أفكارك، أو التحديات التي تواجهك.',
    features: ['توجيه عام حول بناء الهوية التجارية', 'اقتراحات لتحسين تجربة العميل', 'أفكار أولية لتطوير الخدمات', 'الاستشارة مجانية تمامًا عبر واتساب أو مكالمة قصيرة'],
    digitalDelivery: {
      type: 'consultation',
      description: 'جلسة استشارية مجانية عبر واتساب أو مكالمة (15–20 دقيقة)'
    }
  },
  'ادارة حسابات السوشيال ميديا': {
    price: { SAR: 825, USD: 220 },
    originalPrice: { SAR: 937, USD: 250 },
    description: 'حضور رقمي متكامل — لأن النجاح يبدأ من استراتيجية واضحة وتنفيذ احترافي.\nنقدم لك خدمة شاملة لإدارة محتوى حساباتك على السوشيال ميديا لمدة 30 يوم.',
    deliveryTime: { min: 30, max: 30 },
    features: ['إعداد خطة محتوى شهرية مدروسة', 'كتابة وتصميم 15 بوست احترافي', 'نشر يومي للستوريز', 'تنسيق الحساب بصريًا', 'إدارة الحسابات والتفاعل مع الجمهور', 'جدولة النشر باحترافية', 'تقارير أداء دورية', 'تشمل إدارة 1–2 حسابات']
  }
};

async function updateServicesContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [serviceName, content] of Object.entries(servicesContent)) {
      
      // البحث عن الخدمة بالاسم العربي
      const service = await Service.findOne({
        $or: [
          { 'title.ar': serviceName },
          { 'title': serviceName }
        ]
      });

      if (!service) {
        notFoundCount++;
        continue;
      }


      // تحديث بيانات الخدمة
      const updateData = {
        'description.ar': content.description,
        'description.en': content.description,
        'pricing': content.price,
        'deliveryTime': content.deliveryTime || service.deliveryTime,
        'revisions': content.revisions || service.revisions || 2,
        'deliveryFormats': content.deliveryFormats || service.deliveryFormats,
        'features.ar': content.features || service.features?.ar || [],
        'features.en': content.features || service.features?.en || [],
      };

      // إضافة السعر الأصلي إذا كان موجوداً
      if (content.originalPrice) {
        updateData['originalPrice'] = content.originalPrice;
      }

      // تحديث النصوص المخصصة
      if (content.uiTexts) {
        updateData['uiTexts'] = {
          ...service.uiTexts,
          ...content.uiTexts
        };
      } else {
        // استخدام النصوص الافتراضية
        updateData['uiTexts'] = {
          qualityTitle: { ar: 'كل خدمة نقدمها تحمل بصمتنا الإبداعية', en: 'Every service carries our creative signature' },
          qualitySubtitle: { ar: 'وتُصمم خصيصًا لتناسبك', en: 'Designed specifically for you' },
          detailsTitle: { ar: 'تفاصيل الخدمة', en: 'Service Details' },
          details: { ar: 'تشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب', en: 'Service includes two free revisions only' },
          noticeTitle: { ar: 'تنويه هام', en: 'Important Notice' },
          notice: { ar: 'الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل', en: 'Service is non-refundable after payment completion' }
        };
      }

      // تحديث التسليم الرقمي إذا كان موجوداً
      if (content.digitalDelivery) {
        updateData['digitalDelivery'] = content.digitalDelivery;
      }

      // تطبيق التحديث
      await Service.findByIdAndUpdate(service._id, { $set: updateData }, { new: true });

      if (content.originalPrice) {
      }
      updatedCount++;
    }


  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
}

// تشغيل السكريبت
updateServicesContent();
