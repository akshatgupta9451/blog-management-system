import { Link } from 'react-router';
import { blogPath, editBlogPath } from '@/constants';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import CloudImage from '@/components/ui/CloudImage';
import { cn, formatCount, formatDate } from '@/utils/format';

/**
 * The user's blogs as rows. `compact` is for overview widgets (title + meta + Edit);
 * the full version adds a thumbnail, View and Delete (`onDelete(blog)` opens the confirm).
 */
const BlogList = ({ blogs, compact = false, canWrite = true, onDelete, dimmed = false }) => (
  <ul className={cn('divide-y divide-gray-100 transition-opacity', dimmed && 'opacity-50')}>
    {blogs.map((blog) => (
      <li
        key={blog._id}
        className={cn(
          'flex gap-4',
          compact ? 'items-center py-3' : 'flex-col p-4 sm:flex-row sm:items-center'
        )}
      >
        {!compact && (
          <Link
            to={blogPath(blog.slug)}
            tabIndex={-1}
            className="hidden h-14 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:block"
          >
            {blog.coverImage?.url ? (
              <CloudImage
                src={blog.coverImage.url}
                widths={[96, 192]}
                sizes="96px"
                aspectRatio={96 / 56}
                className="size-full object-cover"
              />
            ) : (
              <span className="from-primary-100 to-primary-50 text-primary-300 flex size-full items-center justify-center bg-gradient-to-br text-lg font-bold uppercase">
                {blog.category?.[0]}
              </span>
            )}
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {!compact && (
            <div className="flex items-center gap-2">
              <StatusBadge status={blog.status} />
              <span className="text-xs text-gray-400 capitalize">{blog.category}</span>
            </div>
          )}
          <Link
            to={blogPath(blog.slug)}
            className={cn(
              'hover:text-primary-700 block truncate font-medium text-gray-900',
              !compact && 'mt-1'
            )}
          >
            {blog.title}
          </Link>
          <p className="mt-0.5 text-xs text-gray-500">
            Updated {formatDate(blog.updatedAt)} · {formatCount(blog.views)} views
          </p>
        </div>

        {canWrite && (
          <div className="flex shrink-0 gap-2">
            {!compact && (
              <Button to={blogPath(blog.slug)} variant="ghost" size="sm">
                View
              </Button>
            )}
            <Button to={editBlogPath(blog.slug)} variant="secondary" size="sm">
              Edit
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(blog)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </li>
    ))}
  </ul>
);

export default BlogList;
