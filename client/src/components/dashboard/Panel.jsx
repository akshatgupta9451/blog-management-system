import { Link } from 'react-router';
import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/format';

/** Card with a title row and an optional "View all" link, used across the dashboard. */
const Panel = ({ title, description, viewAllTo, actions, className, bodyClassName, children }) => (
  <section className={cn('rounded-xl border border-gray-200 bg-white shadow-xs', className)}>
    <header className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {actions}
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-primary-600 hover:text-primary-700 inline-flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          View all
          <Icon name="arrowRight" className="size-4" />
        </Link>
      )}
    </header>
    <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
  </section>
);

export default Panel;
