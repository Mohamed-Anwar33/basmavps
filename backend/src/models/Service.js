import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         slug:
 *           type: string
 *           unique: true
 *         description:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         price:
 *           type: object
 *           properties:
 *             SAR:
 *               type: number
 *             USD:
 *               type: number
 *         durationDays:
 *           type: number
 *           default: 7
 *         category:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         mainImages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               alt:
 *                 type: string
 *               order:
 *                 type: number
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *               uploadedBy:
 *                 type: string
 *         portfolioImages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               alt:
 *                 type: string
 *               order:
 *                 type: number
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *               uploadedBy:
 *                 type: string
 *         features:
 *           type: object
 *           properties:
 *             ar:
 *               type: array
 *               items:
 *                 type: string
 *             en:
 *               type: array
 *               items:
 *                 type: string
 *         deliveryLinks:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *           default: true
 *         isFeatured:
 *           type: boolean
 *           default: false
 *         order:
 *           type: number
 *           default: 0
 *         meta:
 *           type: object
 *           properties:
 *             seo:
 *               type: object
 *               properties:
 *                 title:
 *                   type: object
 *                   properties:
 *                     ar:
 *                       type: string
 *                     en:
 *                       type: string
 *                 description:
 *                   type: object
 *                   properties:
 *                     ar:
 *                       type: string
 *                     en:
 *                       type: string
 *                 keywords:
 *                   type: array
 *                   items:
 *                     type: string
 */

const serviceSchema = new mongoose.Schema({
  title: {
    ar: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    en: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\u0600-\u06FFa-z0-9\-\s]+$/, 'Slug can contain Arabic letters, English letters, numbers, hyphens and spaces']
  },
  description: {
    ar: {
      type: String,
      required: [true, 'Arabic description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    en: {
      type: String,
      required: [true, 'English description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    }
  },
  price: {
    SAR: {
      type: Number,
      required: [true, 'SAR price is required'],
      min: [0, 'Price cannot be negative']
    },
    USD: {
      type: Number,
      required: [true, 'USD price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  originalPrice: {
    SAR: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    USD: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    }
  },
  deliveryTime: {
    min: {
      type: Number,
      default: 1,
      min: [0, 'Minimum delivery time cannot be negative']
    },
    max: {
      type: Number,
      default: 7,
      min: [0, 'Maximum delivery time cannot be negative']
    }
  },
  durationDays: {
    type: Number,
    default: 7,
    min: [0, 'Duration cannot be negative'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  revisions: {
    type: Number,
    default: 2,
    min: [0, 'Revisions cannot be negative']
  },
  deliveryFormats: [{
    type: String,
    trim: true
  }],
  nonRefundable: {
    type: Boolean,
    default: true
  },
  digitalDelivery: {
    type: {
      type: String,
      enum: ['links', 'instant']
    },
    links: [{
      title: String,
      url: String,
      imageUrl: String,
      locale: {
        type: String,
        enum: ['ar', 'en', 'mixed']
      },
      tags: [String]
    }]
  },
  uiTexts: {
    // الحقول الجديدة المضافة
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    workSteps: [{
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Step title cannot exceed 100 characters']
      },
      desc: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Step description cannot exceed 300 characters']
      }
    }],
    customFeatures: [{
      icon: {
        type: String,
        trim: true,
        maxlength: [10, 'Icon cannot exceed 10 characters']
      },
      color: {
        type: String,
        enum: ['pink', 'blue', 'green', 'purple', 'orange', 'red', 'teal', 'indigo'],
        default: 'blue'
      },
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Feature title cannot exceed 100 characters']
      },
      desc: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Feature description cannot exceed 300 characters']
      }
    }],
    // الحقول الموجودة
    qualityTitle: {
      ar: String,
      en: String
    },
    qualitySubtitle: {
      ar: String,
      en: String
    },
    detailsTitle: {
      ar: String,
      en: String
    },
    details: {
      ar: String,
      en: String
    },
    noticeTitle: {
      ar: String,
      en: String
    },
    notice: {
      ar: String,
      en: String
    },
    detailsPoints: [String],
    qualityPoints: [String],
    noticePoints: [String]
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  // الصور الرئيسية للخدمة
  mainImages: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
    },
    alt: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // صور نماذج الأعمال (Portfolio)
  portfolioImages: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
    },
    alt: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  features: {
    ar: [{
      type: String,
      trim: true,
      maxlength: [100, 'Feature cannot exceed 100 characters']
    }],
    en: [{
      type: String,
      trim: true,
      maxlength: [100, 'Feature cannot exceed 100 characters']
    }]
  },
  deliveryLinks: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid delivery link URL format'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  meta: {
    seo: {
      title: {
        ar: String,
        en: String
      },
      description: {
        ar: String,
        en: String
      },
      keywords: [String]
    },
    analytics: {
      views: {
        type: Number,
        default: 0
      },
      orders: {
        type: Number,
        default: 0
      }
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceSchema.index({ slug: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isFeatured: 1 });
serviceSchema.index({ order: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ 'title.ar': 'text', 'title.en': 'text', 'description.ar': 'text', 'description.en': 'text' });

// Virtual for orders count
serviceSchema.virtual('ordersCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.serviceId',
  count: true
});

// Pre-save middleware to generate slug if not provided
serviceSchema.pre('save', function(next) {
  if (!this.slug && this.title.en) {
    this.slug = slugify(this.title.en, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Static method to find active services
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
};

// Static method to find featured services
serviceSchema.statics.findFeatured = function(limit = 6) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(limit);
};

// Static method to search services
serviceSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    currency = 'SAR',
    page = 1,
    limit = 12,
    sort = 'createdAt'
  } = options;

  const filter = { isActive: true };
  
  if (query) {
    filter.$text = { $search: query };
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter[`price.${currency}`] = {};
    if (minPrice !== undefined) filter[`price.${currency}`].$gte = minPrice;
    if (maxPrice !== undefined) filter[`price.${currency}`].$lte = maxPrice;
  }

  const sortOptions = {};
  switch (sort) {
    case 'price-asc':
      sortOptions[`price.${currency}`] = 1;
      break;
    case 'price-desc':
      sortOptions[`price.${currency}`] = -1;
      break;
    case 'name':
      sortOptions['title.en'] = 1;
      break;
    case 'featured':
      sortOptions.isFeatured = -1;
      sortOptions.order = 1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Instance method to increment views
serviceSchema.methods.incrementViews = function() {
  if (!this.meta.analytics) {
    this.meta.analytics = { views: 0, orders: 0 };
  }
  this.meta.analytics.views += 1;
  return this.save();
};

// Instance method to increment orders
serviceSchema.methods.incrementOrders = function() {
  if (!this.meta.analytics) {
    this.meta.analytics = { views: 0, orders: 0 };
  }
  this.meta.analytics.orders += 1;
  return this.save();
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
