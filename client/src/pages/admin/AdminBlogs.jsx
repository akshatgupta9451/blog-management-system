import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { deleteBlog, getBlogs, setBlogStatus } from '@/services/admin.service';
import { useFetch } from '@/hooks/useFetch';
import { useQueryParams } from '@/hooks/useQueryParams';
import { BLOG_STATUS, blogPath, editBlogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import { AdminToolbar, Td, Th } from '@/components/admin/AdminToolbar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { controlClasses } from '@/components/ui/formStyles';
import { cn, formatCount, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const STATUS_OPTIONS = [
  { value: BLOG_STATUS.PUBLISHED, label: 'Published' },
  { value: BLOG_STATUS.DRAFT, label: 'Draft' },
  { value: BLOG_STATUS.ARCHIVED, label: 'Archived' },
];

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'views', label: 'Most viewed' },
  { value: 'likes', label: 'Most liked' },
  { value: 'title', label: 'Title (A–Z)' },
];

const AdminBlogs = () => {
  const [params, update, key] = useQueryParams(['search', 'status', 'author', 'sort', 'page']);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload, setData } = useFetch(
    (signal) => getBlogs({ ...params, limit: 20 }, { signal }),
    [key]
  );

  const replace = (id, patch) =>
    setData((prev) => ({
      ...prev,
      blogs: prev.blogs.map((b) => (b._id === id ? { ...b, ...patch } : b)),
    }));

  const changeStatus = async (blog, status) => {
    replace(blog._id, { status });
    try {
      await setBlogStatus(blog._id, status);
      toast.success(`“${blog.title}” is now ${status}`);
    } catch (err) {
      replace(blog._id, { status: blog.status });
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteBlog(pendingDelete._id);
      toast.success('Blog deleted');
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const blogs = data?.blogs ?? [];

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Every post in every status. Moderate, edit or remove."
      />
      <section className="rounded-xl border border-gray-200 bg-white shadow-xs">
        <AdminToolbar
          search={params.search}
          onSearch={(value) => update('search', value)}
          placeholder="Search titles"
          filters={[
            {
              label: 'Status',
              value: params.status,
              onChange: (v) => update('status', v),
              options: [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS],
            },
            {
              label: 'Sort',
              value: params.sort,
              onChange: (v) => update('sort', v),
              options: SORTS,
            },
          ]}
        />
        {params.author && (
          <p className="border-b border-gray-100 px-4 py-2 text-sm text-gray-600">
            Showing posts by <strong>{data?.applied?.author ?? params.author}</strong>{' '}
            <button
              type="button"
              onClick={() => update('author', '')}
              className="text-primary-600 ml-1 hover:underline"
            >
              Show all authors
            </button>
          </p>
        )}

        {error ? (
          <div className="p-4">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : !data ? (
          <Loader label="Loading blogs…" />
        ) : blogs.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No blogs found" message="Try another search or status." />
          </div>
        ) : (
          <div
            className={cn('relative overflow-x-auto transition-opacity', loading && 'opacity-50')}
          >
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-gray-100">
                <tr>
                  <Th>Blog</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Views</Th>
                  <Th className="text-right">Likes</Th>
                  <Th className="text-right">Comments</Th>
                  <Th>Created</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <Td className="max-w-xs">
                      <Link
                        to={blogPath(blog.slug)}
                        className="hover:text-primary-700 block truncate font-medium text-gray-900"
                      >
                        {blog.title}
                      </Link>
                      <p className="truncate text-xs text-gray-500">
                        {blog.author ? (
                          <button
                            type="button"
                            onClick={() => update('author', blog.author._id)}
                            className="hover:text-primary-700 hover:underline"
                          >
                            {blog.author.name}
                          </button>
                        ) : (
                          'Deleted user'
                        )}
                        <span className="capitalize"> · {blog.category}</span>
                      </p>
                    </Td>
                    <Td>
                      <select
                        aria-label={`Status of ${blog.title}`}
                        value={blog.status}
                        onChange={(event) => changeStatus(blog, event.target.value)}
                        className={cn(controlClasses(false), 'h-9 w-32 py-1.5')}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Td>
                    <Td className="text-right tabular-nums">{formatCount(blog.views)}</Td>
                    <Td className="text-right tabular-nums">{formatCount(blog.likesCount)}</Td>
                    <Td className="text-right tabular-nums">{formatCount(blog.commentsCount)}</Td>
                    <Td className="whitespace-nowrap text-gray-500">
                      {formatDate(blog.createdAt)}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <Link
                        to={editBlogPath(blog.slug)}
                        className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(blog)}
                        className="rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && (
          <Pagination
            pagination={data.pagination}
            onPageChange={(p) => update('page', p > 1 ? String(p) : '')}
            className="border-t border-gray-100 p-4"
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this blog?"
        message={
          pendingDelete &&
          `“${pendingDelete.title}” by ${pendingDelete.author?.name ?? 'a deleted user'} will be permanently deleted with its cover, likes, bookmarks and comments.`
        }
        confirmLabel="Delete blog"
      />
    </>
  );
};

export default AdminBlogs;
