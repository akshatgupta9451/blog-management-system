import { useState } from 'react';
import Legend from './Legend';
import { formatValue } from './scale';

/**
 * One 100% bar showing how a total splits (users by role, posts by status). Segments are
 * separated by a 2px surface gap, never a stroke. Colors are fixed per category (passed in
 * a fixed order), so they never change when counts do. The legend carries every value.
 */
const StackedBar = ({ segments, label }) => {
  const [hovered, setHovered] = useState(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const share = (value) => (total ? Math.round((value / total) * 100) : 0);
  const visible = segments.filter((segment) => segment.value > 0);

  return (
    <div>
      <div className="relative">
        <div
          className="flex h-4 gap-[2px] overflow-hidden rounded-[4px] bg-[var(--viz-surface)]"
          role="img"
          aria-label={label}
        >
          {total === 0 ? (
            <div className="flex-1 bg-[var(--viz-grid)]" />
          ) : (
            visible.map((segment) => (
              <div
                key={segment.label}
                tabIndex={0}
                aria-label={`${segment.label}: ${formatValue(segment.value)} (${share(segment.value)}%)`}
                onPointerEnter={() => setHovered(segment)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(segment)}
                onBlur={() => setHovered(null)}
                className="h-full transition-opacity outline-none hover:opacity-80 focus-visible:opacity-80"
                style={{ flexGrow: segment.value, flexBasis: 0, background: segment.color }}
              />
            ))
          )}
        </div>
        {hovered && (
          <div
            role="status"
            className="pointer-events-none absolute top-6 left-0 z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
          >
            <span className="font-semibold text-[var(--viz-text-primary)]">
              {formatValue(hovered.value)}
            </span>{' '}
            <span className="text-[var(--viz-text-secondary)]">
              {hovered.label} · {share(hovered.value)}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <Legend
          mark="rect"
          items={segments.map((segment) => ({
            label: segment.label,
            color: segment.color,
            value: `${formatValue(segment.value)} (${share(segment.value)}%)`,
          }))}
        />
      </div>
    </div>
  );
};

export default StackedBar;
