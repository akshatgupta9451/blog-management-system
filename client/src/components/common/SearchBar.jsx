import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useSyncedDraft } from '@/hooks/useSyncedDraft';
import { cn } from '@/utils/format';

/**
 * Search input that calls onSearch after the user stops typing (debounced),
 * or immediately on Enter. `value` is the committed search (e.g. from the URL); the input
 * follows it when it changes from outside. With `live={false}` it only searches on Enter
 * (e.g. when searching navigates to another page).
 */
const SearchBar = ({
  value: committed = '',
  onSearch,
  placeholder = 'Search…',
  delay = 400,
  live = true,
  className,
}) => {
  const [value, setValue] = useSyncedDraft(committed);
  const [debouncedSearch, flushSearch] = useDebouncedCallback(onSearch, delay);

  const submit = (next) => flushSearch(next.trim());

  const handleChange = (event) => {
    const next = event.target.value;
    setValue(next);
    if (live) debouncedSearch(next.trim());
  };

  const clear = () => {
    setValue('');
    submit('');
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit(value);
      }}
      className={cn('relative', className)}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="focus:border-primary-500 focus:ring-primary-100 h-10 w-full rounded-lg border border-gray-300 bg-white pr-9 pl-10 text-sm placeholder:text-gray-400 focus:ring-2 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchBar;
