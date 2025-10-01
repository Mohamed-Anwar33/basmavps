import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'super_admin'],
    default: 'super_admin'
  },
  permissions: [{
    type: String,
    enum: [
      'users.view', 'users.edit', 'users.delete',
      'orders.view', 'orders.edit', 'orders.delete',
      'services.view', 'services.edit', 'services.delete',
      'blogs.view', 'blogs.edit', 'blogs.delete',
      'contacts.view', 'contacts.edit', 'contacts.delete',
      'settings.view', 'settings.edit',
      'analytics.view',
      'admin.manage'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add refresh token
adminSchema.methods.addRefreshToken = function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

// Remove refresh token
adminSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'users.view', 'users.edit', 'users.delete',
          'orders.view', 'orders.edit', 'orders.delete',
          'services.view', 'services.edit', 'services.delete',
          'blogs.view', 'blogs.edit', 'blogs.delete',
          'contacts.view', 'contacts.edit', 'contacts.delete',
          'settings.view', 'settings.edit',
          'analytics.view',
          'admin.manage'
        ];
        break;
      case 'admin':
        this.permissions = [
          'users.view', 'users.edit', 'users.delete',
          'orders.view', 'orders.edit', 'orders.delete',
          'services.view', 'services.edit', 'services.delete',
          'blogs.view', 'blogs.edit', 'blogs.delete',
          'contacts.view', 'contacts.edit', 'contacts.delete',
          'settings.view', 'settings.edit',
          'analytics.view',
          'admin.manage'
        ];
        break;
      case 'moderator':
        this.permissions = [
          'users.view',
          'orders.view', 'orders.edit',
          'services.view',
          'blogs.view', 'blogs.edit',
          'contacts.view', 'contacts.edit'
        ];
        break;
    }
  }
  next();
});

// Check if admin has permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Find by username or email
adminSchema.statics.findByLogin = function(login) {
  return this.findOne({
    $or: [
      { username: login },
      { email: login.toLowerCase() }
    ]
  });
};

const Admin = mongoose.model('Admin', adminSchema, 'admins');

export default Admin;
