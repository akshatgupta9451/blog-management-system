import { cn } from '@/utils/format';

const SIZES = { sm: 'size-4 border-2', md: 'size-8 border-[3px]', lg: 'size-12 border-4' };

/**
 * Spinner. `fullScreen` centers it in the viewport (initial session check),
 * `label` adds visible text below it.
 */
const Loader = ({ size = 'md', label, fullScreen = false, className }) => {
  const spinner = (
    <span
      role="status"
      aria-label={label || 'Loading'}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        SIZES[size],
        className ?? 'text-primary-600'
      )}
    />
  );

  if (!fullScreen && !label) return spinner;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-gray-500',
        fullScreen ? 'min-h-screen' : 'py-16'
      )}
    >
      {spinner}
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
};

export default Loader;
