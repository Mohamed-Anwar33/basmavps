import Media from '../../models/Media.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import cloudinary from '../../utils/cloudinary.js';
import { optimizeImage, analyzeImage, generateImageVariants } from '../../utils/imageOptimizer.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure multer for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'basma-design/admin-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…'), false);
    }
  }
});

// Get all media files
export const getMedia = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      folder, 
      search 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      folder
    };

    let media;
    let total;

    if (search) {
      media = await Media.search(search, options);
      total = await Media.countDocuments({
        isPublic: true,
        $or: [
          { originalName: { $regex: search, $options: 'i' } },
          { 'alt.ar': { $regex: search, $options: 'i' } },
          { 'alt.en': { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    } else {
      media = await Media.findByType(type || 'all', options);
      
      const filter = { isPublic: true };
      if (type && type !== 'all') {
        switch (type) {
          case 'image':
            filter.mimeType = /^image\//;
            break;
          case 'video':
            filter.mimeType = /^video\//;
            break;
          case 'audio':
            filter.mimeType = /^audio\//;
            break;
          case 'pdf':
            filter.mimeType = 'application/pdf';
            break;
        }
      }
      if (folder) {
        filter['meta.folder'] = folder;
      }
      
      total = await Media.countDocuments(filter);
    }

    res.json({
      success: true,
      data: {
        media,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ù„ÙØ§Øª Ø§Ù„ÙˆØ³Ø§Ø¦Ø·'
    });
  }
};

// Upload media files
export const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ Ù…Ù„ÙØ§Øª'
      });
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      const mediaData = {
        filename: file.filename,
        originalName: file.originalname,
        url: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploaderId: req.admin.id,
        isPublic: true,
        meta: {
          folder: req.body.folder || 'general'
        }
      };

      // Add dimensions for images
      if (file.mimetype.startsWith('image/') && file.width && file.height) {
        mediaData.meta.dimensions = {
          width: file.width,
          height: file.height
        };
      }

      // Generate thumbnail URL for images
      if (file.mimetype.startsWith('image/')) {
        mediaData.thumbnailUrl = cloudinary.url(file.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        });
        
        // Add optimization metadata
        mediaData.meta.optimized = true;
        mediaData.meta.variants = {
          thumbnail: mediaData.thumbnailUrl,
          original: file.path
        };
      }

      const media = new Media(mediaData);
      await media.save();
      uploadedMedia.push(media);
    }

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'CREATE',
      resource: 'Media',
      details: `Uploaded ${uploadedMedia.length} media files`,
      metadata: { 
        filesCount: uploadedMedia.length,
        fileTypes: uploadedMedia.map(m => m.mimeType)
      }
    });

    res.json({
      success: true,
      message: `ØªÙ… Ø±ÙØ¹ ${uploadedMedia.length} Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­`,
      data: uploadedMedia
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª'
    });
  }
};

// Get single media file
export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id).populate('uploader', 'name email');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ù…Ù„Ù'
    });
  }
};

// Update media metadata
export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt, tags, folder } = req.body;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    // Update metadata
    if (alt) media.alt = alt;
    if (tags) media.tags = tags;
    if (folder) media.meta.folder = folder;

    await media.save();

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'Media',
      resourceId: media._id,
      details: 'Updated media metadata',
      metadata: { filename: media.filename }
    });

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­',
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù„Ù'
    });
  }
};

// Delete media file
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    // Delete from Cloudinary if it exists
    if (media.url.includes('cloudinary.com')) {
      try {
        const publicId = media.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'DELETE',
      resource: 'Media',
      resourceId: media._id,
      details: 'Deleted media file',
      metadata: { filename: media.filename, originalName: media.originalName }
    });

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù…Ù„Ù'
    });
  }
};

// Bulk delete media files
export const bulkDeleteMedia = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ÙŠØ¬Ø¨ ØªØ­Ø¯ÙŠØ¯ Ù…Ù„ÙØ§Øª Ù„Ù„Ø­Ø°Ù'
      });
    }

    const media = await Media.find({ _id: { $in: mediaIds } });

    // Delete from Cloudinary
    const cloudinaryDeletions = media.map(async (file) => {
      if (file.url.includes('cloudinary.com')) {
        try {
          const publicId = file.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          }
      }
    });

    await Promise.all(cloudinaryDeletions);

    // Delete from database
    const result = await Media.deleteMany({ _id: { $in: mediaIds } });

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'DELETE',
      resource: 'Media',
      details: `Bulk deleted ${result.deletedCount} media files`,
      metadata: { deletedCount: result.deletedCount, mediaIds }
    });

    res.json({
      success: true,
      message: `ØªÙ… Ø­Ø°Ù ${result.deletedCount} Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ù…Ù„ÙØ§Øª'
    });
  }
};

// Get media usage
export const getMediaUsage = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    res.json({
      success: true,
      data: {
        usage: media.meta.usage || [],
        usageCount: (media.meta.usage || []).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù„Ù'
    });
  }
};

// Bulk update media files
export const bulkUpdateMedia = async (req, res) => {
  try {
    const { mediaIds, updates } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ÙŠØ¬Ø¨ ØªØ­Ø¯ÙŠØ¯ Ù…Ù„ÙØ§Øª Ù„Ù„ØªØ­Ø¯ÙŠØ«'
      });
    }

    const updateData = {};
    
    // Handle folder update
    if (updates.folder) {
      updateData['meta.folder'] = updates.folder;
    }
    
    // Handle tags update
    if (updates.tags && Array.isArray(updates.tags)) {
      updateData.tags = updates.tags;
    }

    // Handle alt text update
    if (updates.alt) {
      updateData.alt = updates.alt;
    }

    const result = await Media.updateMany(
      { _id: { $in: mediaIds } },
      { $set: updateData }
    );

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'Media',
      details: `Bulk updated ${result.modifiedCount} media files`,
      metadata: { 
        updatedCount: result.modifiedCount, 
        mediaIds,
        updates 
      }
    });

    res.json({
      success: true,
      message: `ØªÙ… ØªØ­Ø¯ÙŠØ« ${result.modifiedCount} Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù„ÙØ§Øª'
    });
  }
};

// Analyze media file for optimization suggestions
export const analyzeMediaOptimization = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    // Only analyze images
    if (!media.mimeType.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'ÙŠÙ…ÙƒÙ† ØªØ­Ù„ÙŠÙ„ Ø§Ù„ØµÙˆØ± ÙÙ‚Ø·'
      });
    }

    // Fetch image from URL for analysis
    const response = await fetch(media.url);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    const analysis = await analyzeImage(imageBuffer);

    res.json({
      success: true,
      data: {
        media: {
          id: media._id,
          filename: media.filename,
          size: media.size,
          dimensions: media.meta.dimensions
        },
        ...analysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ù„Ù'
    });
  }
};

// Optimize existing media file
export const optimizeExistingMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { preset = 'medium' } = req.body;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯'
      });
    }

    // Only optimize images
    if (!media.mimeType.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'ÙŠÙ…ÙƒÙ† ØªØ­Ø³ÙŠÙ† Ø§Ù„ØµÙˆØ± ÙÙ‚Ø·'
      });
    }

    // Fetch original image
    const response = await fetch(media.url);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Generate optimized variants
    const variants = await generateImageVariants(imageBuffer, media.filename);
    
    // Update media record with variants
    media.meta.variants = variants;
    media.meta.optimized = true;
    await media.save();

    // Create audit log
    await createAuditLog({
      adminId: req.admin.id,
      action: 'UPDATE',
      resource: 'Media',
      resourceId: media._id,
      details: 'Optimized media file with variants',
      metadata: { 
        filename: media.filename,
        variantsGenerated: Object.keys(variants).length
      }
    });

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        media,
        variants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ù„Ù'
    });
  }
};
