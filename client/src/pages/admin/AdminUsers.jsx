import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteUser, getUsers, setUserRole } from '@/services/admin.service';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ROLES } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import { AdminToolbar, Td, Th } from '@/components/admin/AdminToolbar';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { controlClasses } from '@/components/ui/formStyles';
import { cn, formatCount, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const ROLE_OPTIONS = [
  { value: ROLES.USER, label: 'Reader' },
  { value: ROLES.AUTHOR, label: 'Author' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [params, update, key] = useQueryParams(['search', 'role', 'sort', 'page']);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload, setData } = useFetch(
    (signal) => getUsers({ ...params, limit: 20 }, { signal }),
    [key]
  );

  const changeRole = async (user, role) => {
    const previous = user.role;
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u._id === user._id ? { ...u, role } : u)),
    }));
    try {
      await setUserRole(user._id, role);
      toast.success(`${user.name} is now ${role === ROLES.USER ? 'a reader' : `an ${role}`}`);
    } catch (err) {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u._id === user._id ? { ...u, role: previous } : u)),
      }));
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { deletedBlogs } = await deleteUser(pendingDelete._id);
      toast.success(
        `Deleted ${pendingDelete.name}${deletedBlogs ? ` and ${deletedBlogs} blog${deletedBlogs === 1 ? '' : 's'}` : ''}`
      );
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const users = data?.users ?? [];

  return (
    <>
      <PageHeader title="Users" description="Search accounts, change roles and remove users." />
      <section className="rounded-xl border border-gray-200 bg-white shadow-xs">
        <AdminToolbar
          search={params.search}
          onSearch={(value) => update('search', value)}
          placeholder="Search by name or email"
          filters={[
            {
              label: 'Role',
              value: params.role,
              onChange: (v) => update('role', v),
              options: [{ value: '', label: 'All roles' }, ...ROLE_OPTIONS],
            },
            {
              label: 'Sort',
              value: params.sort,
              onChange: (v) => update('sort', v),
              options: [
                { value: '', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'name', label: 'Name (A–Z)' },
              ],
            },
          ]}
        />

        {error ? (
          <div className="p-4">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : !data ? (
          <Loader label="Loading users…" />
        ) : users.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No users found" message="Try another name, email or role." />
          </div>
        ) : (
          <div
            className={cn('relative overflow-x-auto transition-opacity', loading && 'opacity-50')}
          >
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-gray-100">
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Posts</Th>
                  <Th className="text-right">Views</Th>
                  <Th>Joined</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isMe = user._id === me._id;
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar user={user} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {user.name}{' '}
                              {isMe && (
                                <span className="text-xs font-normal text-gray-400">(you)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <select
                          aria-label={`Role for ${user.name}`}
                          value={user.role}
                          disabled={isMe}
                          title={isMe ? "You can't change your own role" : undefined}
                          onChange={(event) => changeRole(user, event.target.value)}
                          className={cn(controlClasses(false), 'h-9 w-28 py-1.5')}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {user.stats.published}
                        <span className="text-gray-400">/{user.stats.total}</span>
                      </Td>
                      <Td className="text-right tabular-nums">{formatCount(user.stats.views)}</Td>
                      <Td className="whitespace-nowrap text-gray-500">
                        {formatDate(user.createdAt)}
                      </Td>
                      <Td className="text-right">
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => setPendingDelete(user)}
                            className="rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </Td>
                    </tr>
                  );
                })}
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
        title={`Delete ${pendingDelete?.name ?? 'user'}?`}
        message={
          pendingDelete &&
          `This permanently deletes the account, its ${pendingDelete.stats.total} blog${pendingDelete.stats.total === 1 ? '' : 's'}, their likes, bookmarks and history. Their comments on other posts are removed, or anonymised where people replied. This can't be undone.`
        }
        confirmLabel="Delete user"
      />
    </>
  );
};

export default AdminUsers;
