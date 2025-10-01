import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentVersion:
 *       type: object
 *       required:
 *         - contentId
 *         - contentType
 *         - version
 *         - content
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *         contentId:
 *           type: string
 *           description: ID of the original content document
 *         contentType:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *         version:
 *           type: number
 *           description: Version number
 *         content:
 *           type: object
 *           description: Snapshot of content at this version
 *         changes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               oldValue:
 *                 type: object
 *               newValue:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *         createdBy:
 *           type: string
 *           description: User ID who created this version
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *           description: Whether this version is currently active
 */

const contentVersionSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['PageContent', 'HomepageSection', 'Service', 'Media'],
    index: true
  },
  version: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  metadata: {
    comment: String,
    tags: [String],
    size: Number,
    checksum: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
contentVersionSchema.index({ contentId: 1, version: -1 });
contentVersionSchema.index({ contentType: 1, createdAt: -1 });
contentVersionSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for creator details
contentVersionSchema.virtual('creator', {
  ref: 'Admin',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Static method to create new version
contentVersionSchema.statics.createVersion = async function(contentId, contentType, content, changes, createdBy, metadata = {}) {
  // Get the latest version number
  const latestVersion = await this.findOne(
    { contentId, contentType },
    { version: 1 },
    { sort: { version: -1 } }
  );
  
  const newVersion = latestVersion ? latestVersion.version + 1 : 1;
  
  // Deactivate previous active version
  await this.updateMany(
    { contentId, contentType, isActive: true },
    { isActive: false }
  );
  
  // Create new version
  const versionData = {
    contentId,
    contentType,
    version: newVersion,
    content,
    changes,
    createdBy,
    isActive: true,
    metadata
  };
  
  return this.create(versionData);
};

// Static method to get version history
contentVersionSchema.statics.getHistory = function(contentId, contentType, options = {}) {
  const { page = 1, limit = 20, includeContent = false } = options;
  const skip = (page - 1) * limit;
  
  const projection = includeContent ? {} : { content: 0 };
  
  return this.find({ contentId, contentType }, projection)
    .populate('creator', 'name email')
    .sort({ version: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get specific version
contentVersionSchema.statics.getVersion = function(contentId, contentType, version) {
  return this.findOne({ contentId, contentType, version })
    .populate('creator', 'name email');
};

// Static method to get active version
contentVersionSchema.statics.getActiveVersion = function(contentId, contentType) {
  return this.findOne({ contentId, contentType, isActive: true })
    .populate('creator', 'name email');
};

// Static method to restore version
contentVersionSchema.statics.restoreVersion = async function(contentId, contentType, version, restoredBy) {
  const versionToRestore = await this.findOne({ contentId, contentType, version });
  
  if (!versionToRestore) {
    throw new Error('Version not found');
  }
  
  // Create a new version based on the restored content
  const changes = [{
    field: 'restored',
    oldValue: null,
    newValue: `Restored from version ${version}`,
    timestamp: new Date()
  }];
  
  return this.createVersion(
    contentId,
    contentType,
    versionToRestore.content,
    changes,
    restoredBy,
    { restoredFrom: version }
  );
};

// Static method to compare versions
contentVersionSchema.statics.compareVersions = async function(contentId, contentType, version1, version2) {
  const [v1, v2] = await Promise.all([
    this.findOne({ contentId, contentType, version: version1 }),
    this.findOne({ contentId, contentType, version: version2 })
  ]);
  
  if (!v1 || !v2) {
    throw new Error('One or both versions not found');
  }
  
  return {
    version1: { version: v1.version, content: v1.content, createdAt: v1.createdAt },
    version2: { version: v2.version, content: v2.content, createdAt: v2.createdAt },
    changes: v2.changes
  };
};

// Method to calculate content diff
contentVersionSchema.methods.calculateDiff = function(previousContent) {
  const changes = [];
  
  const compareObjects = (obj1, obj2, path = '') => {
    const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field: currentPath,
          oldValue: val1,
          newValue: val2,
          timestamp: new Date()
        });
      }
    }
  };
  
  compareObjects(previousContent, this.content);
  return changes;
};

const ContentVersion = mongoose.model('ContentVersion', contentVersionSchema);

export default ContentVersion;