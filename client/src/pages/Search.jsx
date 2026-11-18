import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { searchBlogs } from '@/services/search.service';
import { useFetch } from '@/hooks/useFetch';
import { SEARCH_DATE_PRESETS, SEARCH_PARAMS, SEARCH_SORTS } from '@/constants';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResult, { SearchResultSkeleton } from '@/components/search/SearchResult';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import { controlClasses } from '@/components/ui/formStyles';
import { cn, formatDate } from '@/utils/format';

const PAGE_SIZE = 10;
const FILTER_KEYS = ['title', 'author', 'category', 'tags', 'tagsMode', 'date', 'from', 'to'];

const Chip = ({ label, onRemove }) => (
  <span className="bg-primary-50 text-primary-700 inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-sm">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="hover:bg-primary-100 rounded-full p-0.5"
    >
      <Icon name="close" className="size-3.5" />
    </button>
  </span>
);

const Search = () => {
  // The URL is the single source of truth, so searches are shareable and survive refresh/back
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(SEARCH_PARAMS.map((key) => [key, searchParams.get(key) ?? '']));
  const page = Number(params.page) || 1;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, loading, error, reload } = useFetch(
    (signal) => searchBlogs({ ...params, page, limit: PAGE_SIZE }, { signal }),
    [searchParams.toString()]
  );

  // Changing anything but the page goes back to page 1. `clear` drops related params,
  // e.g. picking a date preset clears a custom from/to range.
  const update = (key, value, { clear = [] } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      clear.forEach((name) => next.delete(name));
      if (key !== 'page') next.delete('page');
      // "Best match" only makes sense with keywords
      if (key === 'q' && !value && next.get('sort') === 'relevance') next.delete('sort');
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      FILTER_KEYS.forEach((name) => next.delete(name));
      next.delete('page');
      return next;
    });
  };

  const list = (name) => (params[name] ? params[name].split(',') : []);
  const removeFrom = (name, value) =>
    update(
      name,
      list(name)
        .filter((item) => item !== value)
        .join(',')
    );

  // "Any time" (value '') is the absence of a date filter, not a filter to show as a chip
  const datePreset =
    params.date && SEARCH_DATE_PRESETS.find((preset) => preset.value === params.date);
  const chips = [
    params.title && { label: `Title: “${params.title}”`, remove: () => update('title', '') },
    params.author && {
      label: `Author: ${data?.applied?.author ?? params.author}`,
      remove: () => update('author', ''),
    },
    ...list('category').map((name) => ({
      label: name,
      remove: () => removeFrom('category', name),
    })),
    ...list('tags').map((name) => ({ label: `#${name}`, remove: () => removeFrom('tags', name) })),
    datePreset && { label: datePreset.label, remove: () => update('date', '') },
    params.from && { label: `From ${formatDate(params.from)}`, remove: () => update('from', '') },
    params.to && { label: `To ${formatDate(params.to)}`, remove: () => update('to', '') },
  ].filter(Boolean);

  const terms = [...params.q.split(/\s+/), params.title].filter(Boolean);
  const sortOptions = SEARCH_SORTS.filter((option) => !option.needsQuery || params.q);
  const sort = data?.applied?.sort ?? params.sort ?? (params.q ? 'relevance' : 'newest');
  const blogs = data?.blogs ?? [];
  const total = data?.pagination?.totalDocs ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find blogs by keyword, title, author, category, tag or date.
        </p>
        <SearchBar
          value={params.q}
          onSearch={(value) => update('q', value)}
          placeholder="Search keywords…"
          className="mt-4 max-w-2xl"
        />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className={cn('lg:block', filtersOpen ? 'block' : 'hidden')} aria-label="Filters">
          <SearchFilters
            params={params}
            facets={data?.facets}
            appliedAuthor={data?.applied?.author}
            onChange={update}
          />
        </aside>

        <section aria-labelledby="results-heading" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="text-sm text-gray-600" aria-live="polite">
              {data ? (
                <>
                  <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>{' '}
                  {total === 1 ? 'result' : 'results'}
                  {params.q && (
                    <>
                      {' '}
                      for <span className="font-semibold text-gray-900">“{params.q}”</span>
                    </>
                  )}
                </>
              ) : (
                'Searching…'
              )}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                Filters{chips.length > 0 && ` (${chips.length})`}
              </Button>
              <label className="flex items-center gap-2 text-sm whitespace-nowrap text-gray-600">
                Sort
                <select
                  value={sort}
                  onChange={(event) => update('sort', event.target.value)}
                  className={cn(controlClasses(false), 'h-9 w-auto')}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <Chip key={chip.label} label={chip.label} onRemove={chip.remove} />
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary-600 text-sm hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {error ? (
            <ErrorState error={error} title="Search failed" onRetry={reload} />
          ) : !data ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SearchResultSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState
              title="No blogs found"
              message={
                chips.length
                  ? 'Try removing a filter or two.'
                  : 'Try different keywords or check the spelling.'
              }
              action={
                chips.length > 0 && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div
                className={cn('space-y-4 transition-opacity', loading && 'opacity-50')}
                aria-busy={loading}
              >
                {blogs.map((blog) => (
                  <SearchResult key={blog._id} blog={blog} terms={terms} />
                ))}
              </div>
              <Pagination
                pagination={data.pagination}
                onPageChange={(next) => {
                  update('page', next > 1 ? String(next) : '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="pt-2"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Search;
