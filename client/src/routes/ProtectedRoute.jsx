import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

const DENIED_MESSAGES = {
  admin: 'This area is for administrators only.',
  default:
    "Your account doesn't have permission to write blogs. Ask an admin to make you an author.",
};

/**
 * Wrap routes that need a logged-in user. With `roles`, also requires one of those roles.
 * Anonymous users are sent to /login and returned here afterwards.
 */
const ProtectedRoute = ({ roles }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Loader fullScreen />;

  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;

  if (roles && !roles.includes(user.role)) {
    return (
      <EmptyState
        tone="error"
        title="You don't have access to this page"
        message={
          roles.length === 1 && roles[0] === 'admin'
            ? DENIED_MESSAGES.admin
            : DENIED_MESSAGES.default
        }
        action={<Button to={ROUTES.DASHBOARD}>Back to dashboard</Button>}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
