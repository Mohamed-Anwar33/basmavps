import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQ from '../src/models/FAQ.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

const faqData = [
  {
    question: { ar: 'كيف أطلب خدمة؟', en: 'How do I order a service?' },
    answer: { 
      ar: 'اختر الخدمة التي تناسبك من قسم "خدماتنا"، ثم أتم عملية الدفع عبر PayPal. بعد الدفع، يظهر لك خيار التواصل معنا عبر واتساب لتوضيح تفاصيل طلبك وبدء التنفيذ. للمزيد من التفاصيل حول آلية الطلب، يمكنك زيارة صفحة طلب خدمة.',
      en: 'Choose the service that suits you from the "Services" section, then complete the payment via PayPal. After payment, you will see an option to contact us via WhatsApp to clarify your order details and start implementation.'
    },
    category: 'general',
    order: 1,
    isActive: true
  },
  {
    question: { ar: 'كم يستغرق تنفيذ الخدمة؟', en: 'How long does service implementation take?' },
    answer: { 
      ar: 'مدة التنفيذ تختلف حسب نوع الخدمة. ستجد المدة المحددة مكتوبة أسفل كل خدمة داخل صفحة "خدماتنا".',
      en: 'Implementation time varies according to the type of service. You will find the specified duration written below each service within the "Services" page.'
    },
    category: 'services',
    order: 2,
    isActive: true
  },
  {
    question: { ar: 'كيف أستلم الملفات؟', en: 'How do I receive the files?' },
    answer: { 
      ar: 'يتم تسليم الملفات بصيغ متعددة حسب نوع الخدمة، مثل: PNG، PDF، DOCX (للمحتوى النصي)، وأخرى. يتم تحديد صيغة التسليم أثناء التواصل بعد الدفع.',
      en: 'Files are delivered in multiple formats depending on the service type, such as: PNG, PDF, DOCX (for text content), and others. The delivery format is determined during communication after payment.'
    },
    category: 'delivery',
    order: 3,
    isActive: true
  },
  {
    question: { ar: 'هل يمكنني طلب تعديل بعد التسليم؟', en: 'Can I request modifications after delivery?' },
    answer: { 
      ar: 'نعم، إذا كان التعديل ضمن نطاق الخدمة وتم طلبه خلال 24 ساعة من وقت التسليم. أي تعديل خارج هذا الإطار يُحسب كخدمة إضافية مستقلة.',
      en: 'Yes, if the modification is within the scope of the service and requested within 24 hours of delivery time. Any modification outside this framework is counted as an independent additional service.'
    },
    category: 'services',
    order: 4,
    isActive: true
  },
  {
    question: { ar: 'هل يمكن إلغاء الخدمة أو استرداد المبلغ؟', en: 'Can the service be cancelled or refunded?' },
    answer: { 
      ar: 'لا. جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع، كما هو موضح في صفحة السياسات.',
      en: 'No. All services are non-cancellable and non-refundable after payment completion, as stated in the policies page.'
    },
    category: 'payment',
    order: 5,
    isActive: true
  },
  {
    question: { ar: 'هل يمكنني طلب خدمة إضافية غير موجودة في القائمة؟', en: 'Can I request an additional service not listed?' },
    answer: { 
      ar: 'نعم، يمكنك التواصل معنا عبر واتساب وشرح احتياجك، وسنرد عليك بإمكانية التنفيذ أو التخصيص.',
      en: 'Yes, you can contact us via WhatsApp and explain your need, and we will respond with the possibility of implementation or customization.'
    },
    category: 'general',
    order: 6,
    isActive: true
  },
  {
    question: { ar: 'هل يمكنني استخدام التصاميم لأغراض تجارية؟', en: 'Can I use the designs for commercial purposes?' },
    answer: { 
      ar: 'نعم، جميع التصاميم تُسلّم بحق الاستخدام التجاري، ما لم يُذكر خلاف ذلك.',
      en: 'Yes, all designs are delivered with commercial usage rights, unless otherwise stated.'
    },
    category: 'general',
    order: 7,
    isActive: true
  }
];

const run = async () => {
  try {
    await connectDB();

    await FAQ.deleteMany({});

    let count = 0;
    for (const faq of faqData) {
      await FAQ.create(faq);
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
