/**
 * Payment Security Middleware - Ø·Ø¨Ù‚Ø© Ø§Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ© Ù„Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª
 * ØªÙ…Ù†Ø¹ Ø§Ù„ØªÙ„Ø§Ø¹Ø¨ ÙˆØ§Ù„ÙˆØµÙˆÙ„ ØºÙŠØ± Ø§Ù„Ù…ØµØ±Ø­ Ø¨Ù‡ Ù„ØµÙØ­Ø§Øª Ø§Ù„Ù†Ø¬Ø§Ø­
 */

import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

/**
 * Prevent Direct Success Page Access
 * Ù…Ù†Ø¹ Ø§Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ù„ØµÙØ­Ø© Ø§Ù„Ù†Ø¬Ø§Ø­ Ø¨Ø¯ÙˆÙ† Ø¯ÙØ¹ Ø­Ù‚ÙŠÙ‚ÙŠ
 */
export const preventDirectSuccessAccess = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Ù…Ø¹Ø±Ù Ø§Ù„Ø¬Ù„Ø³Ø© Ù…Ø·Ù„ÙˆØ¨'
      });
    }

    // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø¯ÙØ¹Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
    const payment = await Payment.findOne({ 
      providerPaymentId: session_id 
    }).populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø¯ÙØ¹Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
      });
    }

    // ðŸ”’ SECURITY CHECK: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¯ÙØ¹Ø©
    const isValidPayment = payment.status === 'succeeded' && 
                          payment.meta?.webhookConfirmed === true;

    if (!isValidPayment) {
      return res.status(403).json({
        success: false,
        error: 'Ø§Ù„Ø¯ÙØ¹Ø© Ù„Ù… ÙŠØªÙ… ØªØ£ÙƒÙŠØ¯Ù‡Ø§ Ø¨Ø¹Ø¯. Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±.',
        status: payment.status,
        webhookConfirmed: payment.meta?.webhookConfirmed || false
      });
    }

    // Ø¥Ø¶Ø§ÙØ© Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¯ÙØ¹Ø© Ù„Ù„Ø·Ù„Ø¨
    req.payment = payment;
    req.order = payment.orderId;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¯ÙØ¹Ø©'
    });
  }
};

// Memory cache Ù„ØªØªØ¨Ø¹ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª (ÙÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ø³ØªØ®Ø¯Ù… Redis)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 Ø¯Ù‚Ø§Ø¦Ù‚
const MAX_ATTEMPTS = 15; // Ø­Ø¯ Ø£Ù‚ØµÙ‰ 15 Ù…Ø­Ø§ÙˆÙ„Ø© (Ù„Ù„Ø³Ù…Ø§Ø­ Ø¨polling Ø£Ø·ÙˆÙ„)

/**
 * Rate Limit Payment Verification Attempts
 * ØªØ­Ø¯ÙŠØ¯ Ø¹Ø¯Ø¯ Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¯ÙØ¹ Ù„Ù…Ù†Ø¹ Ø§Ù„Ù‡Ø¬Ù…Ø§Øª
 */
export const rateLimitPaymentVerification = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    const cacheKey = `payment_verify_${clientIP}`;
    const now = Date.now();
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©
    let attempts = rateLimitCache.get(cacheKey) || { count: 0, firstAttempt: now };
    
    // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¹Ø¯Ø§Ø¯ Ø¥Ø°Ø§ Ø§Ù†ØªÙ‡Øª ÙØªØ±Ø© Ø§Ù„Ù†Ø§ÙØ°Ø©
    if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
      attempts = { count: 0, firstAttempt: now };
    }
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù‚Ø¨Ù„ Ø§Ù„Ø²ÙŠØ§Ø¯Ø©
    if (attempts.count >= MAX_ATTEMPTS) {
      // Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¹Ø¯Ø§Ø¯ Ù„Ù„Ø³Ù…Ø§Ø­ Ø¨Ù…Ø­Ø§ÙˆÙ„Ø© ÙˆØ§Ø­Ø¯Ø© Ø¥Ø¶Ø§ÙÙŠØ© ÙƒÙ„ Ø¯Ù‚ÙŠÙ‚Ø©
      const timeSinceFirst = now - attempts.firstAttempt;
      const minutesPassed = Math.floor(timeSinceFirst / (60 * 1000));
      
      if (minutesPassed > 0) {
        // Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ù…Ø­Ø§ÙˆÙ„Ø© Ø¥Ø¶Ø§ÙÙŠØ© ÙƒÙ„ Ø¯Ù‚ÙŠÙ‚Ø© Ø¨Ø¹Ø¯ Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰
        attempts.count = MAX_ATTEMPTS - 1;
        attempts.firstAttempt = now - (minutesPassed * 60 * 1000);
        rateLimitCache.set(cacheKey, attempts);
      } else {
        return res.status(429).json({
          success: false,
          error: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª. Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹.',
          retryAfter: 60 // Ø§Ù†ØªØ¸Ø§Ø± Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ§Ø­Ø¯Ø©
        });
      }
    }
    
    // Ø²ÙŠØ§Ø¯Ø© Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚
    attempts.count++;
    attempts.lastAttempt = now;
    rateLimitCache.set(cacheKey, attempts);
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Log Suspicious Payment Activities
 * ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø© ÙÙŠ Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª
 */
export const logSuspiciousActivity = async (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(data) {
      // ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø©
      if (data && !data.success) {
        }
      
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Validate Payment Amount
 * Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ù…Ø¨Ù„Øº Ø§Ù„Ø¯ÙØ¹Ø© ÙˆÙ…Ø·Ø§Ø¨Ù‚ØªÙ‡ Ù„Ù„Ø·Ù„Ø¨
 */
export const validatePaymentAmount = async (payment, order) => {
  try {
    if (!payment || !order) {
      return false;
    }

    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ù…Ø·Ø§Ø¨Ù‚Ø© Ø§Ù„Ù…Ø¨Ù„Øº
    const paymentAmount = parseFloat(payment.amount);
    const orderTotal = parseFloat(order.total);
    
    // Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨ÙØ§Ø±Ù‚ ØµØºÙŠØ± Ù„Ù„ØªÙ‚Ø±ÙŠØ¨
    const tolerance = 0.01;
    const amountMatches = Math.abs(paymentAmount - orderTotal) <= tolerance;
    
    if (!amountMatches) {
      }
    
    return amountMatches;
  } catch (error) {
    return false;
  }
};

export default {
  preventDirectSuccessAccess,
  rateLimitPaymentVerification,
  logSuspiciousActivity,
  validatePaymentAmount
};

