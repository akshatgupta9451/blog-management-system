import { Link } from 'react-router';
import { blogPath } from '@/constants';
import { cn } from '@/utils/format';
import CloudImage from '@/components/ui/CloudImage';

/** Dense list of blogs for sidebars and widgets. `meta(blog)` renders the second line. */
const CompactBlogList = ({ blogs, ranked = false, meta }) => (
  <ol className="divide-y divide-gray-100">
    {blogs.map((blog, index) => (
      <li key={blog._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
        {ranked && (
          <span
            className={cn(
              'w-6 shrink-0 text-center text-xl font-bold tabular-nums',
              index < 3 ? 'text-primary-500' : 'text-gray-300'
            )}
            aria-label={`Rank ${index + 1}`}
          >
            {index + 1}
          </span>
        )}
        <Link
          to={blogPath(blog.slug)}
          tabIndex={-1}
          className="size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100"
        >
          {blog.coverImage?.url ? (
            <CloudImage
              src={blog.coverImage.url}
              widths={[48, 96]}
              sizes="48px"
              aspectRatio={1}
              className="size-full object-cover"
            />
          ) : (
            <span className="from-primary-100 to-primary-50 text-primary-300 flex size-full items-center justify-center bg-gradient-to-br font-bold uppercase">
              {blog.category?.[0]}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={blogPath(blog.slug)}
            className="hover:text-primary-700 line-clamp-2 text-sm leading-snug font-medium text-gray-900"
          >
            {blog.title}
          </Link>
          {meta && <p className="mt-0.5 truncate text-xs text-gray-500">{meta(blog)}</p>}
        </div>
      </li>
    ))}
  </ol>
);

export default CompactBlogList;
