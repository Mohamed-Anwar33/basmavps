import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *         - content
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
 *         excerpt:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         content:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         coverImage:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         authorId:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         readingTime:
 *           type: number
 *         views:
 *           type: number
 *         meta:
 *           type: object
 */

const blogSchema = new mongoose.Schema({
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
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  excerpt: {
    ar: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters']
    }
  },
  content: {
    ar: {
      type: String,
      required: [true, 'Arabic content is required']
    },
    en: {
      type: String,
      required: [true, 'English content is required']
    }
  },
  category: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  coverImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  readingTime: {
    type: Number,
    default: 0,
    min: [0, 'Reading time cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
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
    featured: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ authorId: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'meta.featured': 1 });
blogSchema.index({ 'title.ar': 'text', 'title.en': 'text', 'content.ar': 'text', 'content.en': 'text' });

// Virtual for author details
blogSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to generate slug if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug && this.title.en) {
    this.slug = slugify(this.title.en, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Pre-save middleware to calculate reading time
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const contentLength = (this.content.ar || '').length + (this.content.en || '').length;
    const wordCount = contentLength / 5; // Approximate word count
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Pre-save middleware to set published date
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to find published blogs
blogSchema.statics.findPublished = function(options = {}) {
  const {
    page = 1,
    limit = 10,
    tags,
    author,
    featured
  } = options;

  const filter = { status: 'published' };
  
  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }
  
  if (author) {
    filter.authorId = author;
  }
  
  if (featured !== undefined) {
    filter['meta.featured'] = featured;
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('author', 'name email avatar')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search blogs
blogSchema.statics.search = function(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    tags,
    author
  } = options;

  const filter = { status: 'published' };
  
  if (query) {
    filter.$text = { $search: query };
  }
  
  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }
  
  if (author) {
    filter.authorId = author;
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('author', 'name email avatar')
    .sort(query ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get featured blogs
blogSchema.statics.findFeatured = function(limit = 3) {
  return this.find({ 
    status: 'published', 
    'meta.featured': true 
  })
    .populate('author', 'name email avatar')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get recent blogs
blogSchema.statics.findRecent = function(limit = 5) {
  return this.find({ status: 'published' })
    .populate('author', 'name email avatar')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get blog statistics
blogSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        averageReadingTime: { $avg: '$readingTime' }
      }
    }
  ]);

  return stats[0] || {
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    averageReadingTime: 0
  };
};

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to publish
blogSchema.methods.publish = function() {
  this.status = 'published';
  if (!this.publishedAt) {
    this.publishedAt = new Date();
  }
  return this.save();
};

// Instance method to unpublish
blogSchema.methods.unpublish = function() {
  this.status = 'draft';
  return this.save();
};

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
