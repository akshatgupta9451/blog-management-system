import { cn } from '@/utils/format';

const CONTROL_CLASSES =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-100';

export const controlClasses = (hasError) =>
  cn(
    CONTROL_CLASSES,
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
      : 'focus:border-primary-500 focus:ring-primary-100 border-gray-300'
  );
