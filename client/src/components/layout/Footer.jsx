import { Link } from 'react-router';
import { APP_NAME, ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_NAME}
        </p>
        <nav aria-label="Footer" className="flex gap-5">
          <Link to={ROUTES.HOME} className="hover:text-gray-900">
            Home
          </Link>
          {user ? (
            <>
              <Link to={ROUTES.DASHBOARD} className="hover:text-gray-900">
                Dashboard
              </Link>
              <Link to={ROUTES.PROFILE} className="hover:text-gray-900">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="hover:text-gray-900">
                Log in
              </Link>
              <Link to={ROUTES.REGISTER} className="hover:text-gray-900">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
