import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/format';

/** Section wrapper for the profile/settings page. `danger` gives it a red treatment. */
const SettingsCard = ({ id, icon, title, description, danger = false, children }) => (
  <section
    id={id}
    aria-labelledby={id && `${id}-title`}
    className={cn(
      'scroll-mt-24 rounded-xl border bg-white shadow-xs',
      danger ? 'border-red-200' : 'border-gray-200'
    )}
  >
    <header
      className={cn(
        'flex items-start gap-3 border-b px-5 py-4 sm:px-6',
        danger ? 'border-red-100 bg-red-50/50' : 'border-gray-100'
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          danger ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600'
        )}
      >
        <Icon name={icon} />
      </span>
      <div>
        <h2
          id={id && `${id}-title`}
          className={cn('font-semibold', danger ? 'text-red-700' : 'text-gray-900')}
        >
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
    </header>
    <div className="px-5 py-5 sm:px-6">{children}</div>
  </section>
);

export default SettingsCard;
