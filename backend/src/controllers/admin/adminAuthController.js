import bcrypt from 'bcryptjs';
import Admin from '../../models/Admin.js';
import AuditLog from '../../models/AuditLog.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt.js';

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Admin authentication endpoints
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø§Ù†'
      });
    }

    // Find admin by username or email
    const admin = await Admin.findByLogin(username).select('+password +refreshTokens');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø©'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…ÙØ¹Ù„'
      });
    }

    // Check password
    const isPasswordValid = await admin.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø©'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      _id: admin._id,
      email: admin.email,
      role: admin.role
    });

    // Add refresh token to admin
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    admin.addRefreshToken(refreshToken, refreshTokenExpiry);
    admin.lastLogin = new Date();
    
    // Use findByIdAndUpdate to avoid version conflicts
    await Admin.findByIdAndUpdate(admin._id, {
      $push: { refreshTokens: { token: refreshToken, expiresAt: refreshTokenExpiry } },
      $set: { lastLogin: new Date() }
    });

    // Log the login
    await AuditLog.logAction(admin._id, 'login', 'admin_auth', null, {
      username: admin.username,
      role: admin.role
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        },
        token: accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/admin/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens issued
 *       401:
 *         description: Invalid or expired refresh token
 */
export const adminRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'لا يوجد رمز تحديث' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'رمز التحديث غير صالح أو منتهي' });
    }

    // Find admin and ensure the refresh token exists and is not expired
    const admin = await Admin.findById(decoded.id).select('+refreshTokens');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const now = new Date();
    const stored = (admin.refreshTokens || []).find(rt => rt.token === refreshToken && (!rt.expiresAt || rt.expiresAt > now));
    if (!stored) {
      return res.status(401).json({ success: false, message: 'رمز التحديث غير صالح أو منتهي' });
    }

    // Rotate refresh token and issue new access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      _id: admin._id,
      email: admin.email,
      role: admin.role
    });
    // Remove the old token and add the new one using atomic operations
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    
    await Admin.findByIdAndUpdate(admin._id, {
      $pull: { refreshTokens: { token: refreshToken } },
      $push: { refreshTokens: { token: newRefreshToken, expiresAt: refreshTokenExpiry } }
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      data: { tokens: { accessToken, refreshToken: newRefreshToken } }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'فشل تحديث الجلسة' });
  }
};

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.user;

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¯ÙŠØ±'
    });
  }
};

/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const adminLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const admin = req.user;

    if (refreshToken && admin) {
      // Remove specific refresh token
      admin.removeRefreshToken(refreshToken);
      await admin.save();
    }

    // Log the logout
    if (admin) {
      await AuditLog.logAction(admin._id, 'logout', 'admin_auth', null, {
        username: admin.username
      }, req);
    }

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬'
    });
  }
};

