import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       required:
 *         - actorId
 *         - action
 *         - collection
 *       properties:
 *         _id:
 *           type: string
 *         actorId:
 *           type: string
 *           description: User ID who performed the action
 *         action:
 *           type: string
 *           enum: [create, update, delete, login, logout, view]
 *         collection:
 *           type: string
 *           description: Database collection affected
 *         documentId:
 *           type: string
 *           description: ID of the affected document
 *         diff:
 *           type: object
 *           description: Changes made (before/after)
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         meta:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 */

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import', 'upload', 'upload_failed', 'security_violation', 'rate_limit_exceeded']
  },
  collectionName: {
    type: String,
    required: true,
    trim: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  diff: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false, // We use custom timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ collectionName: 1 });
auditLogSchema.index({ documentId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actorId: 1, timestamp: -1 });

// Virtual for actor details
auditLogSchema.virtual('actor', {
  ref: 'User',
  localField: 'actorId',
  foreignField: '_id',
  justOne: true
});

// Static method to log action
auditLogSchema.statics.logAction = function(actorId, action, collectionName, documentId = null, diff = null, req = null) {
  const logData = {
    actorId,
    action,
    collectionName,
    documentId,
    diff,
    timestamp: new Date()
  };

  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
  }

  return this.create(logData);
};

// Static method to get logs by user
auditLogSchema.statics.getByUser = function(userId, options = {}) {
  const { page = 1, limit = 50, action, collectionName, startDate, endDate } = options;
  
  const filter = { actorId: userId };
  
  if (action) {
    filter.action = action;
  }
  
  if (collectionName) {
    filter.collectionName = collectionName;
  }
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('actor', 'name email')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get recent activity
auditLogSchema.statics.getRecentActivity = function(limit = 20) {
  return this.find({})
    .populate('actor', 'name email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get statistics
auditLogSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        createActions: {
          $sum: { $cond: [{ $eq: ['$action', 'create'] }, 1, 0] }
        },
        updateActions: {
          $sum: { $cond: [{ $eq: ['$action', 'update'] }, 1, 0] }
        },
        deleteActions: {
          $sum: { $cond: [{ $eq: ['$action', 'delete'] }, 1, 0] }
        },
        loginActions: {
          $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalActions: 0,
    createActions: 0,
    updateActions: 0,
    deleteActions: 0,
    loginActions: 0
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
