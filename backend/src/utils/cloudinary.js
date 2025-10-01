import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env here to avoid ESM import order issues (this runs before server.js dotenv)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, '../../.env');
  dotenv.config({ path: envPath });
} catch (e) {
  // ignore if not available
}

// Robust Cloudinary configuration
// Prefer CLOUDINARY_URL if present; otherwise fall back to individual keys.
(() => {
  try {
    const hasUrl = !!process.env.CLOUDINARY_URL;
    const hasKeys = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

    if (hasUrl) {
      // Manually parse CLOUDINARY_URL to ensure keys are provided
      try {
        const url = process.env.CLOUDINARY_URL;
        // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
        const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
        if (match) {
          const [, apiKey, apiSecret, cloudName] = match;
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
          });
          } else {
          // Fallback: try default config with secure
          cloudinary.config({ secure: true });
          }
      } catch (e) {
        cloudinary.config({ secure: true });
        }
    } else if (hasKeys) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });
      } else {
      // No configuration provided; leave default and uploads will fail clearly
      }
  } catch (err) {
    }
})();

export default cloudinary;

// Ensure configuration is present at runtime (useful before uploads)
export function ensureCloudinaryConfigured() {
  const current = cloudinary.config();
  if (current && current.api_key) {
    return;
  }
  const url = process.env.CLOUDINARY_URL;
  const hasUrl = !!url;
  const hasKeys = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (hasUrl) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, apiKey, apiSecret, cloudName] = match;
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
      return;
    }
  }
  if (hasKeys) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    }
}
