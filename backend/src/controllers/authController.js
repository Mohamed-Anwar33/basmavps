import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import AuditLog from '../models/AuditLog.js';
import { generateTokenPair, verifyRefreshToken, generateSecureToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user (verified by default)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      isVerified: true
    });

    try {
      await user.save();
      // Verify user was actually saved by querying database
      const savedUser = await User.findById(user._id);
      if (savedUser) {
        } else {
        }
    } catch (saveError) {
      throw saveError;
    }

    // Account is now automatically activated - no email verification needed

    // Generate tokens
    const tokens = await generateTokenPair(user._id);

    // Log signup
    await AuditLog.logAction(user._id, 'create', 'user', user._id, {
      action: 'signup',
      email: user.email
    }, req);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens,
        requiresEmailVerification: false
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findByEmail(email).select('+password +refreshTokens');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Email verification check removed - accounts are automatically verified

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Add refresh token to user using safe method
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    
    const updatedUser = await user.updateLoginData(refreshToken, refreshTokenExpiry);

    // Log the login
    await AuditLog.logAction(user._id, 'login', 'auth', null, null, req);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
          preferences: user.preferences
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('💥 [LOGIN] Error occurred:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id).select('+refreshTokens');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      token => token.token === refreshToken && token.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // Replace old refresh token with new one
    user.removeRefreshToken(refreshToken);
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    user.addRefreshToken(newRefreshToken, refreshTokenExpiry);
    await user.save();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
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
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken && user) {
      // Remove specific refresh token
      user.removeRefreshToken(refreshToken);
      await user.save();
    }

    // Log the logout
    if (user) {
      await AuditLog.logAction(user._id, 'logout', 'auth', null, null, req);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'إعادة تعيين كلمة المرور - Password Reset',
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl,
          expiresIn: '1 hour'
        }
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Password reset request failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Clear all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();

    // Log password reset
    await AuditLog.logAction(user._id, 'update', 'users', user._id, 
      { action: 'password_reset' }, req);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
          phone: user.phone,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

/**
 * @swagger
 * /api/auth/activate:
 *   get:
 *     summary: Activate user account with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Activation token from email
 *     responses:
 *       200:
 *         description: Account activated successfully
 *       400:
 *         description: Invalid or expired token
 */
export const activateAccount = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Activation token is required'
      });
    }

    // Debug: Check all email verification records
    const allRecords = await EmailVerification.find({ type: 'email_verification' });
    if (allRecords.length > 0) {
      }
    
    // Find the verification record
    const emailVerification = await EmailVerification.findOne({
      code: token,
      type: 'email_verification'
    });
    
    if (!emailVerification) {
      return res.status(400).json({
        success: false,
        error: 'رابط التفعيل غير صحيح أو منتهي الصلاحية'
      });
    }

    // Check if token is expired (24 hours)
    const tokenAge = new Date() - emailVerification.createdAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(400).json({
        success: false,
        error: 'Activation token has expired'
      });
    }

    // Find and activate the user
    const user = await User.findById(emailVerification.userId);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already activated'
      });
    }

    // Activate the user
    user.isEmailVerified = true;
    await user.save();

    // Delete the verification record
    await EmailVerification.deleteOne({ _id: emailVerification._id });

    // Log activation
    await AuditLog.logAction(user._id, 'update', 'user', user._id, {
      action: 'account_activation',
      email: user.email
    }, req);

    res.json({
      success: true,
      message: 'تم تفعيل الحساب بنجاح. يمكنك الآن تسجيل الدخول.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Account activation failed'
    });
  }
};

// Aliases for compatibility
export const getCurrentUser = getMe;
export const refreshToken = refresh;

