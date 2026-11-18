import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import { useFetch } from '@/hooks/useFetch';
import { ROUTES } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import BlogCard, { BlogCardSkeleton } from '@/components/blog/BlogCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const PAGE_SIZE = 12;

/**
 * Shared page for Bookmarks, Liked and Reading history: a paginated grid of blog cards,
 * each with a remove button. Removal is optimistic and restored if the request fails.
 */
const LibraryPage = ({
  title,
  description,
  fetcher,
  meta,
  removeLabel,
  onRemove,
  emptyTitle,
  emptyMessage,
  headerActions,
  reloadKey = 0,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const [removing, setRemoving] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(
    (signal) => fetcher({ page, limit: PAGE_SIZE }, { signal }),
    [page, reloadKey]
  );

  const remove = async (blog) => {
    setRemoving(blog._id);
    const snapshot = data;
    setData((prev) => ({
      blogs: prev.blogs.filter((item) => item._id !== blog._id),
      pagination: { ...prev.pagination, totalDocs: prev.pagination.totalDocs - 1 },
    }));
    try {
      await onRemove(blog);
      // Refill the page from the server if we just emptied it
      if (snapshot.blogs.length === 1) {
        if (page > 1) setSearchParams({ page: String(page - 1) });
        else reload();
      }
    } catch (err) {
      setData(snapshot);
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  const blogs = data?.blogs ?? [];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={headerActions?.(blogs.length > 0)}
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          action={<Button to={ROUTES.HOME}>Browse blogs</Button>}
        />
      ) : (
        <>
          <div
            className={cn(
              'grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3',
              loading && 'opacity-50'
            )}
          >
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                meta={meta(blog)}
                action={
                  <button
                    type="button"
                    onClick={() => remove(blog)}
                    disabled={removing === blog._id}
                    aria-label={`${removeLabel}: ${blog.title}`}
                    title={removeLabel}
                    className="flex size-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm ring-1 ring-gray-200 backdrop-blur hover:bg-white hover:text-red-600"
                  >
                    <Icon name="close" className="size-4" />
                  </button>
                }
              />
            ))}
          </div>
          <Pagination
            pagination={data.pagination}
            onPageChange={(next) => setSearchParams(next > 1 ? { page: String(next) } : {})}
            className="mt-8"
          />
        </>
      )}
    </>
  );
};

export default LibraryPage;
