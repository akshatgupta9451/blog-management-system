import Icon from '@/components/ui/Icon';
import { cn, formatCount } from '@/utils/format';

const TONES = {
  indigo: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
};

/** A single metric. Renders a shimmer while `value` is undefined (still loading). */
const StatCard = ({ label, value, icon, tone = 'indigo' }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
    <span className={cn('flex size-11 items-center justify-center rounded-lg', TONES[tone])}>
      <Icon name={icon} className="size-6" />
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm text-gray-500">{label}</p>
      {value === undefined ? (
        <span className="mt-1 block h-7 w-12 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight text-gray-900" title={String(value)}>
          {formatCount(value)}
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
