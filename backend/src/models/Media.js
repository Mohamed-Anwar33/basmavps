import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       required:
 *         - filename
 *         - url
 *         - mimeType
 *         - size
 *       properties:
 *         _id:
 *           type: string
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         url:
 *           type: string
 *         thumbnailUrl:
 *           type: string
 *         size:
 *           type: number
 *         mimeType:
 *           type: string
 *         uploaderId:
 *           type: string
 *         alt:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isPublic:
 *           type: boolean
 *           default: true
 *         meta:
 *           type: object
 */

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid thumbnail URL format'
    }
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'Size cannot be negative']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alt: {
    ar: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  meta: {
    dimensions: {
      width: Number,
      height: Number
    },
    usage: [{
      collectionName: String,
      documentId: mongoose.Schema.Types.ObjectId,
      field: String
    }],
    folder: {
      type: String,
      default: 'general'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
mediaSchema.index({ uploaderId: 1 });
mediaSchema.index({ mimeType: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ 'meta.folder': 1 });
mediaSchema.index({ createdAt: -1 });

// Virtual for uploader details
mediaSchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploaderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for file type
mediaSchema.virtual('fileType').get(function() {
  if (this.mimeType.startsWith('image/')) return 'image';
  if (this.mimeType.startsWith('video/')) return 'video';
  if (this.mimeType.startsWith('audio/')) return 'audio';
  if (this.mimeType === 'application/pdf') return 'pdf';
  return 'document';
});

// Static method to find by type
mediaSchema.statics.findByType = function(type, options = {}) {
  const { page = 1, limit = 20, folder } = options;
  
  let mimeFilter;
  switch (type) {
    case 'image':
      mimeFilter = { mimeType: /^image\// };
      break;
    case 'video':
      mimeFilter = { mimeType: /^video\// };
      break;
    case 'audio':
      mimeFilter = { mimeType: /^audio\// };
      break;
    case 'pdf':
      mimeFilter = { mimeType: 'application/pdf' };
      break;
    default:
      mimeFilter = {};
  }

  const filter = { isPublic: true, ...mimeFilter };
  if (folder) {
    filter['meta.folder'] = folder;
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search media
mediaSchema.statics.search = function(query, options = {}) {
  const { page = 1, limit = 20, type, folder } = options;
  
  const filter = { isPublic: true };
  
  if (query) {
    filter.$or = [
      { originalName: { $regex: query, $options: 'i' } },
      { 'alt.ar': { $regex: query, $options: 'i' } },
      { 'alt.en': { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (type) {
    switch (type) {
      case 'image':
        filter.mimeType = /^image\//;
        break;
      case 'video':
        filter.mimeType = /^video\//;
        break;
      case 'audio':
        filter.mimeType = /^audio\//;
        break;
      case 'pdf':
        filter.mimeType = 'application/pdf';
        break;
    }
  }

  if (folder) {
    filter['meta.folder'] = folder;
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to add usage tracking
mediaSchema.methods.addUsage = function(collectionName, documentId, field) {
  if (!this.meta.usage) {
    this.meta.usage = [];
  }
  
  // Remove existing usage for the same document and field
  this.meta.usage = this.meta.usage.filter(
    usage => !(usage.collectionName === collectionName && 
               usage.documentId.toString() === documentId.toString() && 
               usage.field === field)
  );
  
  // Add new usage
  this.meta.usage.push({ collectionName, documentId, field });
  
  return this.save();
};

// Instance method to remove usage tracking
mediaSchema.methods.removeUsage = function(collectionName, documentId, field) {
  if (!this.meta.usage) return this.save();
  
  this.meta.usage = this.meta.usage.filter(
    usage => !(usage.collectionName === collectionName && 
               usage.documentId.toString() === documentId.toString() && 
               usage.field === field)
  );
  
  return this.save();
};

const Media = mongoose.model('Media', mediaSchema);

export default Media;
