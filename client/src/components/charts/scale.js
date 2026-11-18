const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US');

// Axis ticks: 0 / 1K / 2.5K
export const formatTick = (value) => (value >= 1000 ? compact.format(value) : String(value));
export const formatValue = (value) =>
  value === null || value === undefined ? '–' : full.format(value);

/** A rounded axis maximum and ~4 evenly spaced ticks from 0 (1, 2, 2.5, 5 × 10ⁿ steps). */
export const niceScale = (max, targetTicks = 4) => {
  if (!max || max <= 0) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const rough = max / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough);
  const niceStep = step < 1 ? 1 : step; // counts are whole numbers
  const top = Math.ceil(max / niceStep) * niceStep;
  return { max: top, ticks: Array.from({ length: top / niceStep + 1 }, (_, i) => i * niceStep) };
};

const UTC = { timeZone: 'UTC' };
const fmt = (options) => new Intl.DateTimeFormat('en-US', { ...UTC, ...options });
const shortDay = fmt({ month: 'short', day: 'numeric' });
const longDay = fmt({ weekday: 'short', month: 'short', day: 'numeric' });
const shortMonth = fmt({ month: 'short' });
const longMonth = fmt({ month: 'long', year: 'numeric' });

// Bucket dates come from the API as UTC bucket starts
export const formatBucket = (date, unit, long = false) => {
  const d = new Date(date);
  if (unit === 'month') return (long ? longMonth : shortMonth).format(d);
  if (unit === 'week') return long ? `Week of ${shortDay.format(d)}` : shortDay.format(d);
  return (long ? longDay : shortDay).format(d);
};
