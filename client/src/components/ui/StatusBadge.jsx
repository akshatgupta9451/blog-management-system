import { BLOG_STATUS } from '@/constants';
import { cn } from '@/utils/format';

const STYLES = {
  [BLOG_STATUS.PUBLISHED]: 'bg-green-50 text-green-700 ring-green-600/20',
  [BLOG_STATUS.DRAFT]: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  [BLOG_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

const StatusBadge = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
      STYLES[status],
      className
    )}
  >
    {status}
  </span>
);

export default StatusBadge;
