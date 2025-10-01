import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification'
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
    expires: 300 // 5 minutes in seconds
  }
});

// TTL index for automatic cleanup after 5 minutes
emailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Index for efficient queries
emailVerificationSchema.index({ email: 1, type: 1 });
emailVerificationSchema.index({ userId: 1, type: 1 });

// Generate 6-digit verification code
emailVerificationSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Find valid verification code
emailVerificationSchema.statics.findValidCode = async function(email, code, type = 'email_verification') {
  return this.findOne({
    email,
    code,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
};

// Mark code as used
emailVerificationSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  return this.save();
};

// Increment attempts
emailVerificationSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return this.save();
};

// Create the model
const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

// Ensure TTL index is created when the model is first used
EmailVerification.on('index', (err) => {
  if (err) {
    } else {
    }
});

export default EmailVerification;

