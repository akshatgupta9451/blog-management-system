import { Link } from 'react-router';
import { formatValue } from './scale';

/**
 * Ranked horizontal bars for one measure (top categories, most viewed posts). One series,
 * so one color and no legend; each value sits at its bar's tip in text ink. Bars are 14px,
 * square at the baseline with a 4px rounded data end.
 */
const BarList = ({ items, color = 'var(--viz-series-1)', valueLabel }) => {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const pct = (item.value / max) * 100;
        const label = item.href ? (
          <Link to={item.href} className="hover:text-primary-700 truncate">
            {item.label}
          </Link>
        ) : (
          <span className="truncate capitalize">{item.label}</span>
        );
        return (
          <li key={item.key ?? item.label} className="group">
            <div className="mb-1 flex text-sm text-[var(--viz-text-secondary)]">{label}</div>
            <div
              className="flex items-center gap-2"
              tabIndex={0}
              aria-label={`${item.label}: ${formatValue(item.value)} ${valueLabel}`}
              title={`${item.label}: ${formatValue(item.value)} ${valueLabel}`}
            >
              <div className="h-3.5 flex-1">
                <div
                  className="h-full rounded-r-[4px] transition-opacity group-focus-within:opacity-80 group-hover:opacity-80"
                  style={{ width: `${Math.max(pct, 1)}%`, background: color }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-semibold text-[var(--viz-text-primary)] tabular-nums">
                {formatValue(item.value)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default BarList;
