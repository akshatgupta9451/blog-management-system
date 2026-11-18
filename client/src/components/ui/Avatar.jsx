import { cn, initials } from '@/utils/format';
import CloudImage from './CloudImage';

// Rendered pixel size per avatar size, for requesting 1× and 2× variants
const PIXELS = { xs: 24, sm: 32, md: 40, xl: 96 };

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  xl: 'size-24 text-2xl',
};

const Avatar = ({ user, src, size = 'sm', className }) => {
  const url = src ?? user?.avatar?.url;
  const classes = cn('shrink-0 rounded-full object-cover', SIZES[size], className);

  if (url) {
    const px = PIXELS[size];
    return (
      <CloudImage
        src={url}
        widths={[px, px * 2]}
        sizes={`${px}px`}
        aspectRatio={1}
        gravity="face"
        alt={user?.name ?? ''}
        className={classes}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        classes,
        'bg-primary-100 text-primary-700 inline-flex items-center justify-center font-semibold'
      )}
    >
      {initials(user?.name) || '?'}
    </span>
  );
};

export default Avatar;
