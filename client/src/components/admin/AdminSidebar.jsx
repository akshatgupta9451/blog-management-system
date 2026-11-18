import { NavLink } from 'react-router';
import { ROUTES } from '@/constants';
import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/format';

const LINKS = [
  { to: ROUTES.ADMIN, label: 'Dashboard', icon: 'dashboard', end: true },
  { to: ROUTES.ADMIN_ANALYTICS, label: 'Analytics', icon: 'sparkles' },
  { to: ROUTES.ADMIN_USERS, label: 'Users', icon: 'user' },
  { to: ROUTES.ADMIN_BLOGS, label: 'Blogs', icon: 'document' },
  { to: ROUTES.ADMIN_COMMENTS, label: 'Comments', icon: 'chat' },
];

const AdminSidebar = () => (
  <aside className="lg:w-56 lg:shrink-0">
    <p className="mb-3 hidden items-center gap-2 px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase lg:flex">
      <Icon name="shield" className="size-4" />
      Admin panel
    </p>
    <nav
      aria-label="Admin"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )
          }
        >
          <Icon name={link.icon} />
          {link.label}
        </NavLink>
      ))}
      <NavLink
        to={ROUTES.DASHBOARD}
        className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 lg:mt-4 lg:border-t lg:border-gray-200 lg:pt-4"
      >
        <Icon name="site" />
        Back to my dashboard
      </NavLink>
    </nav>
  </aside>
);

export default AdminSidebar;
