import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import { deleteBlog, getMyBlogs } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { BLOG_STATUS, ROUTES } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import SearchBar from '@/components/common/SearchBar';
import BlogList from '@/components/dashboard/BlogList';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { controlClasses } from '@/components/ui/formStyles';
import { cn } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const PAGE_SIZE = 10;

const COPY = {
  all: {
    title: 'My blogs',
    description: 'Everything you have written, in every status.',
    empty: "You haven't written anything yet",
  },
  [BLOG_STATUS.DRAFT]: {
    title: 'Drafts',
    description: 'Posts only you can see until you publish them.',
    empty: 'No drafts',
  },
  [BLOG_STATUS.PUBLISHED]: {
    title: 'Published',
    description: 'Posts that are live for everyone.',
    empty: 'Nothing published yet',
  },
};

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: BLOG_STATUS.PUBLISHED, label: 'Published' },
  { value: BLOG_STATUS.DRAFT, label: 'Drafts' },
  { value: BLOG_STATUS.ARCHIVED, label: 'Archived' },
];

const SORTS = [
  { value: '-updatedAt', label: 'Recently updated' },
  { value: '-createdAt', label: 'Newest' },
  { value: '-views', label: 'Most viewed' },
  { value: 'title', label: 'Title (A–Z)' },
];

/**
 * The user's blogs. `status` fixes the list to Drafts or Published (separate sidebar
 * entries); without it, the page shows everything with a status filter.
 */
const MyBlogs = ({ status: fixedStatus }) => {
  const { canWrite } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const status = fixedStatus ?? searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') || '-updatedAt';
  const page = Number(searchParams.get('page')) || 1;
  const copy = COPY[fixedStatus ?? 'all'];

  const { data, loading, error, reload } = useFetch(
    (signal) => getMyBlogs({ status, search, sort, page, limit: PAGE_SIZE }, { signal }),
    [status, search, sort, page]
  );

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBlog(pendingDelete._id);
      toast.success('Blog deleted');
      setPendingDelete(null);
      // If that was the last item on this page, step back a page
      if (data?.blogs.length === 1 && page > 1) updateParam('page', String(page - 1));
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const blogs = data?.blogs ?? [];
  const filtered = Boolean(search || (!fixedStatus && status));

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={canWrite && <Button to={ROUTES.CREATE_BLOG}>New blog</Button>}
      />

      <section className="rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center">
          <SearchBar
            value={search}
            onSearch={(value) => updateParam('search', value)}
            placeholder={`Search ${copy.title.toLowerCase()}`}
            className="md:flex-1"
          />
          <div className="flex gap-3">
            {!fixedStatus && (
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) => updateParam('status', event.target.value)}
                className={cn(controlClasses(false), 'h-10 md:w-40')}
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Sort"
              value={sort}
              onChange={(event) =>
                updateParam('sort', event.target.value === '-updatedAt' ? '' : event.target.value)
              }
              className={cn(controlClasses(false), 'h-10 md:w-44')}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorState error={error} title="Couldn't load your blogs" onRetry={reload} />
          </div>
        ) : loading && !data ? (
          <Loader label="Loading your blogs…" />
        ) : blogs.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={filtered ? 'No blogs match' : copy.empty}
              message={filtered ? 'Try a different search or filter.' : undefined}
              action={
                !filtered && canWrite && <Button to={ROUTES.CREATE_BLOG}>Write a blog</Button>
              }
            />
          </div>
        ) : (
          <BlogList
            blogs={blogs}
            canWrite={canWrite}
            onDelete={setPendingDelete}
            dimmed={loading}
          />
        )}

        {data && (
          <Pagination
            pagination={data.pagination}
            onPageChange={(next) => updateParam('page', next > 1 ? String(next) : '')}
            className="border-t border-gray-100 p-4"
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this blog?"
        message={
          pendingDelete &&
          `“${pendingDelete.title}” will be permanently deleted. This can't be undone.`
        }
        confirmLabel="Delete"
      />
    </>
  );
};

export default MyBlogs;
