import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import AuditLog from '../models/AuditLog.js';

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

// Test Cloudinary configuration
// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ${file.mimetype} ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: options.folder || 'blog-covers',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
};

/**
 * Upload blog cover image
 */
export const uploadBlogCover = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('coverImage');
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ù„Ù Ù…Ø±ÙÙˆØ¹'
        });
      }

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'blog-covers',
          public_id: `blog_cover_${Date.now()}`
        });
        
        // Log upload
        if (req.user) {
          await AuditLog.logAction(req.user._id, 'upload', 'blog_cover', null, {
            cloudinary_id: result.public_id,
            url: result.secure_url,
            size: req.file.size
          }, req);
        }

        res.json({
          success: true,
          message: 'ØªÙ… Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­',
          data: {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
          }
        });

      } catch (uploadError) {
        res.status(500).json({
          success: false,
          error: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø© Ø¥Ù„Ù‰ Ø§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ'
        });
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©'
    });
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteBlogCover = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        error: 'Ù…Ø¹Ø±Ù Ø§Ù„ØµÙˆØ±Ø© Ù…Ø·Ù„ÙˆØ¨'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    // Log deletion
    if (req.user) {
      await AuditLog.logAction(req.user._id, 'delete', 'blog_cover', null, {
        cloudinary_id: public_id,
        result: result.result
      }, req);
    }

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©'
    });
  }
};

export { upload };

