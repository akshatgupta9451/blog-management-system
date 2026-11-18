import { responsiveImage } from '@/utils/image';

/**
 * <img> that asks Cloudinary for an optimally sized, auto-format, auto-quality variant.
 * `widths` are the candidate pixel widths; `sizes` tells the browser how wide the image is
 * rendered. `aspectRatio` (width/height) crops to that shape with smart gravity.
 * Falls back to a plain <img> for non-Cloudinary URLs.
 */
const CloudImage = ({
  src,
  widths = [400, 800, 1200],
  sizes = '100vw',
  aspectRatio,
  gravity,
  alt = '',
  loading = 'lazy',
  ...props
}) => (
  <img
    {...responsiveImage(src, { widths, sizes, aspectRatio, gravity })}
    alt={alt}
    loading={loading}
    decoding="async"
    {...props}
  />
);

export default CloudImage;
