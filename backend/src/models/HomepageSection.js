import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    required: true,
    enum: ['whatMakesUsDifferent', 'counters', 'closingCTA', 'customSection'],
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  order: {
    type: Number,
    default: 0,
    index: true
  },
  
  // For What Makes Us Different section
  whatMakesUsDifferent: {
    title: {
      ar: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    subtitle: {
      ar: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    items: [{
      title: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      description: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      iconName: {
        type: String,
        default: 'star',
        enum: ['palette', 'shield', 'clock', 'sparkles', 'star', 'heart', 'zap', 'target', 'award']
      },
      iconColor: {
        type: String,
        default: 'text-primary'
      },
      bgGradient: {
        type: String,
        default: 'from-primary/10 to-accent/10'
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // For Counters section
  counters: {
    title: {
      ar: { type: String, default: 'أرقامنا' },
      en: { type: String, default: 'Our Numbers' }
    },
    subtitle: {
      ar: { type: String, default: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل' },
      en: { type: String, default: 'Our numbers speak about our commitment, creativity, and partnership with every client' }
    },
    items: [{
      label: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      value: {
        type: Number,
        required: true,
        default: 0
      },
      suffix: {
        ar: { type: String, default: '+' },
        en: { type: String, default: '+' }
      },
      iconName: {
        type: String,
        default: 'briefcase',
        enum: ['briefcase', 'users', 'timer', 'star', 'award', 'clock', 'heart', 'zap', 'target', 'checkCircle']
      },
      iconColor: {
        type: String,
        default: 'text-emerald-600'
      },
      chipBg: {
        type: String,
        default: 'from-emerald-100 to-teal-100'
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // For Closing CTA section
  closingCTA: {
    title: {
      ar: { type: String, default: 'ابدأ مشروعك معنا' },
      en: { type: String, default: 'Start Your Project With Us' }
    },
    subtitle: {
      ar: { type: String, default: 'حول فكرتك إلى واقع مع فريق بصمة تصميم المحترف' },
      en: { type: String, default: 'Turn your idea into reality with Basma Design professional team' }
    },
    description: {
      ar: { type: String, default: 'نحن هنا لنساعدك في تحقيق أهدافك التجارية من خلال حلول تصميم مبتكرة ومتميزة' },
      en: { type: String, default: 'We are here to help you achieve your business goals through innovative and distinctive design solutions' }
    },
    primaryButton: {
      text: {
        ar: { type: String, default: 'ابدأ مشروعك' },
        en: { type: String, default: 'Start Your Project' }
      },
      link: {
        type: String,
        default: '/services'
      }
    },
    secondaryButton: {
      text: {
        ar: { type: String, default: 'تواصل معنا' },
        en: { type: String, default: 'Contact Us' }
      },
      link: {
        type: String,
        default: '/contact'
      }
    },
    backgroundImage: {
      type: String,
      default: ''
    },
    backgroundGradient: {
      type: String,
      default: 'from-primary/90 to-accent/90'
    }
  },
  
  // For custom sections
  customSection: {
    title: {
      ar: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    content: {
      ar: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    image: {
      type: String,
      default: ''
    },
    button: {
      text: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      link: {
        type: String,
        default: ''
      }
    }
  },
  
  // SEO and metadata
  meta: {
    seo: {
      title: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      description: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      keywords: [{ type: String }]
    },
    analytics: {
      views: { type: Number, default: 0 },
      interactions: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true,
  collection: 'homepageSections'
});

// Indexes for better performance
homepageSectionSchema.index({ sectionType: 1, isActive: 1, order: 1 });
homepageSectionSchema.index({ createdAt: -1 });

// Static method to get sections by type
homepageSectionSchema.statics.findByType = function(sectionType) {
  return this.find({ sectionType, isActive: true }).sort({ order: 1 });
};

// Static method to get active sections
homepageSectionSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

// Instance method to toggle active status
homepageSectionSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);

export default HomepageSection;
