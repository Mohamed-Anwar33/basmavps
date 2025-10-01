import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import Media from '../models/Media.js';
import AuditLog from '../models/AuditLog.js';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,application/pdf').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints
 */

/**
 * Generate unique filename
 */
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const ext = path.extname(originalName);
  return `${timestamp}-${random}${ext}`;
};

/**
 * Upload file to S3
 */
const uploadToS3 = async (file, folder = 'general') => {
  const fileName = generateFileName(file.originalname);
  const key = `${folder}/${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return {
    url: result.Location,
    key: result.Key,
    fileName
  };
};

/**
 * Generate thumbnail for images
 */
const generateThumbnail = async (file, folder = 'general') => {
  if (!file.mimetype.startsWith('image/')) {
    return null;
  }

  // For now, we'll use the same image as thumbnail
  // In production, you might want to use Sharp or similar to resize
  const fileName = `thumb_${generateFileName(file.originalname)}`;
  const key = `${folder}/thumbnails/${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * @swagger
 * /api/uploads/single:
 *   post:
 *     summary: Upload single file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 default: general
 *               alt_ar:
 *                 type: string
 *               alt_en:
 *                 type: string
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 */
export const uploadSingle = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('file');
    
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
          error: 'No file uploaded'
        });
      }

      const { folder = 'general', alt_ar, alt_en, tags } = req.body;

      try {
        // Upload to S3
        const { url, key, fileName } = await uploadToS3(req.file, folder);
        
        // Generate thumbnail for images
        const thumbnailUrl = await generateThumbnail(req.file, folder);

        // Save to database
        const media = new Media({
          filename: fileName,
          originalName: req.file.originalname,
          url,
          thumbnailUrl,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploaderId: req.user._id,
          alt: {
            ar: alt_ar,
            en: alt_en
          },
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          meta: {
            folder,
            s3Key: key
          }
        });

        await media.save();

        // Log upload
        await AuditLog.logAction(req.user._id, 'create', 'media', media._id, {
          filename: fileName,
          size: req.file.size,
          mimeType: req.file.mimetype
        }, req);

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            id: media._id,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            filename: media.filename,
            originalName: media.originalName,
            size: media.size,
            mimeType: media.mimeType
          }
        });

      } catch (uploadError) {
        res.status(500).json({
          success: false,
          error: 'Failed to upload file to storage'
        });
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
};

/**
 * @swagger
 * /api/uploads/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 default: general
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
export const uploadMultiple = async (req, res) => {
  try {
    const uploadMiddleware = upload.array('files', 10); // Max 10 files
    
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
          error: 'No files uploaded'
        });
      }

      const { folder = 'general' } = req.body;
      const uploadedFiles = [];
      const errors = [];

      for (const file of req.files) {
        try {
          // Upload to S3
          const { url, key, fileName } = await uploadToS3(file, folder);
          
          // Generate thumbnail for images
          const thumbnailUrl = await generateThumbnail(file, folder);

          // Save to database
          const media = new Media({
            filename: fileName,
            originalName: file.originalname,
            url,
            thumbnailUrl,
            size: file.size,
            mimeType: file.mimetype,
            uploaderId: req.user._id,
            meta: {
              folder,
              s3Key: key
            }
          });

          await media.save();
          uploadedFiles.push({
            id: media._id,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            filename: media.filename,
            originalName: media.originalName,
            size: media.size,
            mimeType: media.mimeType
          });

        } catch (fileError) {
          errors.push({
            filename: file.originalname,
            error: fileError.message
          });
        }
      }

      // Log upload
      await AuditLog.logAction(req.user._id, 'create', 'media', null, {
        action: 'bulk_upload',
        uploaded: uploadedFiles.length,
        errors: errors.length
      }, req);

      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: {
          files: uploadedFiles,
          errors
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
};

/**
 * @swagger
 * /api/uploads/media:
 *   get:
 *     summary: Get media library
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video, audio, pdf, document]
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media retrieved successfully
 */
export const getMedia = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, folder, search } = req.query;

    let media;
    if (search) {
      media = await Media.search(search, { page, limit, type, folder });
    } else if (type) {
      media = await Media.findByType(type, { page, limit, folder });
    } else {
      const filter = { isPublic: true };
      if (folder) filter['meta.folder'] = folder;

      const skip = (page - 1) * limit;
      media = await Media.find(filter)
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Media.countDocuments({
      isPublic: true,
      ...(folder && { 'meta.folder': folder }),
      ...(type && { mimeType: new RegExp(`^${type}/`) }),
      ...(search && {
        $or: [
          { originalName: { $regex: search, $options: 'i' } },
          { 'alt.ar': { $regex: search, $options: 'i' } },
          { 'alt.en': { $regex: search, $options: 'i' } }
        ]
      })
    });

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve media'
    });
  }
};

/**
 * @swagger
 * /api/uploads/media/{id}:
 *   delete:
 *     summary: Delete media file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 */
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    // Check if user owns the media or is admin
    const isOwner = media.uploaderId.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete from S3
    if (media.meta.s3Key) {
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: media.meta.s3Key
        }).promise();
      } catch (s3Error) {
        }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    // Log deletion
    await AuditLog.logAction(req.user._id, 'delete', 'media', id, {
      filename: media.filename,
      originalName: media.originalName
    }, req);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete media'
    });
  }
};

