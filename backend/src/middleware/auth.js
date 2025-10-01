import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('+refreshTokens');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Attach user to request
      req.user = user;
      req.token = token;
      
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      
      if (user) {

        req.user = user;
        req.token = token;
      } else {

        req.user = null;
      }
    } catch (tokenError) {

      req.user = null;
    }
    
    next();
  } catch (error) {

    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      AuditLog.logAction(
        req.user._id,
        'unauthorized_access',
        'authorization',
        null,
        { requiredRoles: roles, userRole: req.user.role },
        req
      ).catch(console.error);

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(requiredRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Admin authentication middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Admin authentication middleware (alias for requireAdmin)
 */
export const adminAuth = [authenticate, requireAdmin];

/**
 * Alias exports for backward compatibility
 */
export const requireAuth = authenticate;
export const requireRole = (roles) => authorize(...roles);

/**
 * Super admin authentication middleware
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }

  next();
};

/**
 * Middleware to check if user owns resource or is admin
 */
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admin can access any resource
    if (['admin', 'superadmin'].includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params.userId || req.body[resourceUserIdField] || req.query.userId;
    
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  };
};

