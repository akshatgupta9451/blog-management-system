import { Fragment } from 'react';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps every case-insensitive occurrence of any of `terms` in <mark>. */
const Highlight = ({ text = '', terms = [] }) => {
  const words = terms.filter((term) => term.length > 1);
  if (!words.length) return text;

  const pattern = new RegExp(`(${words.map(escapeRegex).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) =>
    // split() with a capture group puts the matches at odd indexes
    index % 2 ? (
      <mark key={index} className="rounded-sm bg-amber-100 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
};

export default Highlight;
