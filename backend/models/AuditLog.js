import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'view', 'login', 'logout', 'error']
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

// Static method to log actions
auditLogSchema.statics.logAction = async function(userId, action, resource, resourceId = null, details = {}, req = null) {
  try {
    const logEntry = new this({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get('User-Agent') || 'unknown'
    });
    
    await logEntry.save();
    return logEntry;
  } catch (error) {
    // Don't throw error to avoid breaking the main operation
    return null;
  }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;