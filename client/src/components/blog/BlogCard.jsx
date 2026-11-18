import { Link } from 'react-router';
import { blogPath } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import CloudImage from '@/components/ui/CloudImage';
import Icon from '@/components/ui/Icon';
import { formatCount, formatDate } from '@/utils/format';

/**
 * `meta` replaces the date line (e.g. "Bookmarked 2 days ago");
 * `action` renders in the card corner (e.g. a remove-from-bookmarks button).
 */
const BlogCard = ({ blog, meta, action }) => (
  <article className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
    {action && <div className="absolute top-3 right-3 z-10">{action}</div>}
    <Link
      to={blogPath(blog.slug)}
      className="block aspect-[2/1] overflow-hidden bg-gray-100"
      tabIndex={-1}
    >
      {blog.coverImage?.url ? (
        <CloudImage
          src={blog.coverImage.url}
          widths={[400, 640, 960]}
          sizes="(min-width: 1280px) 290px, (min-width: 640px) 50vw, 100vw"
          aspectRatio={2}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="from-primary-100 to-primary-50 text-primary-300 flex size-full items-center justify-center bg-gradient-to-br text-4xl font-bold uppercase">
          {blog.category?.[0]}
        </div>
      )}
    </Link>

    <div className="flex flex-1 flex-col p-5">
      <Link
        to={`/?category=${encodeURIComponent(blog.category)}`}
        className="text-primary-600 self-start text-xs font-semibold tracking-wide uppercase hover:underline"
      >
        {blog.category}
      </Link>

      <h3 className="mt-2 line-clamp-2 text-lg leading-snug font-semibold text-gray-900">
        <Link to={blogPath(blog.slug)} className="group-hover:text-primary-700">
          {blog.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">{blog.description}</p>

      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
        <Avatar user={blog.author} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {blog.author?.name ?? 'Deleted user'}
          </p>
          <p className="truncate text-xs text-gray-500">
            {meta ?? <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1" title={`${blog.views} views`}>
            <Icon name="eye" className="size-4" />
            {formatCount(blog.views)}
          </span>
          <span className="flex items-center gap-1" title={`${blog.likesCount ?? 0} likes`}>
            <Icon name="heart" className="size-4" />
            {formatCount(blog.likesCount)}
          </span>
        </div>
      </div>
    </div>
  </article>
);

export const BlogCardSkeleton = () => (
  <div
    className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
    aria-hidden="true"
  >
    <div className="aspect-[2/1] bg-gray-200" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-16 rounded bg-gray-200" />
      <div className="h-5 w-4/5 rounded bg-gray-200" />
      <div className="h-3 w-full rounded bg-gray-200" />
      <div className="h-3 w-2/3 rounded bg-gray-200" />
      <div className="flex items-center gap-3 pt-3">
        <div className="size-8 rounded-full bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

export default BlogCard;
