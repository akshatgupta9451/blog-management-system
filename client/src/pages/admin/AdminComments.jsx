import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { deleteComment, getComments } from '@/services/admin.service';
import { useFetch } from '@/hooks/useFetch';
import { useQueryParams } from '@/hooks/useQueryParams';
import { blogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import { AdminToolbar } from '@/components/admin/AdminToolbar';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { cn, timeAgo } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const AdminComments = () => {
  const [params, update, key] = useQueryParams(['search', 'page']);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useFetch(
    (signal) => getComments({ ...params, limit: 20 }, { signal }),
    [key]
  );

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { deleted } = await deleteComment(pendingDelete._id);
      toast.success(
        deleted > 1
          ? `Deleted the comment and ${deleted - 1} repl${deleted === 2 ? 'y' : 'ies'}`
          : 'Comment deleted'
      );
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const comments = data?.comments ?? [];

  return (
    <>
      <PageHeader
        title="Comments"
        description="Newest first. Deleting a comment also removes the replies under it."
      />
      <section className="rounded-xl border border-gray-200 bg-white shadow-xs">
        <AdminToolbar
          search={params.search}
          onSearch={(value) => update('search', value)}
          placeholder="Search comment text"
        />

        {error ? (
          <div className="p-4">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : !data ? (
          <Loader label="Loading comments…" />
        ) : comments.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={params.search ? 'No comments match' : 'No comments yet'}
              message={
                params.search
                  ? 'Try different words.'
                  : 'Comments readers post on blogs will appear here for moderation.'
              }
            />
          </div>
        ) : (
          <ul
            className={cn('divide-y divide-gray-100 transition-opacity', loading && 'opacity-50')}
          >
            {comments.map((comment) => (
              <li key={comment._id} className="flex gap-3 p-4">
                <Avatar user={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      {comment.author?.name ?? 'Deleted user'}
                    </span>
                    <span className="text-gray-400"> on </span>
                    {comment.blog ? (
                      <Link
                        to={blogPath(comment.blog.slug)}
                        className="hover:text-primary-700 font-medium text-gray-700"
                      >
                        {comment.blog.title}
                      </Link>
                    ) : (
                      <span className="text-gray-500">a deleted blog</span>
                    )}
                    <span className="text-gray-400"> · {timeAgo(comment.createdAt)}</span>
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {comment.likesCount} like{comment.likesCount === 1 ? '' : 's'} ·{' '}
                    {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
                    {comment.parent && ' · reply'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(comment)}
                  className="h-fit rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
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
        title="Delete this comment?"
        message={
          pendingDelete &&
          (pendingDelete.replyCount
            ? `This comment has replies. The comment and every reply beneath it will be deleted.`
            : 'The comment will be permanently deleted.')
        }
        confirmLabel="Delete"
      />
    </>
  );
};

export default AdminComments;
