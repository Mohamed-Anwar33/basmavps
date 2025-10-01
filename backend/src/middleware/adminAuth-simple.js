/**
 * 🔧 SIMPLIFIED ADMIN AUTH MIDDLEWARE
 * ==================================
 * نسخة مبسطة من adminAuth لحل مشكلة المصادقة
 */

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const simpleAdminAuth = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'لا يوجد رمز مصادقة، الوصول مرفوض'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // 2. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'basma-design-api',
        audience: 'basma-design-client'
      });
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }
    
    // 3. Simple admin lookup - prioritize username lookup
    let admin;
    try {
      // Primary method: lookup by username (most reliable)
      if (decoded.username) {
        admin = await Admin.findOne({ username: decoded.username }).select('-password').lean();
      }
      
      // Fallback method: lookup by ID if username not available
      if (!admin && decoded.id) {
        admin = await Admin.findById(decoded.id).select('-password').lean();
        
        // Try ObjectId conversion if direct lookup fails
        if (!admin && mongoose.Types.ObjectId.isValid(decoded.id)) {
          admin = await Admin.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password').lean();
        }
      }
      
    } catch (dbError) {
      console.error('Database lookup error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'خطأ في قاعدة البيانات'
      });
    }
    
    // 4. Check if admin exists and is active
    if (!admin) {
      console.log('Admin not found. Token decoded ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير مفعل'
      });
    }
    
    // 5. Set user info and continue
    req.user = {
      id: admin._id,
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
      isActive: admin.isActive
    };
    
    console.log('✅ Simple auth success for:', admin.username);
    next();
    
  } catch (error) {
    console.error('Unexpected error in simpleAdminAuth:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

export { simpleAdminAuth };
