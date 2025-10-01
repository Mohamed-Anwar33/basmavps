import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     PolicyContent:
 *       type: object
 *       required:
 *         - policyType
 *         - content
 *         - effectiveDate
 *         - locale
 *       properties:
 *         _id:
 *           type: string
 *         policyType:
 *           type: string
 *           enum: [terms, refund, privacy, delivery, cookies, disclaimer]
 *           description: Type of policy
 *         content:
 *           type: object
 *           properties:
 *             sections:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: object
 *                     properties:
 *                       ar:
 *                         type: string
 *                       en:
 *                         type: string
 *                   content:
 *                     type: object
 *                     properties:
 *                       ar:
 *                         type: string
 *                       en:
 *                         type: string
 *                   order:
 *                     type: number
 *                   isActive:
 *                     type: boolean
 *             attachments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   url:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [pdf, doc, docx, image]
 *                   size:
 *                     type: number
 *         effectiveDate:
 *           type: string
 *           format: date
 *         locale:
 *           type: string
 *           enum: [ar, en, both]
 *         revisionNotes:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *         version:
 *           type: number
 *           default: 1
 *         metadata:
 *           type: object
 *           properties:
 *             metaTitle:
 *               type: object
 *               properties:
 *                 ar:
 *                   type: string
 *                 en:
 *                   type: string
 *             metaDescription:
 *               type: object
 *               properties:
 *                 ar:
 *                   type: string
 *                 en:
 *                   type: string
 *             ogImage:
 *               type: string
 *             lastReviewDate:
 *               type: string
 *               format: date
 *             nextReviewDate:
 *               type: string
 *               format: date
 *             legalReviewRequired:
 *               type: boolean
 *               default: true
 *         createdBy:
 *           type: string
 *           ref: Admin
 *         lastEditedBy:
 *           type: string
 *           ref: Admin
 *         lastEditedAt:
 *           type: string
 *           format: date-time
 */

const policyContentSchema = new mongoose.Schema({
  policyType: {
    type: String,
    required: [true, 'Policy type is required'],
    enum: ['terms', 'refund', 'privacy', 'delivery', 'cookies', 'disclaimer'],
    index: true
  },
  content: {
    sections: [{
      id: {
        type: String,
        required: true
      },
      title: {
        ar: { type: String, required: true },
        en: { type: String }
      },
      content: {
        ar: { type: String, required: true },
        en: { type: String }
      },
      order: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    attachments: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'image']
      },
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required'],
    default: Date.now
  },
  locale: {
    type: String,
    enum: ['ar', 'en', 'both'],
    default: 'ar'
  },
  revisionNotes: {
    type: String,
    maxlength: [1000, 'Revision notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  metadata: {
    metaTitle: {
      ar: String,
      en: String
    },
    metaDescription: {
      ar: String,
      en: String
    },
    ogImage: String,
    lastReviewDate: Date,
    nextReviewDate: Date,
    legalReviewRequired: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
policyContentSchema.index({ policyType: 1, status: 1, version: -1 });
policyContentSchema.index({ effectiveDate: -1 });
policyContentSchema.index({ 'metadata.nextReviewDate': 1 });

// Virtual for checking if legal review is overdue
policyContentSchema.virtual('isLegalReviewOverdue').get(function() {
  if (!this.metadata.nextReviewDate) return false;
  return new Date() > this.metadata.nextReviewDate;
});

// Static method to get active policy by type
policyContentSchema.statics.getActivePolicy = function(policyType, locale = 'ar') {
  return this.findOne({
    policyType,
    status: 'published',
    locale: { $in: [locale, 'both'] },
    effectiveDate: { $lte: new Date() }
  }).sort({ version: -1 });
};

// Static method to get all policy versions
policyContentSchema.statics.getPolicyVersions = function(policyType) {
  return this.find({ policyType })
    .sort({ version: -1 })
    .populate('createdBy lastEditedBy', 'name email');
};

// Method to create new version
policyContentSchema.methods.createNewVersion = function(updateData, userId) {
  const PolicyContent = this.constructor;
  const newVersion = new PolicyContent({
    ...this.toObject(),
    _id: undefined,
    version: this.version + 1,
    status: 'draft',
    createdBy: userId,
    lastEditedBy: userId,
    lastEditedAt: new Date(),
    ...updateData
  });
  
  return newVersion.save();
};

// Pre-save middleware to update lastEditedAt
policyContentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastEditedAt = new Date();
  }
  next();
});

const PolicyContent = mongoose.model('PolicyContent', policyContentSchema);

export default PolicyContent;
