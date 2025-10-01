import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - currency
 *         - provider
 *       properties:
 *         _id:
 *           type: string
 *         orderId:
 *           type: string
 *           description: Associated order ID
 *         userId:
 *           type: string
 *           description: User ID (null for guest payments)
 *         provider:
 *           type: string
 *           enum: [stripe, paypal]
 *         providerPaymentId:
 *           type: string
 *           description: Payment ID from the provider
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [SAR, USD]
 *         status:
 *           type: string
 *           enum: [pending, processing, succeeded, failed, cancelled, refunded]
 *         paymentMethod:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             last4:
 *               type: string
 *             brand:
 *               type: string
 *         providerResponse:
 *           type: object
 *           description: Raw response from payment provider
 *         failureReason:
 *           type: string
 *         refundAmount:
 *           type: number
 *         refundedAt:
 *           type: string
 *           format: date-time
 *         meta:
 *           type: object
 */

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false, // Allow null for temporary payments
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow guest payments
  },
  provider: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal']
  },
  providerPaymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet', 'other']
    },
    last4: String,
    brand: String,
    country: String
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundedAt: {
    type: Date,
    default: null
  },
  meta: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    webhookReceived: {
      type: Boolean,
      default: false
    },
    webhookReceivedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Don't expose sensitive provider response data
      if (ret.providerResponse) {
        delete ret.providerResponse.client_secret;
        delete ret.providerResponse.payment_method;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ providerPaymentId: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for order details
paymentSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true
});

// Static method to find by provider payment ID
paymentSchema.statics.findByProviderPaymentId = function(providerPaymentId) {
  return this.findOne({ providerPaymentId });
};

// Static method to find successful payments
paymentSchema.statics.findSuccessful = function(startDate, endDate) {
  const filter = { status: 'succeeded' };
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(filter).sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(startDate, endDate) {
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
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalRefunded: { $sum: '$refundAmount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    totalRefunded: 0,
    averageAmount: 0
  };
};

// Instance method to mark as succeeded
paymentSchema.methods.markAsSucceeded = function(providerResponse = {}) {
  this.status = 'succeeded';
  this.providerResponse = { ...this.providerResponse, ...providerResponse };
  
  // Extract payment method info if available
  if (providerResponse.payment_method) {
    const pm = providerResponse.payment_method;
    this.paymentMethod = {
      type: pm.type || 'card',
      last4: pm.card?.last4,
      brand: pm.card?.brand,
      country: pm.card?.country
    };
  }
  
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markAsFailed = function(reason, providerResponse = {}) {
  this.status = 'failed';
  this.failureReason = reason;
  this.providerResponse = { ...this.providerResponse, ...providerResponse };
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(amount, reason) {
  if (this.status !== 'succeeded') {
    throw new Error('Can only refund successful payments');
  }
  
  if (amount > this.amount - this.refundAmount) {
    throw new Error('Refund amount exceeds available amount');
  }
  
  this.refundAmount += amount;
  this.refundedAt = new Date();
  
  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  }
  
  if (reason) {
    this.meta.refundReason = reason;
  }
  
  return this.save();
};

// Instance method to mark webhook as received
paymentSchema.methods.markWebhookReceived = function() {
  this.meta.webhookReceived = true;
  this.meta.webhookReceivedAt = new Date();
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
