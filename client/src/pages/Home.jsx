import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import { getBlogs } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import { PAGE_SIZE, ROUTES, SORT_OPTIONS } from '@/constants';
import BlogCard, { BlogCardSkeleton } from '@/components/blog/BlogCard';
import BlogFilters from '@/components/blog/BlogFilters';
import DiscoveryWidget from '@/components/blog/DiscoveryWidget';
import TrendingSection from '@/components/blog/TrendingSection';
import { getMyHistory, getPopular } from '@/services/engagement.service';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Button';
import { controlClasses } from '@/components/ui/formStyles';
import { cn, countLabel, timeAgo } from '@/utils/format';

const FILTER_KEYS = ['search', 'category', 'tag', 'sort', 'page'];

const Home = () => {
  // All filters live in the URL, so results are shareable and survive refresh/back
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? '']));
  const page = Number(filters.page) || 1;

  const { data, loading, error, reload } = useFetch(
    (signal) =>
      getBlogs(
        {
          search: filters.search,
          category: filters.category,
          tags: filters.tag,
          sort: filters.sort,
          page,
          limit: PAGE_SIZE,
        },
        { signal }
      ),
    [filters.search, filters.category, filters.tag, filters.sort, page]
  );

  // Changing any filter resets to page 1
  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const changePage = (nextPage) => {
    updateFilter('page', nextPage > 1 ? String(nextPage) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = Boolean(filters.search || filters.category || filters.tag);
  const blogs = data?.blogs ?? [];

  return (
    <div className="space-y-8">
      <section className="from-primary-600 to-primary-700 rounded-2xl bg-gradient-to-br px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Stories, ideas and tutorials</h1>
        <p className="text-primary-100 mt-2 max-w-xl">
          Read the latest posts from our authors, or search for something specific.
        </p>
        {/* Enter opens the full search page with filters */}
        <SearchBar
          live={false}
          onSearch={(value) =>
            navigate({
              pathname: ROUTES.SEARCH,
              search: value ? `?${createSearchParams({ q: value })}` : '',
            })
          }
          placeholder="Search blogs by keyword, then press Enter"
          className="mt-6 max-w-xl text-gray-900"
        />
      </section>

      {/* Discovery only on the plain landing view, not while searching or filtering */}
      {!hasFilters && page === 1 && <TrendingSection />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <section aria-labelledby="feed-heading" className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 id="feed-heading" className="text-xl font-semibold text-gray-900">
                {filters.search ? `Results for “${filters.search}”` : 'Latest blogs'}
              </h2>
              {hasFilters && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {filters.category && (
                    <FilterChip
                      label={`Category: ${filters.category}`}
                      onRemove={() => updateFilter('category', '')}
                    />
                  )}
                  {filters.tag && (
                    <FilterChip
                      label={`#${filters.tag}`}
                      onRemove={() => updateFilter('tag', '')}
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-primary-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm whitespace-nowrap text-gray-600">
              Sort by
              <select
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value)}
                className={cn(controlClasses(false), 'w-auto')}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <ErrorState error={error} title="Couldn't load blogs" onRetry={reload} />
          ) : loading && !data ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No blogs match your filters' : 'No blogs published yet'}
              message={
                hasFilters ? 'Try a different search or clear the filters.' : 'Check back soon.'
              }
              action={
                hasFilters && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  'grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3',
                  loading && 'pointer-events-none opacity-50'
                )}
                aria-busy={loading}
              >
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
              <Pagination pagination={data.pagination} onPageChange={changePage} />
            </>
          )}
        </section>

        <aside className="space-y-6">
          {user && (
            <DiscoveryWidget
              key={user._id}
              title="Recently viewed"
              icon="clock"
              fetcher={async (signal) => (await getMyHistory({ limit: 4 }, { signal })).blogs}
              meta={(blog) => `Read ${timeAgo(blog.lastViewedAt)}`}
              viewAllTo={ROUTES.HISTORY}
            />
          )}
          <DiscoveryWidget
            title="Popular"
            icon="trophy"
            fetcher={(signal) => getPopular(5, { signal })}
            ranked
            meta={(blog) =>
              `${countLabel(blog.likesCount, 'like')} · ${countLabel(blog.views, 'view')}`
            }
          />
          <BlogFilters
            category={filters.category}
            tag={filters.tag}
            onCategoryChange={(value) => updateFilter('category', value)}
            onTagChange={(value) => updateFilter('tag', value)}
          />
        </aside>
      </div>
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span className="bg-primary-50 text-primary-700 inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 capitalize">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="hover:bg-primary-100 rounded-full p-0.5"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden="true">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    </button>
  </span>
);

export default Home;
