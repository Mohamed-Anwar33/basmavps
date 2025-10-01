import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';

/**
 * @swagger
 * tags:
 *   name: Email Verification
 *   description: Email verification endpoints
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with code
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 6-digit verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 *       401:
 *         description: Unauthorized
 */
export const verifyEmail = async (req, res) => {
  try {
    // Email verification system is canceled per latest product decision.
    // Return success without requiring any code.
    return res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ù†Ø¸Ø§Ù… ØªÙØ¹ÙŠÙ„/Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ. Ø­Ø³Ø§Ø¨Ùƒ Ù…ÙØ¹Ù„ ÙˆÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©.'
    });

    const { code } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Find valid verification code
    const verification = await EmailVerification.findValidCode(userEmail, code, 'email_verification');
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // Check if code belongs to the current user
    if (verification.userId.toString() !== userId.toString()) {
      await verification.incrementAttempts();
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Mark code as used
    await verification.markAsUsed();

    // Update user email verification status
    await User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    // Log verification
    await AuditLog.logAction(userId, 'update', 'user', userId, {
      action: 'email_verified',
      email: userEmail
    }, req);

    // Send welcome email after verification
    try {
      await sendEmail({
        to: userEmail,
        template: 'welcome',
        data: { name: req.user.name }
      });
    } catch (emailError) {
      }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Email verification failed'
    });
  }
};

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification code
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification code sent
 *       400:
 *         description: Email already verified or rate limited
 *       401:
 *         description: Unauthorized
 */
export const resendVerificationCode = async (req, res) => {
  try {
    // Email verification system is canceled per latest product decision.
    // Do not send any email; just return success with a clear message to the client.
    return res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ù†Ø¸Ø§Ù… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯. Ù„Ø§ Ø­Ø§Ø¬Ø© Ù„Ø¥Ø±Ø³Ø§Ù„ Ø±Ù…Ø² â€” ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ø¨Ø§Ø´Ø±Ø©.'
    });

    const userId = req.user._id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    // Check if email is already verified
    if (req.user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Check for recent verification attempts (rate limiting)
    const recentAttempt = await EmailVerification.findOne({
      userId,
      type: 'email_verification',
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) } // 2 minutes
    });

    if (recentAttempt) {
      return res.status(400).json({
        success: false,
        error: 'Please wait 2 minutes before requesting a new code'
      });
    }

    // Invalidate old codes
    await EmailVerification.updateMany(
      { userId, type: 'email_verification', isUsed: false },
      { isUsed: true }
    );

    // Generate new verification code
    const verificationCode = EmailVerification.generateCode();
    
    // Save new verification code
    const emailVerification = new EmailVerification({
      userId,
      email: userEmail,
      code: verificationCode,
      type: 'email_verification'
    });
    
    await emailVerification.save();

    // Send verification email
    try {
      await sendEmail({
        to: userEmail,
        template: 'email-verification',
        data: { 
          name: userName,
          code: verificationCode
        }
      });

      // Log resend
      await AuditLog.logAction(userId, 'create', 'email_verification', emailVerification._id, {
        action: 'resend_verification_code',
        email: userEmail
      }, req);

      res.json({
        success: true,
        message: 'Verification code sent to your email'
      });

    } catch (emailError) {
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification code'
    });
  }
};

/**
 * @swagger
 * /api/auth/verification-status:
 *   get:
 *     summary: Get email verification status
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved
 *       401:
 *         description: Unauthorized
 */
export const getVerificationStatus = async (req, res) => {
  try {
    const user = req.user;

    // Get pending verification if exists
    let pendingVerification = null;
    if (!user.isEmailVerified) {
      pendingVerification = await EmailVerification.findOne({
        userId: user._id,
        type: 'email_verification',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).select('expiresAt attempts');
    }

    res.json({
      success: true,
      data: {
        isEmailVerified: user.isEmailVerified,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
        pendingVerification: pendingVerification ? {
          expiresAt: pendingVerification.expiresAt,
          attempts: pendingVerification.attempts,
          maxAttempts: 5
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status'
    });
  }
};

