/** Series key. Lines get a short line swatch, bars/areas a small rect, mirroring the mark. */
const Legend = ({ items, mark = 'line' }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--viz-text-secondary)]">
    {items.map((item) => (
      <li key={item.label} className="flex items-center gap-1.5">
        {mark === 'line' ? (
          <span
            className="h-0.5 w-3 rounded-full"
            style={{ background: item.color }}
            aria-hidden="true"
          />
        ) : (
          <span
            className="size-2.5 rounded-[2px]"
            style={{ background: item.color }}
            aria-hidden="true"
          />
        )}
        {item.label}
        {item.value !== undefined && (
          <span className="font-medium text-[var(--viz-text-primary)]">{item.value}</span>
        )}
      </li>
    ))}
  </ul>
);

export default Legend;
