import { ROUTES } from '@/constants';
import Button from '@/components/ui/Button';

const NotFound = () => (
  <section className="flex flex-col items-center py-20 text-center">
    <p className="text-primary-600 text-sm font-semibold">404</p>
    <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Page not found</h1>
    <p className="mt-3 max-w-md text-gray-600">
      Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have moved, or the link
      might be wrong.
    </p>
    <div className="mt-8 flex gap-3">
      <Button to={ROUTES.HOME}>Go home</Button>
      <Button variant="secondary" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  </section>
);

export default NotFound;
