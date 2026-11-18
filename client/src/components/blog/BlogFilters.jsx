import { getTaxonomy } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import { cn } from '@/utils/format';

const chip = (active) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors',
    active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  );

/** Category and tag filters, built from what's actually published (GET /blogs/taxonomy). */
const BlogFilters = ({ category, tag, onCategoryChange, onTagChange }) => {
  const { data, loading, error } = useFetch((signal) => getTaxonomy({ signal }), []);

  if (error) return null; // filters are a nice-to-have; the feed still works without them

  const categories = data?.categories ?? [];
  const tags = data?.tags ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
        {loading && !data ? (
          <div className="mt-3 space-y-2" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : categories.length ? (
          <ul className="mt-3 space-y-1">
            {categories.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(item.name === category ? '' : item.name)}
                  aria-pressed={item.name === category}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm capitalize',
                    item.name === category
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                  <span className="text-xs text-gray-400">{item.count}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No categories yet.</p>
        )}
      </section>

      {tags.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Popular tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onTagChange(item.name === tag ? '' : item.name)}
                aria-pressed={item.name === tag}
                className={chip(item.name === tag)}
              >
                #{item.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogFilters;
