import { Link } from 'react-router';
import { cn } from '@/utils/format';
import Loader from './Loader';

const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary:
    'bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-gray-400',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

/** Renders a <Link> when `to` is given, otherwise a <button>. */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  to,
  className,
  children,
  type = 'button',
  ...props
}) => {
  const classes = cn(
    'inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader size="sm" className="text-current" />}
      {children}
    </button>
  );
};

export default Button;
