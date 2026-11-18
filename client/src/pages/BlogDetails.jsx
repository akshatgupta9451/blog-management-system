import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { deleteBlog, getBlogBySlug } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { BLOG_STATUS, ROLES, ROUTES, editBlogPath } from '@/constants';
import BlogEngagement from '@/components/blog/BlogEngagement';
import Avatar from '@/components/ui/Avatar';
import CloudImage from '@/components/ui/CloudImage';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCount, formatDate, readingTime } from '@/utils/format';
import { getErrorMessage, getErrorStatus } from '@/utils/getErrorMessage';

const BlogDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refetch when the user changes: logging in may reveal the author's own draft
  const {
    data: blog,
    loading,
    error,
    reload,
  } = useFetch((signal) => getBlogBySlug(slug, { signal }), [slug, user?._id]);

  if (loading && !blog) return <Loader label="Loading blog…" />;

  if (error) {
    return getErrorStatus(error) === 404 ? (
      <EmptyState
        title="Blog not found"
        message="It may have been deleted, unpublished, or the link is wrong."
        action={<Button to={ROUTES.HOME}>Browse blogs</Button>}
      />
    ) : (
      <ErrorState error={error} title="Couldn't load this blog" onRetry={reload} />
    );
  }

  const isOwner = user && blog.author?._id === user._id;
  const canManage = isOwner || user?.role === ROLES.ADMIN;
  const isPublished = blog.status === BLOG_STATUS.PUBLISHED;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBlog(blog._id);
      toast.success('Blog deleted');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <article className="mx-auto max-w-3xl">
      {blog.status !== BLOG_STATUS.PUBLISHED && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <StatusBadge status={blog.status} />
          Only you{isOwner ? '' : ', the author'} and admins can see this post.
        </div>
      )}

      <header>
        <Link
          to={`/?category=${encodeURIComponent(blog.category)}`}
          className="text-primary-600 text-sm font-semibold tracking-wide uppercase hover:underline"
        >
          {blog.category}
        </Link>
        <h1 className="mt-2 text-3xl leading-tight font-bold text-gray-900 sm:text-4xl">
          {blog.title}
        </h1>
        <p className="mt-3 text-lg text-gray-600">{blog.description}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-gray-200 py-4">
          <div className="flex items-center gap-3">
            <Avatar user={blog.author} size="md" />
            <div>
              <p className="font-medium text-gray-900">{blog.author?.name ?? 'Deleted user'}</p>
              <p className="text-sm text-gray-500">
                <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
                {' · '}
                {readingTime(blog.content)} min read
                {' · '}
                {formatCount(blog.views)} views
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isPublished && <BlogEngagement key={`${blog._id}-${user?._id}`} blog={blog} />}
            {canManage && (
              <>
                <Button to={editBlogPath(blog.slug)} variant="secondary" size="sm">
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {blog.coverImage?.url && (
        <CloudImage
          src={blog.coverImage.url}
          widths={[640, 960, 1280, 1600]}
          sizes="(min-width: 800px) 768px, 100vw"
          aspectRatio={2}
          loading="eager"
          fetchPriority="high"
          className="mt-8 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      {/* Content is sanitized on the server (sanitize-html allow-list) before it is stored */}
      <div
        className="prose prose-lg prose-a:text-primary-600 mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {blog.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
          {blog.tags.map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {blog.author?.bio && (
        <aside className="mt-10 flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
          <Avatar user={blog.author} size="md" />
          <div>
            <p className="text-sm text-gray-500">Written by</p>
            <p className="font-semibold text-gray-900">{blog.author.name}</p>
            <p className="mt-1 text-sm text-gray-600">{blog.author.bio}</p>
          </div>
        </aside>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this blog?"
        message={`“${blog.title}” will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete"
      />
    </article>
  );
};

export default BlogDetails;
