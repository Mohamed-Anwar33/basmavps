import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary using CLOUDINARY_URL
// The URL format: cloudinary://api_key:api_secret@cloud_name
// Cloudinary will automatically parse this URL if CLOUDINARY_URL is set
if (process.env.CLOUDINARY_URL) {
  // Explicitly configure cloudinary
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  }

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'order-attachments',
    resource_type: 'auto', // Automatically detect file type (image, video, raw for documents)
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${timestamp}-${originalName}`;
    },
    // Remove allowed_formats to allow all file types
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
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
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Max 5 files per upload
  }
});

/**
 * Upload files for order attachments
 */
export const uploadOrderFiles = async (req, res) => {
  try {
    const uploadMiddleware = upload.array('files', 5);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ Ù…Ù„ÙØ§Øª'
        });
      }

      const uploadedFiles = req.files.map(file => {
        // Determine file type
        let fileType = 'document';
        if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
        } else if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
        }

        return {
          filename: file.filename,
          originalName: file.originalname,
          url: file.path,
          cloudinaryId: file.filename,
          fileType,
          size: file.size,
          uploadedAt: new Date()
        };
      });

      res.json({
        success: true,
        message: `ØªÙ… Ø±ÙØ¹ ${uploadedFiles.length} Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­`,
        data: {
          files: uploadedFiles
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª'
    });
  }
};

/**
 * Delete uploaded file from Cloudinary
 */
export const deleteOrderFile = async (req, res) => {
  try {
    const { cloudinaryId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(cloudinaryId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù…Ù„Ù'
    });
  }
};

