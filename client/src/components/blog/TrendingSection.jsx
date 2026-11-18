import { Link } from 'react-router';
import { getTrending } from '@/services/engagement.service';
import { useFetch } from '@/hooks/useFetch';
import { blogPath } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { countLabel } from '@/utils/format';

const TRENDING_LIMIT = 6;

/** Top posts by views + likes over the last 7 days. Hidden until there's something trending. */
const TrendingSection = () => {
  const { data: blogs } = useFetch((signal) => getTrending(TRENDING_LIMIT, { signal }), []);
  if (!blogs?.length) return null;

  return (
    <section aria-labelledby="trending-heading">
      <h2
        id="trending-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-900 uppercase"
      >
        <Icon name="fire" className="size-5 text-orange-500" />
        Trending this week
      </h2>
      <ol className="mt-4 grid gap-x-8 gap-y-6 border-b border-gray-200 pb-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog, index) => (
          <li key={blog._id} className="flex gap-4">
            <span className="text-3xl leading-none font-bold text-gray-200 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Avatar user={blog.author} size="xs" />
                <span className="truncate text-xs font-medium text-gray-700">
                  {blog.author?.name}
                </span>
              </div>
              <Link
                to={blogPath(blog.slug)}
                className="hover:text-primary-700 mt-1.5 line-clamp-2 leading-snug font-semibold text-gray-900"
              >
                {blog.title}
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                {countLabel(blog.trending.views, 'view')} ·{' '}
                {countLabel(blog.trending.likes, 'like')} this week
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default TrendingSection;
