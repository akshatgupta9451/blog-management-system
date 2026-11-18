import { Link } from 'react-router';
import { blogPath } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import CloudImage from '@/components/ui/CloudImage';
import Icon from '@/components/ui/Icon';
import Highlight from '@/components/common/Highlight';
import { formatCount, formatDate } from '@/utils/format';

/** One search hit: thumbnail, highlighted title/description, author, date and stats. */
const SearchResult = ({ blog, terms }) => (
  <article className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md sm:gap-5">
    <Link
      to={blogPath(blog.slug)}
      tabIndex={-1}
      className="hidden aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block"
    >
      {blog.coverImage?.url ? (
        <CloudImage
          src={blog.coverImage.url}
          widths={[144, 288]}
          sizes="144px"
          aspectRatio={4 / 3}
          className="size-full object-cover"
        />
      ) : (
        <span className="from-primary-100 to-primary-50 text-primary-300 flex size-full items-center justify-center bg-gradient-to-br text-3xl font-bold uppercase">
          {blog.category?.[0]}
        </span>
      )}
    </Link>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="text-primary-600 font-semibold tracking-wide uppercase">
          {blog.category}
        </span>
        {blog.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="text-gray-400">
            #{tag}
          </span>
        ))}
      </div>

      <h2 className="mt-1 text-lg leading-snug font-semibold text-gray-900">
        <Link to={blogPath(blog.slug)} className="group-hover:text-primary-700">
          <Highlight text={blog.title} terms={terms} />
        </Link>
      </h2>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
        <Highlight text={blog.description} terms={terms} />
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <Avatar user={blog.author} size="xs" />
          <span className="font-medium text-gray-700">{blog.author?.name ?? 'Deleted user'}</span>
        </span>
        <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
        <span className="flex items-center gap-1">
          <Icon name="eye" className="size-4" />
          {formatCount(blog.views)}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="heart" className="size-4" />
          {formatCount(blog.likesCount)}
        </span>
      </div>
    </div>
  </article>
);

export const SearchResultSkeleton = () => (
  <div
    className="flex animate-pulse gap-5 rounded-xl border border-gray-200 bg-white p-4"
    aria-hidden="true"
  >
    <div className="hidden aspect-[4/3] w-36 rounded-lg bg-gray-100 sm:block" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-3 w-20 rounded bg-gray-100" />
      <div className="h-5 w-3/4 rounded bg-gray-100" />
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-1/3 rounded bg-gray-100" />
    </div>
  </div>
);

export default SearchResult;
