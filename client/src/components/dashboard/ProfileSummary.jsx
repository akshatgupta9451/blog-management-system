import { ROLES, ROUTES } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { cn, formatDate } from '@/utils/format';

const ROLE_STYLES = {
  [ROLES.ADMIN]: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  [ROLES.AUTHOR]: 'bg-primary-50 text-primary-700 ring-primary-600/20',
  [ROLES.USER]: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

/** Profile card at the top of the dashboard overview. */
const ProfileSummary = ({ user }) => (
  <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
    <div
      className="from-primary-600 h-24 bg-gradient-to-r via-violet-500 to-sky-400"
      aria-hidden="true"
    />
    <div className="px-5 pb-5">
      <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
        <Avatar user={user} size="xl" className="ring-4 ring-white" />
        <Button to={ROUTES.PROFILE} variant="secondary" size="sm">
          Edit profile
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
            ROLE_STYLES[user.role]
          )}
        >
          {user.role}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        {user.email} · Member since {formatDate(user.createdAt)}
      </p>

      {user.bio ? (
        <p className="mt-3 max-w-2xl text-sm text-gray-700">{user.bio}</p>
      ) : (
        <p className="mt-3 text-sm text-gray-400 italic">
          No bio yet. Add one so readers know who&apos;s writing.
        </p>
      )}
    </div>
  </section>
);

export default ProfileSummary;
