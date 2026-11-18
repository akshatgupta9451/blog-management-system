import { useState } from 'react';
import { useElementWidth } from '@/hooks/useElementWidth';
import ChartTooltip from './ChartTooltip';
import Legend from './Legend';
import { formatTick, niceScale } from './scale';

const MARGIN = { top: 12, right: 12, bottom: 26, left: 36 };
const MAX_BAR = 24;
const GAP = 2;
const RADIUS = 4;

/**
 * Column chart for counts per time bucket (sign-ups per day, likes per week). Columns are
 * capped at 24px, square at the baseline with a 4px rounded data end; grouped series are
 * separated by a 2px gap. Hovering (or arrow keys when focused) highlights a whole bucket, and
 * one tooltip lists every series there. Zero draws nothing, so quiet days read as empty.
 */
const ColumnChart = ({ data, series, formatX, formatXLong, height = 220, label }) => {
  const [ref, width] = useElementWidth();
  const [active, setActive] = useState(null);

  const n = data.length;
  const { max, ticks } = niceScale(
    Math.max(...data.flatMap((row) => series.map((s) => row[s.key] ?? 0)), 0)
  );

  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const band = innerW / Math.max(n, 1);
  const k = series.length;
  // Leave air in each band: the group never fills more than ~80% of it
  const barW = Math.max(2, Math.min(MAX_BAR, (band * 0.8 - (k - 1) * GAP) / k));
  const groupW = k * barW + (k - 1) * GAP;
  const bandX = (i) => MARGIN.left + i * band;
  const y = (v) => MARGIN.top + innerH - (v / max) * innerH;
  const xLabelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 70))));

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') setActive((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (event.key === 'ArrowLeft') setActive((i) => Math.max(0, (i ?? n) - 1));
    else if (event.key === 'Escape') setActive(null);
    else return;
    event.preventDefault();
  };

  // Square base, rounded top: a rounded rect plus a square patch over its bottom corners
  const column = (x, value, color, key, dimmed) => {
    if (!value) return null;
    const top = y(value);
    const h = y(0) - top;
    const r = Math.min(RADIUS, barW / 2, h);
    return (
      <g key={key} opacity={dimmed ? 0.45 : 1} className="transition-opacity">
        <rect x={x} y={top} width={barW} height={h} rx={r} fill={color} />
        <rect x={x} y={top + h - r} width={barW} height={r} fill={color} />
      </g>
    );
  };

  return (
    <div>
      {k > 1 && (
        <div className="mb-3">
          <Legend mark="rect" items={series.map((s) => ({ label: s.label, color: s.color }))} />
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
            onPointerLeave={() => setActive(null)}
            className="rounded outline-none focus-visible:ring-2 focus-visible:ring-[var(--viz-series-1)]/40"
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + innerW}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={tick === 0 ? 'var(--viz-baseline)' : 'var(--viz-grid)'}
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
                <text
                  x={MARGIN.left - 8}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-[var(--viz-text-muted)] text-[11px] tabular-nums"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}

            {data.map((row, i) => {
              const start = bandX(i) + (band - groupW) / 2;
              return (
                <g key={i}>
                  {series.map((s, j) =>
                    column(
                      start + j * (barW + GAP),
                      row[s.key],
                      s.color,
                      s.key,
                      active !== null && active !== i
                    )
                  )}
                  {/* The whole band is the hit target, not just the painted columns */}
                  <rect
                    x={bandX(i)}
                    y={MARGIN.top}
                    width={band}
                    height={innerH}
                    fill="transparent"
                    onPointerEnter={() => setActive(i)}
                  />
                  {(i % xLabelEvery === 0 || i === n - 1) && (
                    <text
                      x={bandX(i) + band / 2}
                      y={height - 6}
                      textAnchor="middle"
                      className="fill-[var(--viz-text-muted)] text-[11px]"
                    >
                      {formatX(row.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {active !== null && (
          <ChartTooltip
            row={data[active]}
            series={series}
            title={(formatXLong ?? formatX)(data[active].date)}
            anchorX={bandX(active) + band / 2}
            width={width}
          />
        )}
      </div>
    </div>
  );
};

export default ColumnChart;
