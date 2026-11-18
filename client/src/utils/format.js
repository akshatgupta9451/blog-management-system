const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '');

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

const RELATIVE_UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

// "just now", "5 minutes ago", "yesterday", "3 weeks ago"
export const timeAgo = (value) => {
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size)
      return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return 'just now';
};

export const formatCount = (value = 0) => compactFormatter.format(value);

// "1 like", "12 likes", "1.2K views"
export const countLabel = (value = 0, singular, plural = `${singular}s`) =>
  `${formatCount(value)} ${value === 1 ? singular : plural}`;

export const htmlToText = (html = '') =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? '';

export const readingTime = (html) => {
  const words = htmlToText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const cn = (...classes) => classes.filter(Boolean).join(' ');
