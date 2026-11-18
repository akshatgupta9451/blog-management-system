import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Loader from '@/components/ui/Loader';

/** Login and register pages: logged-in users are sent to the dashboard instead. */
const GuestRoute = () => {
  const { user, initializing } = useAuth();

  if (initializing) return <Loader fullScreen />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
};

export default GuestRoute;
