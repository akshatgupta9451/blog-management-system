import cloudinary, {
  CLOUDINARY_ROOT_FOLDER,
  isCloudinaryConfigured,
} from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { IMAGE_UPLOAD } from '../constants/index.js';

/** True for public ids this app created (inside its root folder). */
export const isManagedImage = (publicId) =>
  typeof publicId === 'string' && publicId.startsWith(`${CLOUDINARY_ROOT_FOLDER}/`);

/**
 * Streams an in-memory image to Cloudinary using one of IMAGE_PRESETS.
 * Uploads are signed server-side with the API secret (the SDK does this), so the secret never
 * reaches the browser and nobody can upload to the account directly. Resolves { url, publicId }.
 */
export const uploadImage = async (buffer, preset) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image uploads are not configured on this server');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...preset, // folder + incoming transformation (resize, compress)
        resource_type: 'image',
        allowed_formats: IMAGE_UPLOAD.FORMATS, // Cloudinary rejects anything else too
        // Random public id: never derived from the user's filename, never overwrites
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        timeout: IMAGE_UPLOAD.UPLOAD_TIMEOUT_MS,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload failed:', error);
          return reject(new ApiError(502, 'Image upload failed, please try again'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Best-effort delete: a leftover image in Cloudinary should never fail the user's request.
 * Only images inside this app's folder are ever deleted, so a corrupted or tampered publicId
 * in the database can't be used to remove other assets in the account. `invalidate` also
 * purges the CDN cache, so the old image stops being served right away.
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (!isManagedImage(publicId)) {
    console.warn(
      `Refusing to delete Cloudinary asset outside ${CLOUDINARY_ROOT_FOLDER}/: ${publicId}`
    );
    return;
  }
  if (!isCloudinaryConfigured) return;

  try {
    const { result } = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    if (result !== 'ok' && result !== 'not found') {
      console.warn(`Cloudinary delete for ${publicId} returned "${result}"`);
    }
  } catch (error) {
    console.error(`Cloudinary delete failed for ${publicId}:`, error);
  }
};
