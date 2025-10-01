import sharp from 'sharp';
import cloudinary from './cloudinary.js';

/**
 * Image optimization utility using Sharp and Cloudinary
 */

// Optimization presets
const OPTIMIZATION_PRESETS = {
  thumbnail: { width: 300, height: 300, quality: 80 },
  small: { width: 600, height: 400, quality: 85 },
  medium: { width: 1200, height: 800, quality: 90 },
  large: { width: 1920, height: 1080, quality: 95 },
  original: { quality: 100 }
};

/**
 * Optimize image using Sharp before uploading to Cloudinary
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} preset - Optimization preset name
 * @returns {Promise<Buffer>} Optimized image buffer
 */
export const optimizeImage = async (imageBuffer, preset = 'medium') => {
  try {
    const config = OPTIMIZATION_PRESETS[preset] || OPTIMIZATION_PRESETS.medium;
    
    let sharpInstance = sharp(imageBuffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Resize if dimensions are specified and image is larger
    if (config.width && config.height) {
      if (metadata.width > config.width || metadata.height > config.height) {
        sharpInstance = sharpInstance.resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    }
    
    // Apply format-specific optimizations
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({ 
        quality: config.quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (metadata.format === 'png') {
      sharpInstance = sharpInstance.png({ 
        quality: config.quality,
        progressive: true,
        compressionLevel: 9
      });
    } else if (metadata.format === 'webp') {
      sharpInstance = sharpInstance.webp({ 
        quality: config.quality,
        effort: 6
      });
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    // Return original buffer if optimization fails
    return imageBuffer;
  }
};

/**
 * Generate multiple optimized versions of an image
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Object containing URLs for different sizes
 */
export const generateImageVariants = async (imageBuffer, filename) => {
  try {
    const variants = {};
    const baseFilename = filename.split('.')[0];
    
    // Generate different sizes
    for (const [preset, config] of Object.entries(OPTIMIZATION_PRESETS)) {
      if (preset === 'original') continue;
      
      const optimizedBuffer = await optimizeImage(imageBuffer, preset);
      
      // Upload to Cloudinary with specific transformation
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'basma-design/optimized',
            public_id: `${baseFilename}_${preset}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(optimizedBuffer);
      });
      
      variants[preset] = {
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes
      };
    }
    
    return variants;
  } catch (error) {
    return {};
  }
};

/**
 * Get optimized image URL from Cloudinary with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;
  
  const transformations = {
    quality,
    fetch_format: format
  };
  
  if (width) transformations.width = width;
  if (height) transformations.height = height;
  if (width && height) {
    transformations.crop = crop;
    transformations.gravity = gravity;
  }
  
  return cloudinary.url(publicId, { transformation: [transformations] });
};

/**
 * Analyze image and suggest optimizations
 * @param {Buffer} imageBuffer - Image buffer to analyze
 * @returns {Promise<Object>} Analysis results and suggestions
 */
export const analyzeImage = async (imageBuffer) => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();
    
    const analysis = {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      size: imageBuffer.length,
      isAnimated: metadata.pages > 1
    };
    
    // Generate suggestions
    const suggestions = [];
    
    // Size suggestions
    if (analysis.size > 2 * 1024 * 1024) { // > 2MB
      suggestions.push({
        type: 'size',
        message: 'Ø§Ù„ØµÙˆØ±Ø© ÙƒØ¨ÙŠØ±Ø© Ø§Ù„Ø­Ø¬Ù…ØŒ ÙŠÙÙ†ØµØ­ Ø¨Ø¶ØºØ·Ù‡Ø§',
        severity: 'warning'
      });
    }
    
    // Dimension suggestions
    if (analysis.width > 2000 || analysis.height > 2000) {
      suggestions.push({
        type: 'dimensions',
        message: 'Ø£Ø¨Ø¹Ø§Ø¯ Ø§Ù„ØµÙˆØ±Ø© ÙƒØ¨ÙŠØ±Ø©ØŒ Ù‚Ø¯ ØªØ­ØªØ§Ø¬ Ù„ØªØµØºÙŠØ±',
        severity: 'info'
      });
    }
    
    // Format suggestions
    if (analysis.format === 'png' && !analysis.hasAlpha) {
      suggestions.push({
        type: 'format',
        message: 'ÙŠÙ…ÙƒÙ† ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø© Ø¥Ù„Ù‰ JPEG Ù„ØªÙˆÙÙŠØ± Ø§Ù„Ù…Ø³Ø§Ø­Ø©',
        severity: 'info'
      });
    }
    
    return {
      analysis,
      suggestions,
      recommendedPreset: analysis.size > 1024 * 1024 ? 'medium' : 'large'
    };
  } catch (error) {
    return {
      analysis: {},
      suggestions: [],
      recommendedPreset: 'medium'
    };
  }
};

export default {
  optimizeImage,
  generateImageVariants,
  getOptimizedImageUrl,
  analyzeImage,
  OPTIMIZATION_PRESETS
};
