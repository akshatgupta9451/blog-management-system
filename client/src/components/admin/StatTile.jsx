import { formatCount } from '@/utils/format';

/**
 * Stat tile: label · value · optional delta vs a named period. The delta is colored by
 * direction × whether up is good, and always carries an arrow and words, never color alone.
 */
const StatTile = ({ label, value, current, previous, period = 'vs previous 30 days' }) => {
  const hasDelta = current !== undefined && previous !== undefined;
  const diff = hasDelta ? current - previous : 0;
  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

  return (
    <div className="viz-root rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      <p className="text-sm text-gray-500">{label}</p>
      {value === undefined ? (
        <span className="mt-1 block h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p
          className="mt-1 text-3xl font-semibold tracking-tight text-gray-900"
          title={String(value)}
        >
          {formatCount(value)}
        </p>
      )}
      {hasDelta && (
        <p className="mt-1 text-xs text-gray-500">
          <span
            className="font-medium"
            style={{
              color:
                direction === 'up'
                  ? 'var(--viz-delta-good)'
                  : direction === 'down'
                    ? 'var(--viz-delta-bad)'
                    : undefined,
            }}
          >
            {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '■'} {formatCount(current)} new
          </span>{' '}
          in the last 30 days ({diff > 0 ? '+' : ''}
          {formatCount(diff)} {period})
        </p>
      )}
    </div>
  );
};

export default StatTile;
