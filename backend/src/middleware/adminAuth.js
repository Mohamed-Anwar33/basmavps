import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const adminAuth = async (req, res, next) => {
  try {
    console.log('🔍 adminAuth: Starting middleware execution for:', req.path);
    console.log('🔍 adminAuth: Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔍 adminAuth: Extracted token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø©ØŒ Ø§Ù„ÙˆØµÙˆÙ„ Ù…Ø±ÙÙˆØ¶'
      });
    }

    // Verify token with detailed error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'basma-design-api',
        audience: 'basma-design-client'
      });
      console.log('🔍 adminAuth: Token verified successfully, decoded:', decoded);
    } catch (err) {
      console.log('🔍 adminAuth: JWT verification failed:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Ø§Ù†ØªÙ‡Øª ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø¬Ù„Ø³Ø©ØŒ ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­'
      });
    }

    // Find admin user with enhanced lookup logic
    let admin;
    try {
      console.log('🔍 adminAuth: Looking up admin. Decoded username:', decoded.username, 'Decoded id:', decoded.id);
      
      // Method 1: Try username lookup first (most reliable)
      if (decoded.username) {
        admin = await Admin.findOne({ username: decoded.username }).select('-password').lean();
        console.log('🔍 adminAuth: Username lookup result:', admin ? 'FOUND' : 'NOT FOUND');
      }
      
      // Method 2: Try email lookup if username not in token
      if (!admin && decoded.email) {
        console.log('🔍 adminAuth: Trying email lookup');
        admin = await Admin.findOne({ email: decoded.email }).select('-password').lean();
        console.log('🔍 adminAuth: Email lookup result:', admin ? 'FOUND' : 'NOT FOUND');
      }
      
      // Method 3: Try direct ObjectId lookup
      if (!admin && decoded.id) {
        console.log('🔍 adminAuth: Trying direct ID lookup');
        try {
          admin = await Admin.findById(decoded.id).select('-password').lean();
          console.log('🔍 adminAuth: Direct ID lookup result:', admin ? 'FOUND' : 'NOT FOUND');
        } catch (idError) {
          console.log('🔍 adminAuth: Direct ID lookup failed:', idError.message);
        }
      }
      
      // Method 4: Try with ObjectId constructor
      if (!admin && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        console.log('🔍 adminAuth: Trying ObjectId constructor lookup');
        try {
          admin = await Admin.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password').lean();
          console.log('🔍 adminAuth: ObjectId constructor lookup result:', admin ? 'FOUND' : 'NOT FOUND');
        } catch (objIdError) {
          console.log('🔍 adminAuth: ObjectId constructor lookup failed:', objIdError.message);
        }
      }
      
      // Method 5: Try manual query with _id field
      if (!admin && decoded.id) {
        console.log('🔍 adminAuth: Trying manual _id query');
        try {
          admin = await Admin.findOne({ _id: decoded.id }).select('-password').lean();
          console.log('🔍 adminAuth: Manual _id query result:', admin ? 'FOUND' : 'NOT FOUND');
        } catch (manualError) {
          console.log('🔍 adminAuth: Manual _id query failed:', manualError.message);
        }
      }
      
    } catch (error) {
      console.error('🔍 Admin lookup error:', error);
    }
    
    if (!admin) {
      console.log('🔍 adminAuth: Could not find admin with id:', decoded.id);
      console.log('🔍 adminAuth: Searching in admins collection...');
      
      // Debug: Let's see what admins actually exist
      const allAdmins = await mongoose.connection.db.collection('admins').find({}, {username: 1, _id: 1}).toArray();
      console.log('🔍 adminAuth: Available admins:', allAdmins);
      
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود أو تم حذفه'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…ÙØ¹Ù„'
      });
    }

    req.user = admin;
    console.log('🔍 adminAuth: Setting req.user =', {
      id: admin._id,
      username: admin.username,
      role: admin.role
    });
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­'
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹'
      });
    }

    const roleHierarchy = {
      super_admin: 3,
      admin: 2,
      moderator: 1
    };

    const userLevel = roleHierarchy[req.user.role] || 0;
    const hasPermission = roles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆØ±Ø¯'
      });
    }

    next();
  };
};

// Token verification endpoint
const verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø©'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'basma-design-api',
      audience: 'basma-design-client'
    });
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­ Ø£Ùˆ Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…ÙØ¹Ù„'
      });
    }

    res.json({
      success: true,
      message: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØµØ­ÙŠØ­',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­'
    });
  }
};

export {
  adminAuth,
  requireRole,
  verifyToken
};

