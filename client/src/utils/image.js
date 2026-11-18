// Delivery-time Cloudinary transformations, applied by rewriting the image URL:
//   https://res.cloudinary.com/<cloud>/image/upload/v1/<id>.png
//   → https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_limit,w_800/v1/<id>.png
// f_auto serves AVIF/WebP to browsers that support them, q_auto picks the compression level,
// and the width means phones never download a desktop-sized image. Cloudinary generates each
// variant once and caches it on its CDN. Non-Cloudinary URLs are returned unchanged.

const UPLOAD_SEGMENT = '/image/upload/';

export const isCloudinaryUrl = (url) =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes(UPLOAD_SEGMENT);

/**
 * @param {object} options
 * @param {number} [options.width]
 * @param {number} [options.aspectRatio] width / height; with it, crop defaults to `fill`
 * @param {'limit'|'fill'} [options.crop]
 * @param {string} [options.gravity] e.g. 'auto' (smart crop) or 'face'
 */
export const cloudinaryUrl = (url, { width, aspectRatio, crop, gravity } = {}) => {
  if (!isCloudinaryUrl(url)) return url;
  const height = width && aspectRatio ? Math.round(width / aspectRatio) : undefined;
  const mode = crop ?? (height ? 'fill' : 'limit');
  const transformation = [
    'f_auto',
    'q_auto',
    `c_${mode}`,
    mode === 'fill' && `g_${gravity ?? 'auto'}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(',');
  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transformation}/`);
};

/**
 * `<img>` props for a responsive Cloudinary image: one URL per width in `srcSet`, and the
 * browser picks the smallest that fits `sizes` at the device's pixel density.
 */
export const responsiveImage = (url, { widths, sizes, ...options }) => {
  if (!isCloudinaryUrl(url)) return { src: url };
  return {
    src: cloudinaryUrl(url, { ...options, width: widths.at(-1) }),
    srcSet: widths
      .map((width) => `${cloudinaryUrl(url, { ...options, width })} ${width}w`)
      .join(', '),
    sizes,
  };
};
