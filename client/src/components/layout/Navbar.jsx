import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { APP_NAME, ROLES, ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/format';

const navLinkClass = ({ isActive }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'text-primary-700 bg-primary-50'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  );

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (
        event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const item = 'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="focus-visible:outline-primary-600 flex items-center gap-2 rounded-full p-0.5 focus-visible:outline-2"
      >
        <Avatar user={user} size="sm" />
        <span className="sr-only">Open user menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            to={ROUTES.DASHBOARD}
            className={item}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link role="menuitem" to={ROUTES.PROFILE} className={item} onClick={() => setOpen(false)}>
            Profile
          </Link>
          {user.role === ROLES.ADMIN && (
            <Link role="menuitem" to={ROUTES.ADMIN} className={item} onClick={() => setOpen(false)}>
              Admin panel
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            className={cn(item, 'text-red-600')}
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, canWrite, logout, initializing } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating (adjusting state during render, not in an effect)
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to={ROUTES.HOME} className="text-primary-600 shrink-0 text-lg font-bold">
          {APP_NAME}
        </Link>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          <NavLink to={ROUTES.HOME} end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to={ROUTES.SEARCH} className={navLinkClass}>
            Search
          </NavLink>
          {user && (
            <NavLink to={ROUTES.DASHBOARD} end className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {user?.role === ROLES.ADMIN && (
            <NavLink to={ROUTES.ADMIN} className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {initializing ? null : user ? (
            <>
              {canWrite && (
                <Button to={ROUTES.CREATE_BLOG} size="sm">
                  Write
                </Button>
              )}
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Button to={ROUTES.LOGIN} variant="ghost" size="sm">
                Log in
              </Button>
              <Button to={ROUTES.REGISTER} size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="ml-auto rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-6"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="space-y-1 border-t border-gray-200 bg-white px-4 py-3 md:hidden"
        >
          <NavLink to={ROUTES.HOME} end className={(s) => cn(navLinkClass(s), 'block')}>
            Home
          </NavLink>
          <NavLink to={ROUTES.SEARCH} className={(s) => cn(navLinkClass(s), 'block')}>
            Search
          </NavLink>
          {user ? (
            <>
              <NavLink to={ROUTES.DASHBOARD} end className={(s) => cn(navLinkClass(s), 'block')}>
                Dashboard
              </NavLink>
              {user.role === ROLES.ADMIN && (
                <NavLink to={ROUTES.ADMIN} className={(s) => cn(navLinkClass(s), 'block')}>
                  Admin panel
                </NavLink>
              )}
              {canWrite && (
                <NavLink to={ROUTES.CREATE_BLOG} className={(s) => cn(navLinkClass(s), 'block')}>
                  Write a blog
                </NavLink>
              )}
              <NavLink to={ROUTES.PROFILE} className={(s) => cn(navLinkClass(s), 'block')}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </>
          ) : (
            !initializing && (
              <div className="flex gap-2 pt-2">
                <Button to={ROUTES.LOGIN} variant="secondary" className="flex-1">
                  Log in
                </Button>
                <Button to={ROUTES.REGISTER} className="flex-1">
                  Sign up
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
