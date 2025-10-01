import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// تعريف مخطط الخدمة مباشرة
const serviceSchema = new mongoose.Schema({
  title: {
    ar: String,
    en: String
  },
  uiTexts: {
    qualityTitle: { ar: String, en: String },
    qualitySubtitle: { ar: String, en: String },
    qualityPoints: [String],
    detailsTitle: { ar: String, en: String },
    details: { ar: String, en: String },
    detailsPoints: [String],
    noticeTitle: { ar: String, en: String },
    notice: { ar: String, en: String },
    noticePoints: [String]
  }
}, { strict: false });

const Service = mongoose.model('Service', serviceSchema);

async function addDefaultTexts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const services = await Service.find({});
    
    for (const service of services) {
      const updates = {
        uiTexts: {
          ...service.uiTexts,
          qualityPoints: (service.uiTexts?.qualityPoints && service.uiTexts.qualityPoints.length > 0) ? 
            service.uiTexts.qualityPoints : [
            'جودة احترافية مضمونة',
            'تسليم في الوقت المحدد', 
            'دعم فني متواصل',
            'تعديلات مجانية'
          ],
          detailsPoints: (service.uiTexts?.detailsPoints && service.uiTexts.detailsPoints.length > 0) ? 
            service.uiTexts.detailsPoints : [
            'حضور رقمي متكامل — لأن النجاح يبدأ من استراتيجية واضحة وتنفيذ احترافي.',
            'نقدم لك خدمة شاملة لإدارة حساباتك على السوشيال ميديا لمدة 30 يوم.'
          ],
          noticePoints: (service.uiTexts?.noticePoints && service.uiTexts.noticePoints.length > 0) ? 
            service.uiTexts.noticePoints : [
            'الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع',
            'بعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل'
          ]
        }
      };
      
      await Service.findByIdAndUpdate(service._id, updates);
    }
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

addDefaultTexts();
