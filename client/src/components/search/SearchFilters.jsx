import { SEARCH_DATE_PRESETS } from '@/constants';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useSyncedDraft } from '@/hooks/useSyncedDraft';
import Avatar from '@/components/ui/Avatar';
import { controlClasses } from '@/components/ui/formStyles';
import { cn } from '@/utils/format';

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

const Section = ({ title, children, action }) => (
  <section className="border-b border-gray-100 py-5 first:pt-0 last:border-0 last:pb-0">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

/** Text field that reports its value after typing pauses (filters re-run the search). */
const DebouncedField = ({ id, label, value, onChange, placeholder }) => {
  const [draft, setDraft] = useSyncedDraft(value);
  const [debounced, flush] = useDebouncedCallback(onChange, 400);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={draft}
        placeholder={placeholder}
        maxLength={100}
        onChange={(event) => {
          setDraft(event.target.value);
          debounced(event.target.value.trim());
        }}
        onKeyDown={(event) => event.key === 'Enter' && flush(draft.trim())}
        className={cn(controlClasses(false), 'h-9')}
      />
    </div>
  );
};

// Selected values always stay visible, even if they fell out of the top-N facet counts
const withSelected = (facet = [], selected) => {
  const names = new Set(facet.map((item) => item.name));
  return [
    ...facet,
    ...selected.filter((name) => !names.has(name)).map((name) => ({ name, count: 0 })),
  ];
};

/**
 * Filter panel for the search page. `params` are the current URL values; `onChange(key, value)`
 * updates one. Counts come from the API's facets, which leave out their own filter, so each
 * number is how many results you'd get by also ticking that option.
 */
const SearchFilters = ({ params, facets, appliedAuthor, onChange }) => {
  const categories = params.category ? params.category.split(',') : [];
  const tags = params.tags ? params.tags.split(',') : [];
  const authorIsId = isObjectId(params.author);

  const toggleIn = (list, value) =>
    (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]).join(',');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <Section title="Title contains">
        <DebouncedField
          id="filter-title"
          label="Title contains"
          value={params.title}
          placeholder="e.g. engine"
          onChange={(value) => onChange('title', value)}
        />
      </Section>

      <Section title="Author">
        {authorIsId ? (
          <div className="bg-primary-50 text-primary-700 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
            <span className="truncate font-medium">{appliedAuthor}</span>
            <button
              type="button"
              onClick={() => onChange('author', '')}
              className="hover:text-primary-900 ml-2 text-xs underline"
            >
              Clear
            </button>
          </div>
        ) : (
          <DebouncedField
            id="filter-author"
            label="Author name"
            value={params.author}
            placeholder="Search by name"
            onChange={(value) => onChange('author', value)}
          />
        )}
        {!authorIsId && facets?.authors?.length > 0 && (
          <ul className="mt-3 space-y-1">
            {facets.authors.map((author) => (
              <li key={author._id}>
                <button
                  type="button"
                  onClick={() => onChange('author', author._id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Avatar user={author} size="xs" />
                  <span className="flex-1 truncate text-left">{author.name}</span>
                  <span className="text-xs text-gray-400 tabular-nums">{author.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Category">
        <ul className="space-y-1">
          {withSelected(facets?.categories, categories).map((item) => (
            <li key={item.name}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 capitalize hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={categories.includes(item.name)}
                  onChange={() => onChange('category', toggleIn(categories, item.name))}
                  className="accent-primary-600 size-4 rounded border-gray-300"
                />
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-xs text-gray-400 tabular-nums">{item.count}</span>
              </label>
            </li>
          ))}
          {!facets?.categories?.length && !categories.length && (
            <li className="text-sm text-gray-400">No categories match.</li>
          )}
        </ul>
      </Section>

      <Section
        title="Tags"
        action={
          tags.length > 1 && (
            <div
              className="flex rounded-md bg-gray-100 p-0.5 text-xs"
              role="group"
              aria-label="Tag matching"
            >
              {['any', 'all'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={(params.tagsMode || 'any') === mode}
                  onClick={() => onChange('tagsMode', mode === 'any' ? '' : mode)}
                  className={cn(
                    'rounded px-2 py-0.5 capitalize',
                    (params.tagsMode || 'any') === mode
                      ? 'bg-white font-medium shadow-sm'
                      : 'text-gray-500'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          )
        }
      >
        <div className="flex flex-wrap gap-2">
          {withSelected(facets?.tags, tags).map((item) => {
            const active = tags.includes(item.name);
            return (
              <button
                key={item.name}
                type="button"
                aria-pressed={active}
                onClick={() => onChange('tags', toggleIn(tags, item.name))}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs transition-colors',
                  active
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                #{item.name}
                <span className={cn('ml-1', active ? 'text-primary-100' : 'text-gray-400')}>
                  {item.count}
                </span>
              </button>
            );
          })}
          {!facets?.tags?.length && !tags.length && (
            <p className="text-sm text-gray-400">No tags match.</p>
          )}
        </div>
      </Section>

      <Section title="Published">
        <div className="space-y-1">
          {SEARCH_DATE_PRESETS.map((preset) => (
            <label
              key={preset.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <input
                type="radio"
                name="date-preset"
                checked={(params.date || '') === preset.value && !params.from && !params.to}
                onChange={() => onChange('date', preset.value, { clear: ['from', 'to'] })}
                className="accent-primary-600 size-4"
              />
              {preset.label}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ['from', 'From'],
            ['to', 'To'],
          ].map(([key, label]) => (
            <label key={key} className="text-xs text-gray-500">
              {label}
              <input
                type="date"
                value={params[key]}
                max={key === 'from' ? params.to || undefined : undefined}
                min={key === 'to' ? params.from || undefined : undefined}
                onChange={(event) => onChange(key, event.target.value, { clear: ['date'] })}
                className={cn(controlClasses(false), 'mt-1 h-9 px-2')}
              />
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default SearchFilters;
