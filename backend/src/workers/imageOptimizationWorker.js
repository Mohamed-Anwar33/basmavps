import { parentPort, workerData } from 'worker_threads';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Image optimization worker
 * Handles image resizing, compression, and format conversion
 */

async function optimizeImage(imageData) {
  try {
    const { inputPath, outputPath, options = {} } = imageData;
    
    const {
      width = null,
      height = null,
      quality = 80,
      format = 'jpeg',
      progressive = true,
      removeMetadata = true
    } = options;

    let pipeline = sharp(inputPath);

    // Remove metadata if requested
    if (removeMetadata) {
      pipeline = pipeline.withMetadata(false);
    }

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format-specific optimizations
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({
          quality,
          progressive,
          mozjpeg: true
        });
        break;
      
      case 'png':
        pipeline = pipeline.png({
          quality,
          progressive,
          compressionLevel: 9
        });
        break;
      
      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6
        });
        break;
      
      case 'avif':
        pipeline = pipeline.avif({
          quality,
          effort: 4
        });
        break;
    }

    // Get image info before processing
    const inputStats = await fs.stat(inputPath);
    const inputInfo = await sharp(inputPath).metadata();

    // Process the image
    const outputInfo = await pipeline.toFile(outputPath);
    const outputStats = await fs.stat(outputPath);

    // Calculate compression ratio
    const compressionRatio = ((inputStats.size - outputStats.size) / inputStats.size) * 100;

    return {
      success: true,
      input: {
        path: inputPath,
        size: inputStats.size,
        width: inputInfo.width,
        height: inputInfo.height,
        format: inputInfo.format
      },
      output: {
        path: outputPath,
        size: outputStats.size,
        width: outputInfo.width,
        height: outputInfo.height,
        format: outputInfo.format
      },
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      savedBytes: inputStats.size - outputStats.size
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

async function generateThumbnails(imageData) {
  try {
    const { inputPath, outputDir, sizes = [150, 300, 600] } = imageData;
    const results = [];

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `thumb_${size}.jpg`);
      
      const result = await optimizeImage({
        inputPath,
        outputPath,
        options: {
          width: size,
          height: size,
          quality: 85,
          format: 'jpeg'
        }
      });

      results.push({
        size,
        ...result
      });
    }

    return {
      success: true,
      thumbnails: results
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main worker execution
async function main() {
  try {
    const { jobId, type, data, options } = workerData;
    let result;

    switch (type) {
      case 'image-optimization':
        if (data.generateThumbnails) {
          result = await generateThumbnails(data);
        } else {
          result = await optimizeImage(data);
        }
        break;
      
      default:
        throw new Error(`Unknown image optimization type: ${type}`);
    }

    // Send result back to main thread
    parentPort.postMessage(result);

  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  parentPort.postMessage({
    success: false,
    error: `Uncaught exception: ${error.message}`,
    stack: error.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  parentPort.postMessage({
    success: false,
    error: `Unhandled rejection: ${reason}`,
    promise: promise.toString()
  });
});

// Start the worker
main();