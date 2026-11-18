import { useState } from 'react';
import { useElementWidth } from '@/hooks/useElementWidth';
import ChartTooltip from './ChartTooltip';
import Legend from './Legend';
import { formatTick, formatValue, niceScale } from './scale';

const MARGIN = { top: 12, bottom: 26, left: 36 };
const END_LABEL_SPACE = 64;
const MIN_LABEL_GAP = 14;

/** SVG path for one series; null values break the line instead of dropping it to zero. */
const linePath = (points) =>
  points.reduce((d, point, i) => {
    if (!point) return d;
    const command = i === 0 || !points[i - 1] ? 'M' : 'L';
    return `${d}${command}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }, '');

/**
 * Time-series line chart. `series` = [{ key, label, color }] read from each row of `data`.
 * Hover (or arrow keys when focused) moves a crosshair that snaps to the nearest bucket; one
 * tooltip lists every series there. With 2+ series a legend is shown, and the last value of
 * each series is labeled at its line end unless those labels would collide.
 */
const LineChart = ({ data, series, formatX, formatXLong, height = 220, area = false, label }) => {
  const [ref, width] = useElementWidth();
  const [active, setActive] = useState(null);

  const n = data.length;
  const values = data.flatMap((row) => series.map((s) => row[s.key] ?? 0));
  const { max, ticks } = niceScale(Math.max(...values, 0));

  const margin = { ...MARGIN, right: series.length <= 4 ? END_LABEL_SPACE : 12 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;
  const x = (i) => margin.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v) => margin.top + innerH - (v / max) * innerH;

  const lines = series.map((s) => {
    const points = data.map((row, i) =>
      row[s.key] === null || row[s.key] === undefined ? null : { x: x(i), y: y(row[s.key]) }
    );
    const lastIndex = points.findLastIndex(Boolean);
    return {
      ...s,
      points,
      last: lastIndex >= 0 ? { ...points[lastIndex], value: data[lastIndex][s.key] } : null,
    };
  });

  // End labels only when they don't collide (stacking them apart would detach them from lines)
  const ends = lines
    .filter((line) => line.last)
    .map((line) => line.last.y)
    .sort((a, b) => a - b);
  const showEndLabels =
    series.length <= 4 && ends.every((value, i) => i === 0 || value - ends[i - 1] >= MIN_LABEL_GAP);

  const xLabelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 70))));

  const pick = (clientX, rect) => {
    const ratio = (clientX - rect.left - margin.left) / (innerW || 1);
    setActive(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') setActive((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (event.key === 'ArrowLeft') setActive((i) => Math.max(0, (i ?? n) - 1));
    else if (event.key === 'Escape') setActive(null);
    else return;
    event.preventDefault();
  };

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3">
          <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
        </div>
      )}
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={label}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={() => setActive((i) => i ?? n - 1)}
            onBlur={() => setActive(null)}
            onPointerMove={(event) =>
              pick(event.clientX, event.currentTarget.getBoundingClientRect())
            }
            onPointerLeave={() => setActive(null)}
            className="overflow-visible rounded outline-none focus-visible:ring-2 focus-visible:ring-[var(--viz-series-1)]/40"
          >
            {/* Hairline grid + tick labels */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={margin.left}
                  x2={margin.left + innerW}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={tick === 0 ? 'var(--viz-baseline)' : 'var(--viz-grid)'}
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
                <text
                  x={margin.left - 8}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-[var(--viz-text-muted)] text-[11px] tabular-nums"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {data.map((row, i) =>
              i % xLabelEvery === 0 || i === n - 1 ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 6}
                  textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
                  className="fill-[var(--viz-text-muted)] text-[11px]"
                >
                  {formatX(row.date)}
                </text>
              ) : null
            )}

            {/* Area wash (single-series charts only) */}
            {area &&
              lines.map((line) => {
                const d = linePath(line.points);
                const visible = line.points.filter(Boolean);
                if (!d || visible.length < 2) return null;
                return (
                  <path
                    key={`${line.key}-area`}
                    d={`${d}L${visible.at(-1).x},${y(0)}L${visible[0].x},${y(0)}Z`}
                    fill={line.color}
                    opacity="0.1"
                  />
                );
              })}

            {lines.map((line) => (
              <path
                key={line.key}
                d={linePath(line.points)}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Crosshair + hovered points */}
            {active !== null && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={margin.top}
                y2={margin.top + innerH}
                stroke="var(--viz-baseline)"
                strokeWidth="1"
                shapeRendering="crispEdges"
              />
            )}
            {lines.map((line) => {
              const point = active !== null ? line.points[active] : line.last;
              if (!point) return null;
              return (
                <circle
                  key={`${line.key}-dot`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={line.color}
                  stroke="var(--viz-surface)"
                  strokeWidth="2"
                />
              );
            })}

            {/* Direct end labels: value then series name, in text ink */}
            {showEndLabels &&
              lines.map((line) =>
                line.last ? (
                  <text
                    key={`${line.key}-label`}
                    x={line.last.x + 8}
                    y={line.last.y}
                    dy="0.32em"
                    className="text-[11px]"
                  >
                    <tspan className="fill-[var(--viz-text-primary)] font-semibold">
                      {formatValue(line.last.value)}
                    </tspan>
                    {series.length > 1 && (
                      <tspan className="fill-[var(--viz-text-secondary)]"> {line.label}</tspan>
                    )}
                  </text>
                ) : null
              )}
          </svg>
        )}

        {active !== null && (
          <ChartTooltip
            row={data[active]}
            series={series}
            title={(formatXLong ?? formatX)(data[active].date)}
            anchorX={x(active)}
            width={width}
          />
        )}
      </div>
    </div>
  );
};

export default LineChart;
