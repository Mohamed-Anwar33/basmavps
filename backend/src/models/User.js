import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [user, editor, admin, superadmin]
 *           default: user
 *         isVerified:
 *           type: boolean
 *           default: false
 *         avatar:
 *           type: string
 *           description: Avatar image URL
 *         phone:
 *           type: string
 *           description: Phone number
 *         preferences:
 *           type: object
 *           properties:
 *             language:
 *               type: string
 *               enum: [ar, en]
 *               default: ar
 *             currency:
 *               type: string
 *               enum: [SAR, USD]
 *               default: SAR
 *             notifications:
 *               type: boolean
 *               default: true
 *         meta:
 *           type: object
 *           description: Additional user metadata
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         refreshTokens:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         passwordResetToken:
 *           type: string
 *         passwordResetExpires:
 *           type: string
 *           format: date-time
 *         emailVerificationToken:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'admin', 'superadmin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: {
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    currency: {
      type: String,
      enum: ['SAR', 'USD'],
      default: 'SAR'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ 'refreshTokens.expiresAt': 1 });

// Virtual for user's orders
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Clean up expired refresh tokens before saving
userSchema.pre('save', function(next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );
  }
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = function(token, expiresAt) {
  // Remove old tokens for this user (keep max 5 active sessions)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }
  
  this.refreshTokens.push({
    token: token,
    expiresAt: expiresAt,
    createdAt: new Date()
  });
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(
    refreshToken => refreshToken.token !== token
  );
};

// Instance method to safely update login data (handles version conflicts)
userSchema.methods.updateLoginData = async function(refreshToken, refreshTokenExpiry) {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Get fresh copy of user
      const freshUser = await this.constructor.findById(this._id).select('+refreshTokens');
      if (!freshUser) {
        throw new Error('User not found');
      }
      
      // Update the fresh copy
      freshUser.addRefreshToken(refreshToken, refreshTokenExpiry);
      freshUser.lastLogin = new Date();
      
      // Try to save
      await freshUser.save();
      return freshUser;
      
    } catch (error) {
      if (error.name === 'VersionError' && retries < maxRetries - 1) {
        retries++;
        console.log(`⚠️ [USER] Version conflict, retry ${retries}/${maxRetries}`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      throw error;
    }
  }
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = {
    user: 0,
    editor: 1,
    admin: 2,
    superadmin: 3
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find admins
userSchema.statics.findAdmins = function() {
  return this.find({ role: { $in: ['admin', 'superadmin'] } });
};

const User = mongoose.model('User', userSchema);

export default User;
