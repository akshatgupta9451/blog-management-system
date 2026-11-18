import { cn } from '@/utils/format';

const ELLIPSIS = '…';

// 1 … 4 5 [6] 7 8 … 20
const getPageItems = (current, total, siblings = 1) => {
  const first = Math.max(2, current - siblings);
  const last = Math.min(total - 1, current + siblings);
  const items = [1];

  if (first > 2) items.push(ELLIPSIS);
  for (let page = first; page <= last; page += 1) items.push(page);
  if (last < total - 1) items.push(ELLIPSIS);
  if (total > 1) items.push(total);

  return items;
};

const baseButton =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

/** Takes the `pagination` object returned by the API list endpoints. */
const Pagination = ({ pagination, onPageChange, className }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasPrevPage, hasNextPage, totalDocs, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalDocs);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-col items-center justify-between gap-4 sm:flex-row', className)}
    >
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}</span>–
        <span className="font-medium text-gray-700">{to}</span> of{' '}
        <span className="font-medium text-gray-700">{totalDocs}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={cn(baseButton, 'text-gray-600 hover:bg-gray-100')}
        >
          Prev
        </button>

        {getPageItems(page, totalPages).map((item, index) =>
          item === ELLIPSIS ? (
            <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
              {ELLIPSIS}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                baseButton,
                item === page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={cn(baseButton, 'text-gray-600 hover:bg-gray-100')}
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
