import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - total
 *         - currency
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *           unique: true
 *         userId:
 *           type: string
 *           description: User ID (null for guest orders)
 *         guestInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *               title:
 *                 type: object
 *                 properties:
 *                   ar:
 *                     type: string
 *                   en:
 *                     type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *         subtotal:
 *           type: number
 *         tax:
 *           type: number
 *           default: 0
 *         discount:
 *           type: number
 *           default: 0
 *         total:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [SAR, USD]
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, delivered, cancelled]
 *           default: pending
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           default: pending
 *         paymentId:
 *           type: string
 *         deliveryEmailSent:
 *           type: boolean
 *           default: false
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         meta:
 *           type: object
 */

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    sparse: true, // يسمح بـ null values
    required: false, // لن يُطلب في البداية، فقط عند نجاح الدفع
    index: true // فهرس عادي بدلاً من unique لتجنب المشاكل
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow guest orders
  },
  guestInfo: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    }
  },
  // Project details from order form
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional notes cannot exceed 500 characters']
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'pdf'],
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  items: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    title: {
      ar: {
        type: String,
        required: true
      },
      en: {
        type: String,
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      enum: ['SAR', 'USD']
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD'],
    default: 'SAR'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  deliveryEmailSent: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  // Email verification status for checkout (primarily for guest orders)
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // PayPal payment information (additional to contact info)
  paypalInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ orderNumber: 1 }, { sparse: true }); // Sparse index for orderNumber
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'guestInfo.email': 1 });
orderSchema.index({ paymentId: 1 });

// Virtual for customer info
orderSchema.virtual('customer').get(function() {
  if (this.userId && this.populated('userId')) {
    return {
      type: 'user',
      id: this.userId._id,
      name: this.userId.name,
      email: this.userId.email,
      phone: this.userId.phone
    };
  } else if (this.guestInfo && this.guestInfo.email) {
    return {
      type: 'guest',
      name: this.guestInfo.name,
      email: this.guestInfo.email,
      phone: this.guestInfo.phone
    };
  }
  return null;
});

// Pre-validate middleware معطل - رقم الطلب ينشأ فقط عند نجاح الدفع
// orderSchema.pre('validate', async function(next) {
//   // Order number will be generated only when payment succeeds in markAsPaid()
//   next();
// });

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Calculate tax (15% VAT across all currencies; zero for free orders)
    if (this.subtotal > 0) {
      this.tax = Math.round(this.subtotal * 0.15 * 100) / 100;
    } else {
      this.tax = 0;
    }
    
    this.total = this.subtotal + this.tax - this.discount;
  }
  next();
});

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate('items.serviceId');
};

// Static method to find orders by guest email
orderSchema.statics.findByGuestEmail = function(email) {
  return this.find({ 'guestInfo.email': email.toLowerCase() })
    .sort({ createdAt: -1 })
    .populate('items.serviceId');
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    paidOrders: 0,
    pendingOrders: 0
  };
};

// Instance method to mark as paid - إنشاء رقم الطلب عند نجاح الدفع فقط
orderSchema.methods.markAsPaid = function(paymentId) {
  this.status = 'in_progress'; // تغيير حالة الطلب إلى قيد التنفيذ
  this.paymentStatus = 'paid'; // تحديث حالة الدفع التلقائي
  this.paymentId = paymentId; // Now properly stores ObjectId reference
  
  // إنشاء رقم طلب رسمي فقط عند نجاح الدفع
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `BD${year}${month}${day}${hour}${minute}-${randomSuffix}`;
  }
  
  return this.save();
};

// Instance method to mark as delivered
orderSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  this.deliveryEmailSent = true;
  return this.save();
};

// Instance method to mark payment as failed
orderSchema.methods.markPaymentFailed = function(reason) {
  this.paymentStatus = 'failed';
  this.status = 'pending'; // العودة للحالة المعلقة
  if (reason) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `Payment failed: ${reason}`;
  }
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.paymentStatus = 'refunded'; // تحديث حالة الدفع عند الإلغاء
  if (reason) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `Cancelled: ${reason}`;
  }
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
