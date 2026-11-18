import { NavLink } from 'react-router';
import { ROLES, ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/format';

const linkClass = ({ isActive }) =>
  cn(
    'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  );

/** Dashboard navigation. Grouped list on desktop, one scrollable row on mobile. */
const Sidebar = () => {
  const { user, canWrite } = useAuth();

  const groups = [
    {
      label: 'Dashboard',
      links: [{ to: ROUTES.DASHBOARD, label: 'Overview', icon: 'dashboard', end: true }],
    },
    canWrite && {
      label: 'Content',
      links: [
        { to: ROUTES.MY_BLOGS, label: 'My blogs', icon: 'document', end: true },
        { to: ROUTES.DRAFTS, label: 'Drafts', icon: 'write' },
        { to: ROUTES.PUBLISHED, label: 'Published', icon: 'published' },
      ],
    },
    {
      label: 'Library',
      links: [
        { to: ROUTES.BOOKMARKS, label: 'Bookmarks', icon: 'bookmark' },
        { to: ROUTES.LIKED, label: 'Liked', icon: 'heart' },
        { to: ROUTES.HISTORY, label: 'Reading history', icon: 'clock' },
      ],
    },
    {
      label: 'Account',
      links: [
        { to: ROUTES.ACTIVITY, label: 'Activity', icon: 'sparkles' },
        { to: ROUTES.PROFILE, label: 'Profile & settings', icon: 'user' },
        user?.role === ROLES.ADMIN && { to: ROUTES.ADMIN, label: 'Admin panel', icon: 'shield' },
        { to: ROUTES.HOME, label: 'View site', icon: 'site', end: true },
      ],
    },
  ].filter(Boolean);

  return (
    <aside className="lg:w-60 lg:shrink-0">
      <div className="hidden items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs lg:flex">
        <Avatar user={user} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {canWrite && (
        <NavLink
          to={ROUTES.CREATE_BLOG}
          className="bg-primary-600 hover:bg-primary-700 mt-4 hidden h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-white lg:flex"
        >
          <Icon name="write" className="size-4" />
          Write a blog
        </NavLink>
      )}

      <nav
        aria-label="Dashboard"
        className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:mt-6 lg:flex-col lg:gap-6 lg:overflow-visible lg:px-0"
      >
        {groups.map((group) => (
          <div key={group.label} className="flex gap-1 lg:flex-col">
            <p className="hidden px-3 pb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase lg:block">
              {group.label}
            </p>
            {group.links.filter(Boolean).map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <Icon name={link.icon} />
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
