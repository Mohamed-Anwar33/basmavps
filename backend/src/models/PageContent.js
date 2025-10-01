import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    enum: ['homepage', 'about', 'services', 'contact', 'blog', 'faq', 'privacy', 'terms', 'hero', 'foundational', 'counters', 'what-makes-us-different'],
    unique: true,
    index: true
  },
  
  // Enhanced sectioned content structure
  content: {
    sections: [{
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true,
        enum: ['text', 'richText', 'image', 'gallery', 'form', 'video', 'embed', 'custom', 'hero', 'steps', 'notes', 'cta']
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      order: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      },
      settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }],
    
    // SEO and metadata
    metadata: {
      title: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      description: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
      },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      robots: {
        type: String,
        default: 'index,follow',
        enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow']
      }
    },
    
    // Legacy content for backward compatibility
    legacy: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  
  // Timestamps
  lastModified: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  // User tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Analytics and performance
  analytics: {
    views: { type: Number, default: 0 },
    lastViewed: { type: Date },
    avgLoadTime: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }
  },
  
  // Content validation and quality
  validation: {
    isValid: { type: Boolean, default: true },
    errors: [{ 
      field: String, 
      message: String, 
      severity: { type: String, enum: ['error', 'warning', 'info'], default: 'error' }
    }],
    lastValidated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
pageContentSchema.index({ pageType: 1, isActive: 1 });
pageContentSchema.index({ status: 1, publishedAt: -1 });
pageContentSchema.index({ lastModified: -1 });
pageContentSchema.index({ 'content.sections.type': 1 });

// Virtual for creator details
pageContentSchema.virtual('creator', {
  ref: 'Admin',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for last modifier details
pageContentSchema.virtual('lastModifier', {
  ref: 'Admin',
  localField: 'lastModifiedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
pageContentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  
  // Auto-increment version on content changes
  if (this.isModified('content') && !this.isNew) {
    this.version += 1;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Validate sections order
  if (this.content && this.content.sections) {
    this.content.sections.forEach((section, index) => {
      if (section.order === undefined || section.order === null) {
        section.order = index;
      }
    });
    
    // Sort sections by order
    this.content.sections.sort((a, b) => a.order - b.order);
  }
  
  next();
});

// Static methods
pageContentSchema.statics.findByType = function(pageType) {
  return this.findOne({ pageType, isActive: true });
};

pageContentSchema.statics.findPublished = function() {
  return this.find({ status: 'published', isActive: true }).sort({ publishedAt: -1 });
};

pageContentSchema.statics.findDrafts = function() {
  return this.find({ status: 'draft' }).sort({ lastModified: -1 });
};

pageContentSchema.statics.search = function(query, options = {}) {
  const { page = 1, limit = 20, status, pageType } = options;
  const skip = (page - 1) * limit;
  
  const searchQuery = {};
  
  if (query) {
    searchQuery.$or = [
      { pageType: { $regex: query, $options: 'i' } },
      { 'content.metadata.title.ar': { $regex: query, $options: 'i' } },
      { 'content.metadata.title.en': { $regex: query, $options: 'i' } },
      { 'content.metadata.description.ar': { $regex: query, $options: 'i' } },
      { 'content.metadata.description.en': { $regex: query, $options: 'i' } }
    ];
  }
  
  if (status) searchQuery.status = status;
  if (pageType) searchQuery.pageType = pageType;
  
  return this.find(searchQuery)
    .populate('creator', 'name email')
    .populate('lastModifier', 'name email')
    .sort({ lastModified: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance methods
pageContentSchema.methods.addSection = function(sectionData) {
  if (!this.content.sections) {
    this.content.sections = [];
  }
  
  const newSection = {
    id: sectionData.id || new mongoose.Types.ObjectId().toString(),
    type: sectionData.type,
    data: sectionData.data || {},
    order: sectionData.order !== undefined ? sectionData.order : this.content.sections.length,
    isActive: sectionData.isActive !== undefined ? sectionData.isActive : true,
    settings: sectionData.settings || {}
  };
  
  this.content.sections.push(newSection);
  return newSection;
};

pageContentSchema.methods.updateSection = function(sectionId, updateData) {
  const section = this.content.sections.find(s => s.id === sectionId);
  if (section) {
    Object.assign(section, updateData);
    return section;
  }
  return null;
};

pageContentSchema.methods.removeSection = function(sectionId) {
  const index = this.content.sections.findIndex(s => s.id === sectionId);
  if (index > -1) {
    return this.content.sections.splice(index, 1)[0];
  }
  return null;
};

pageContentSchema.methods.reorderSections = function(sectionOrders) {
  sectionOrders.forEach(({ id, order }) => {
    const section = this.content.sections.find(s => s.id === id);
    if (section) {
      section.order = order;
    }
  });
  
  this.content.sections.sort((a, b) => a.order - b.order);
};

pageContentSchema.methods.validateContent = function() {
  const errors = [];
  
  // Validate required metadata
  if (!this.content.metadata?.title?.ar && !this.content.metadata?.title?.en) {
    errors.push({
      field: 'content.metadata.title',
      message: 'Title is required in at least one language',
      severity: 'error'
    });
  }
  
  // Validate sections
  if (this.content.sections) {
    this.content.sections.forEach((section, index) => {
      if (!section.type) {
        errors.push({
          field: `content.sections[${index}].type`,
          message: 'Section type is required',
          severity: 'error'
        });
      }
      
      if (!section.id) {
        errors.push({
          field: `content.sections[${index}].id`,
          message: 'Section ID is required',
          severity: 'error'
        });
      }
    });
  }
  
  this.validation = {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    lastValidated: new Date()
  };
  
  return this.validation;
};

pageContentSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  this.isActive = true;
};

pageContentSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.isActive = false;
};

pageContentSchema.methods.archive = function() {
  this.status = 'archived';
  this.isActive = false;
};

const PageContent = mongoose.model('PageContent', pageContentSchema);

export default PageContent;
