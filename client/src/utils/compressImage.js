/**
 * Shrinks an image in the browser before it's uploaded: caps the longest side at
 * `maxDimension` and re-encodes it as WebP (JPEG where WebP encoding isn't available).
 * Re-encoding through a canvas also drops EXIF metadata such as GPS location.
 *
 * Returns the original file when compression wouldn't help: GIFs (keeps animation), images the
 * browser can't decode, or when the result isn't smaller.
 */
export const compressImage = async (file, { maxDimension = 2000, quality = 0.85 } = {}) => {
  if (file.type === 'image/gif') return file;

  let bitmap;
  try {
    // from-image applies the photo's EXIF orientation, so portrait phone shots stay upright
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await encode('image/webp');
  // Browsers that can't encode WebP silently return PNG; JPEG is the better fallback for
  // photos, but would lose transparency, so only use it when the source was a JPEG
  if (blob?.type !== 'image/webp')
    blob = file.type === 'image/jpeg' ? await encode('image/jpeg') : null;

  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const name = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${extension}`;
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
};

export const formatBytes = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
