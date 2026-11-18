const SEGMENTS = [
  { key: 'published', label: 'Published', bar: 'bg-green-500', dot: 'bg-green-500' },
  { key: 'draft', label: 'Drafts', bar: 'bg-amber-400', dot: 'bg-amber-400' },
  { key: 'archived', label: 'Archived', bar: 'bg-gray-300', dot: 'bg-gray-300' },
];

/** Stacked bar showing how the user's blogs split across statuses. */
const StatusBreakdown = ({ stats }) => {
  const total = stats?.total ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Blogs by status</h2>
        <span className="text-xs text-gray-500">{total} total</span>
      </div>

      <div
        className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100"
        role="img"
        aria-label={SEGMENTS.map((s) => `${stats?.[s.key] ?? 0} ${s.label.toLowerCase()}`).join(
          ', '
        )}
      >
        {total > 0 &&
          SEGMENTS.map((segment) =>
            stats[segment.key] ? (
              <div
                key={segment.key}
                className={segment.bar}
                style={{ width: `${(stats[segment.key] / total) * 100}%` }}
              />
            ) : null
          )}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {SEGMENTS.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${segment.dot}`} aria-hidden="true" />
            <span className="text-gray-600">{segment.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {stats?.[segment.key] ?? '–'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusBreakdown;
