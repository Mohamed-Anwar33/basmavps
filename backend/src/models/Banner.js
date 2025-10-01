import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  // Basic Information
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  subtitle: {
    ar: { type: String },
    en: { type: String }
  },
  description: {
    ar: { type: String },
    en: { type: String }
  },

  // Banner Type and Position
  type: {
    type: String,
    enum: ['basic', 'page', 'luxury', 'promo', 'settings', 'curved'],
    default: 'basic'
  },
  position: {
    type: String,
    enum: ['top', 'middle', 'bottom', 'hero', 'footer'],
    required: true
  },
  pageSlug: {
    type: String,
    required: true,
    default: 'home'
  },

  // Visual Elements
  image: {
    url: { type: String },
    alt: { type: String },
    cloudinaryId: { type: String }
  },
  backgroundColor: {
    type: String,
    default: '#4b2e83'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  variant: {
    type: String,
    enum: ['primary', 'secondary', 'accent', 'gradient', 'services', 'about', 'blog', 'contact', 'portfolio'],
    default: 'primary'
  },
  size: {
    type: String,
    enum: ['sm', 'md', 'lg'],
    default: 'md'
  },

  // Interactive Elements
  ctaButton: {
    text: {
      ar: { type: String },
      en: { type: String }
    },
    link: { type: String },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'outline'],
      default: 'primary'
    },
    isExternal: { type: Boolean, default: false }
  },
  secondaryCtaButton: {
    text: {
      ar: { type: String },
      en: { type: String }
    },
    link: { type: String },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'outline'],
      default: 'secondary'
    },
    isExternal: { type: Boolean, default: false }
  },

  // Advanced Features
  features: [{
    text: {
      ar: { type: String },
      en: { type: String }
    }
  }],
  iconType: {
    type: String,
    enum: ['sparkles', 'star', 'zap', 'crown', 'gem', 'target', 'lightbulb'],
    default: 'sparkles'
  },
  backgroundPattern: {
    type: String,
    enum: ['dots', 'waves', 'geometric', 'luxury'],
    default: 'luxury'
  },

  // Curved Banner Specific Settings
  gradientColors: {
    start: { type: String, default: '#8453F7' },
    middle: { type: String, default: '#4b2e83' },
    end: { type: String, default: '#7a4db3' }
  },
  curveIntensity: {
    type: String,
    enum: ['light', 'medium', 'strong'],
    default: 'medium'
  },

  // Display Settings
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  showIcon: {
    type: Boolean,
    default: true
  },

  // Scheduling (Optional)
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bannerSchema.index({ pageSlug: 1, position: 1, isActive: 1 });
bannerSchema.index({ type: 1, isActive: 1 });
bannerSchema.index({ order: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if banner is currently active (considering dates)
bannerSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
});

// Method to increment views
bannerSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment clicks
bannerSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

// Static method to get active banners for a specific page and position
bannerSchema.statics.getActiveBanners = function(pageSlug, position, limit = 10) {
  const now = new Date();
  return this.find({
    pageSlug,
    position,
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  })
  .sort({ order: 1, createdAt: -1 })
  .limit(limit)
  .populate('createdBy', 'username')
  .populate('updatedBy', 'username');
};

// Pre-save middleware to handle order
bannerSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const maxOrder = await this.constructor.findOne(
      { pageSlug: this.pageSlug, position: this.position },
      { order: 1 }
    ).sort({ order: -1 });
    
    this.order = maxOrder ? maxOrder.order + 1 : 1;
  }
  next();
});

export default mongoose.model('Banner', bannerSchema);
