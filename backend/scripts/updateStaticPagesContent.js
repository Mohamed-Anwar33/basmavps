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

const updateAboutSettings = () => ([
  { category: 'about', key: 'heroTitle', value: 'نحن لا ننافس على الشكل، بل على الأثر', lang: 'ar' },
  { category: 'about', key: 'heroSubtitle', value: 'في بصمة تصميم، نؤمن أن التصميم الحقيقي لا يقتصر على الجمال البصري، بل يمتد ليشمل القدرة على ترك أثر إيجابي ودائم في نفوس الجمهور.', lang: 'ar' },
  { category: 'about', key: 'missionTitle', value: 'رسالتنا', lang: 'ar' },
  { category: 'about', key: 'missionDesc', value: 'نسعى لأن نكون الشريك الإبداعي الموثوق لكل من يريد أن يترك بصمة مميزة في عالمه الرقمي. نحن نؤمن بقوة التصميم في تغيير الطريقة التي ينظر بها العالم لعلامتك التجارية.', lang: 'ar' },
  { category: 'about', key: 'whoBehindTitle', value: 'من وراء الإبداع', lang: 'ar' },
  { category: 'about', key: 'whoBehindBody', value: 'فريق من المبدعين والمتخصصين الذين يشاركونك شغف التميز والإبداع', lang: 'ar' },
  { category: 'about', key: 'visionTitle', value: 'رؤيتنا للمستقبل', lang: 'ar' },
  { category: 'about', key: 'visionBody', value: 'نطمح لأن نكون الاسم الأول الذي يتبادر للذهن عندما يفكر أحدهم في التصميم والإبداع في المنطقة العربية. نريد أن نساهم في رفع مستوى التصميم العربي ونجعله منافساً عالمياً.\n\nنحلم بعالم يقدر فيه التصميم الجيد، ويفهم تأثيره الحقيقي على نجاح الأعمال والمشاريع. عالم نساهم فيه بجعل كل علامة تجارية لها بصمة مميزة وأثر إيجابي.', lang: 'ar' },
  { category: 'about', key: 'values', value: [
    { title: 'الأصالة', description: 'نؤمن بأن كل مشروع فريد ويستحق تصميماً يعكس شخصيته الخاصة' },
    { title: 'الشفافية', description: 'سياساتنا واضحة، أسعارنا محددة، والتزامنا صادق مع كل عميل' },
    { title: 'التميّز', description: 'نسعى للوصول لأعلى معايير الجودة في كل تفصيلة من عملنا' },
    { title: 'الالتزام', description: 'نحترم وقتك ونلتزم بالمواعيد المتفق عليها دون تأخير' },
  ], lang: 'ar' },
  { category: 'about', key: 'whyUsTitle', value: 'لماذا بصمة تصميم؟', lang: 'ar' },
  { category: 'about', key: 'whyUsBody', value: 'لأننا نصمم ليبقى الأثر، ونكتب لنحرك الشعور، ونبني حضورًا رقمياً يعبر عنك.', lang: 'ar' },
  { category: 'about', key: 'bannerQuote', value: 'تصاميم تُحاكي رؤيتك وتُترجمها بصريًا', lang: 'ar' },
  { category: 'about', key: 'ctaPrimaryText', value: 'تواصل معنا', lang: 'ar' },
  { category: 'about', key: 'ctaPrimaryLink', value: '/contact', lang: 'both' },
  { category: 'about', key: 'ctaSecondaryText', value: 'تعرف على خدماتنا', lang: 'ar' },
  { category: 'about', key: 'ctaSecondaryLink', value: '/services', lang: 'both' },
]);

const updateContactSettings = () => ([
  { category: 'contact', key: 'headerTitle', value: 'معلومات التواصل – بصمة تصميم', lang: 'ar' },
  { category: 'contact', key: 'headerSubtitle', value: 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:', lang: 'ar' },
  { category: 'contact', key: 'whatsappLink', value: 'https://wa.me/966XXXXXXXXX', lang: 'both' },
  { category: 'contact', key: 'email', value: 'basmat.design0@gmail.com', lang: 'both' },
  { category: 'contact', key: 'workingHoursText', value: 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية', lang: 'ar' },
  { category: 'contact', key: 'notes', value: [
    'لا يتم الرد على الطلبات غير المدفوعة أو غير المكتملة',
    'لا يُعتمد أي تواصل عبر منصات أخرى (مثل إنستغرام أو تويتر) لتنفيذ الطلبات',
    'جميع المحادثات تُدار باحترام متبادل، وأي تجاوز يُعد مخالفة تعاقدية',
  ], lang: 'ar' },
  { category: 'contact', key: 'socialInstagram', value: 'https://www.instagram.com/basmat.design0/', lang: 'both' },
  { category: 'contact', key: 'socialTwitter', value: 'https://x.com/basmat_design0', lang: 'both' },
  { category: 'contact', key: 'socialLinkedin', value: '', lang: 'both' },
  { category: 'contact', key: 'socialTiktok', value: 'https://www.tiktok.com/@basmat.design0?is_from_webapp=1&sender_device=pc', lang: 'both' },
]);

const updatePoliciesSettings = () => ([
  { category: 'policies', key: 'terms', value: 'باستخدامك لخدمات بصمة تصميم، فإنك توافق على جميع الشروط والأحكام المنصوص عليها. يُحظر إساءة استخدام الخدمات أو انتهاك حقوق الملكية الفكرية. تلتزم بصمة تصميم بتقديم الخدمات المتفق عليها وفق أعلى معايير الجودة.', lang: 'ar' },
  { category: 'policies', key: 'refund', value: 'جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع. في حال وجود مشكلة في التنفيذ، يتم النظر في الحالة وتقديم حل مناسب وفق تقدير الفريق.', lang: 'ar' },
  { category: 'policies', key: 'privacy', value: 'نحترم خصوصيتك. لا نشارك بياناتك مع أي طرف ثالث إلا عند الضرورة القانونية أو بموافقتك الصريحة. يتم استخدام بياناتك فقط لتحسين الخدمة والتواصل معك.', lang: 'ar' },
  { category: 'policies', key: 'delivery', value: 'تختلف مدة التسليم حسب نوع الخدمة. يتم الالتزام بالمواعيد المتفق عليها. خدمة "قالب السيرة الذاتية الجاهز" تُرسل مباشرة عبر البريد الإلكتروني بعد الدفع.', lang: 'ar' },
]);

const run = async () => {
  try {
    await connectDB();

    const batches = [
      ...updateAboutSettings(),
      ...updateContactSettings(),
      ...updatePoliciesSettings(),
    ];

    await Setting.deleteMany({ category: { $in: ['about','contact','policies'] } });

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
