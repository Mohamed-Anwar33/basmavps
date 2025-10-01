import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [new, read, replied, archived]
 *           default: new
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         assignedTo:
 *           type: string
 *           description: Admin user ID
 *         repliedAt:
 *           type: string
 *           format: date-time
 *         meta:
 *           type: object
 */

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  meta: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      default: 'website'
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ createdAt: -1 });

// Virtual for assigned admin
contactSchema.virtual('assignedAdmin', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Static method to get statistics
contactSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        newMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        readMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        repliedMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
        },
        urgentMessages: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalMessages: 0,
    newMessages: 0,
    readMessages: 0,
    repliedMessages: 0,
    urgentMessages: 0
  };
};

// Instance method to mark as read
contactSchema.methods.markAsRead = function() {
  if (this.status === 'new') {
    this.status = 'read';
  }
  return this.save();
};

// Instance method to mark as replied
contactSchema.methods.markAsReplied = function() {
  this.status = 'replied';
  this.repliedAt = new Date();
  return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
