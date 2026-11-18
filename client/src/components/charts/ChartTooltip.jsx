import { formatValue } from './scale';

/**
 * One tooltip listing every series at the hovered/focused bucket. Value first (strong), series
 * name second, keyed with a short line in the series color. Flips to the left of the
 * crosshair in the right part of the chart so it never runs off the card.
 */
const ChartTooltip = ({ row, series, title, anchorX, width }) => {
  const flip = anchorX > width * 0.6;
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
      style={flip ? { right: width - anchorX + 12 } : { left: anchorX + 12 }}
    >
      <p className="mb-1 font-medium text-[var(--viz-text-secondary)]">{title}</p>
      <ul className="space-y-0.5">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 rounded-full"
              style={{ background: s.color }}
              aria-hidden="true"
            />
            <span className="font-semibold text-[var(--viz-text-primary)] tabular-nums">
              {row[s.key] === null ? 'No data' : formatValue(row[s.key])}
            </span>
            <span className="text-[var(--viz-text-secondary)]">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChartTooltip;
