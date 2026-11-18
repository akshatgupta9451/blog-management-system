import SearchBar from '@/components/common/SearchBar';
import { controlClasses } from '@/components/ui/formStyles';
import { cn } from '@/utils/format';

/** Search box plus any number of select filters, in one row above an admin table. */
export const AdminToolbar = ({ search, onSearch, placeholder, filters = [] }) => (
  <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center">
    <SearchBar value={search} onSearch={onSearch} placeholder={placeholder} className="md:flex-1" />
    <div className="flex shrink-0 gap-3">
      {filters.map((filter) => (
        <select
          key={filter.label}
          aria-label={filter.label}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
          className={cn(controlClasses(false), 'h-10 flex-1 md:w-44 md:flex-none')}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  </div>
);

export const Th = ({ children, className }) => (
  <th
    scope="col"
    className={cn(
      'px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase',
      className
    )}
  >
    {children}
  </th>
);

export const Td = ({ children, className }) => (
  <td className={cn('px-4 py-3 text-sm text-gray-700', className)}>{children}</td>
);
