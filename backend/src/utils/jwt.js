import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT utility functions for token generation and verification
 */

// Generate access token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    issuer: 'basma-design-api',
    audience: 'basma-design-client'
  });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'basma-design-api',
    audience: 'basma-design-client'
  });
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'basma-design-api',
      audience: 'basma-design-client'
    });
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'basma-design-api',
      audience: 'basma-design-client'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Generate token pair
export const generateTokenPair = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

// Generate secure random token for password reset
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash refresh token for storage
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Verify hashed token
export const verifyHashedToken = (token, hashedToken) => {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === hashedToken;
};
