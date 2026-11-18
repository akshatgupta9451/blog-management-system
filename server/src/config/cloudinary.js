import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const { cloudName, apiKey, apiSecret, folder } = env.cloudinary;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // always generate https:// URLs
  });
} else {
  // Not fatal: the API runs without images, and upload requests get a clear 503
  console.warn(
    'Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET). Image uploads are disabled.'
  );
}

export const CLOUDINARY_ROOT_FOLDER = folder;

/**
 * Upload presets, one per kind of image. `transformation` is an *incoming* transformation:
 * Cloudinary applies it before storing, so the stored original is already resized and
 * re-compressed (and stripped of metadata such as EXIF/GPS). Delivery-time optimisation
 * (f_auto, q_auto, responsive widths) is added on top by the client's image URL helper.
 */
export const IMAGE_PRESETS = Object.freeze({
  BLOG_COVER: {
    folder: `${folder}/covers`,
    transformation: [
      // Never upscale; cap the longest side at 2000px, keeping the aspect ratio
      { width: 2000, height: 2000, crop: 'limit' },
      // Visually lossless compression chosen per image
      { quality: 'auto:good' },
    ],
  },
  AVATAR: {
    folder: `${folder}/avatars`,
    transformation: [
      // Square, centred on the face when one is detected
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
    ],
  },
});

export default cloudinary;
