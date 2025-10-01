import mongoose from 'mongoose';

const checkoutEmailVerificationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false  // Made optional to support temp orders
  },
  tempOrderId: {
    type: String,
    required: false,  // For temporary orders that haven't been saved to DB yet
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  serviceId: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes in seconds (aligns with expiresAt)
  }
});

// Validation: At least one of orderId or tempOrderId must be present
checkoutEmailVerificationSchema.pre('validate', function() {
  if (!this.orderId && !this.tempOrderId) {
    this.invalidate('orderId', 'Either orderId or tempOrderId must be provided');
  }
});

// TTL index for automatic cleanup after 10 minutes
checkoutEmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Indexes for efficient lookups
checkoutEmailVerificationSchema.index({ orderId: 1, email: 1, isUsed: 1 });
checkoutEmailVerificationSchema.index({ tempOrderId: 1, email: 1, isUsed: 1 });

// Generate 6-digit verification code
checkoutEmailVerificationSchema.statics.generateCode = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Find valid verification code
checkoutEmailVerificationSchema.statics.findValidCode = async function (orderId, email, code) {
  return this.findOne({
    orderId,
    email: email.toLowerCase(),
    code,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
};

// Mark code as used
checkoutEmailVerificationSchema.methods.markAsUsed = async function () {
  this.isUsed = true;
  return this.save();
};

// Increment attempts
checkoutEmailVerificationSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  return this.save();
};

const CheckoutEmailVerification = mongoose.model('CheckoutEmailVerification', checkoutEmailVerificationSchema);

export default CheckoutEmailVerification;
