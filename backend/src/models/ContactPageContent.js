import mongoose from 'mongoose'

const contactPageContentSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    ar: { type: String, default: 'معلومات التواصل – بصمة تصميم' },
    en: { type: String, default: 'Contact Information - Basmat Design' }
  },
  heroSubtitle: {
    ar: { type: String, default: 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:' },
    en: { type: String, default: 'We believe that clear communication is the foundation of professional service. All service requests and details are managed exclusively through the following channels:' }
  },

  // Contact Information
  contactInfo: {
    whatsappLink: { type: String, default: 'https://wa.me/your-number' },
    email: { type: String, default: 'basmat.design0@gmail.com' },
    workingHours: {
      ar: { type: String, default: 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية' },
      en: { type: String, default: 'Daily from 10 AM to 10 PM - Saudi Arabia Time' }
    }
  },

  // WhatsApp Section
  whatsappSection: {
    title: {
      ar: { type: String, default: 'القناة الرسمية للتواصل — واتساب' },
      en: { type: String, default: 'Official Communication Channel - WhatsApp' }
    },
    description: {
      ar: { type: String, default: 'يُستخدم حصريًا لتأكيد الطلبات، توضيح التفاصيل، واستلام الملفات. يتم فتح قناة التواصل بعد إتمام الدفع مباشرة.' },
      en: { type: String, default: 'Used exclusively for order confirmation, clarifying details, and receiving files. Communication channel opens immediately after payment completion.' }
    },
    noteTitle: {
      ar: { type: String, default: 'ملاحظة' },
      en: { type: String, default: 'Note' }
    },
    noteDescription: {
      ar: { type: String, default: 'يُلزم العميل عند التواصل بتقديم رقم الطلب أو البريد الإلكتروني المستخدم في الدفع، لضمان التحقق وربط الطلب بالتنفيذ.' },
      en: { type: String, default: 'Client must provide order number or email used for payment when communicating, to ensure verification and link order to execution.' }
    },
    buttonText: {
      ar: { type: String, default: 'تواصل عبر واتساب' },
      en: { type: String, default: 'Contact via WhatsApp' }
    }
  },

  // Email Section
  emailSection: {
    title: {
      ar: { type: String, default: 'البريد الإلكتروني' },
      en: { type: String, default: 'Email' }
    },
    description: {
      ar: { type: String, default: 'للاستفسارات العامة والاقتراحات:' },
      en: { type: String, default: 'For general inquiries and suggestions:' }
    },
    responseNote: {
      ar: { type: String, default: 'نرد خلال ساعات العمل الموضحة أدناه.' },
      en: { type: String, default: 'We respond during business hours shown below.' }
    }
  },

  // Working Hours Section
  workingHoursSection: {
    title: {
      ar: { type: String, default: 'ساعات العمل الرسمية' },
      en: { type: String, default: 'Official Working Hours' }
    },
    description: {
      ar: { type: String, default: 'أي تواصل خارج هذه الساعات يُرد عليه في أقرب وقت ممكن خلال ساعات العمل.' },
      en: { type: String, default: 'Any communication outside these hours will be responded to as soon as possible during business hours.' }
    }
  },

  // Important Notes Section
  importantNotesSection: {
    title: {
      ar: { type: String, default: 'ملاحظات مهمة' },
      en: { type: String, default: 'Important Notes' }
    },
    notes: [{
      ar: { type: String },
      en: { type: String }
    }]
  },

  // Social Media Section
  socialMediaSection: {
    title: {
      ar: { type: String, default: 'منصاتنا على مواقع التواصل' },
      en: { type: String, default: 'Our Social Media Platforms' }
    },
    description: {
      ar: { type: String, default: 'تابعنا واطّلع على جديد أعمالنا عبر المنصات التالية:' },
      en: { type: String, default: 'Follow us and check out our latest work on the following platforms:' }
    },
    platforms: {
      instagram: { type: String, default: '#' },
      twitter: { type: String, default: '#' },
      linkedin: { type: String, default: '#' },
      tiktok: { type: String, default: '#' }
    },
    disclaimer: {
      ar: { type: String, default: 'جميع حساباتنا الرسمية تُستخدم للعرض والرد على الاستفسارات فقط، ولا تُعتمد لتنفيذ الطلبات.' },
      en: { type: String, default: 'All our official accounts are used for display and responding to inquiries only, and are not used for order execution.' }
    }
  },

  // SEO Settings
  seoSettings: {
    pageTitle: {
      ar: { type: String, default: 'تواصل معنا | بصمة تصميم - معلومات التواصل وطلب الخدمات' },
      en: { type: String, default: 'Contact Us | Basmat Design - Contact Information and Service Requests' }
    },
    metaDescription: {
      ar: { type: String, default: 'تواصل مع فريق بصمة تصميم عبر جميع قنوات التواصل الرسمية. واتساب، إيميل، وساعات العمل. احصل على استشارة مجانية لمشروعك في التصميم والمحتوى الرقمي.' },
      en: { type: String, default: 'Contact the Basmat Design team through all official communication channels. WhatsApp, email, and working hours. Get a free consultation for your design and digital content project.' }
    },
    keywords: {
      ar: [{ type: String }],
      en: [{ type: String }]
    },
    openGraph: {
      title: {
        ar: { type: String, default: 'تواصل معنا | بصمة تصميم - معلومات التواصل وطلب الخدمات' },
        en: { type: String, default: 'Contact Us | Basmat Design - Contact Information and Service Requests' }
      },
      description: {
        ar: { type: String, default: 'تواصل مع فريق بصمة تصميم عبر جميع قنوات التواصل الرسمية. احصل على استشارة مجانية لمشروعك.' },
        en: { type: String, default: 'Contact the Basmat Design team through all official communication channels. Get a free consultation for your project.' }
      },
      image: { type: String, default: '/contact-og-image.jpg' },
      url: { type: String, default: 'https://basmatdesign.com/contact' }
    },
    twitter: {
      title: {
        ar: { type: String, default: 'تواصل معنا | بصمة تصميم - معلومات التواصل وطلب الخدمات' },
        en: { type: String, default: 'Contact Us | Basmat Design - Contact Information and Service Requests' }
      },
      description: {
        ar: { type: String, default: 'تواصل مع فريق بصمة تصميم عبر جميع قنوات التواصل الرسمية. احصل على استشارة مجانية لمشروعك.' },
        en: { type: String, default: 'Contact the Basmat Design team through all official communication channels. Get a free consultation for your project.' }
      },
      image: { type: String, default: '/contact-og-image.jpg' }
    },
    canonicalUrl: { type: String, default: 'https://basmatdesign.com/contact' }
  },

  // Status and metadata
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  version: { type: Number, default: 1 }
}, {
  timestamps: true
})

// Indexes for better performance
contactPageContentSchema.index({ isActive: 1 })
contactPageContentSchema.index({ updatedAt: -1 })

// Pre-save middleware to increment version
contactPageContentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1
  }
  next()
})

export default mongoose.model('ContactPageContent', contactPageContentSchema)
