import { Link } from 'react-router';
import { useFetch } from '@/hooks/useFetch';
import Icon from '@/components/ui/Icon';
import CompactBlogList from './CompactBlogList';

/**
 * Sidebar card that loads a short list of blogs (popular, recently viewed, …).
 * Hides itself when there's nothing to show or the request fails; it's supplementary content.
 */
const DiscoveryWidget = ({ title, icon, fetcher, deps = [], ranked, meta, viewAllTo }) => {
  const { data: blogs, error } = useFetch(fetcher, deps);

  if (error || (blogs && blogs.length === 0)) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Icon name={icon} className="text-primary-500 size-4" />
          {title}
        </h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="text-primary-600 text-xs font-medium hover:underline">
            View all
          </Link>
        )}
      </div>
      {blogs ? (
        <CompactBlogList blogs={blogs} ranked={ranked} meta={meta} />
      ) : (
        <div className="space-y-3" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="size-12 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 rounded bg-gray-100" />
                <div className="h-2.5 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DiscoveryWidget;
