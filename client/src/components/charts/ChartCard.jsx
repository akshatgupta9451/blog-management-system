import { useId, useState } from 'react';
import { cn } from '@/utils/format';

/**
 * Frame for a chart: title, optional note, and a "View as table" toggle so every value is
 * reachable without hovering and without relying on color. `table` = { columns, rows }.
 */
const ChartCard = ({ title, description, note, table, className, children }) => {
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

  return (
    <section
      className={cn('viz-root rounded-xl border border-gray-200 bg-white p-5 shadow-xs', className)}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            aria-expanded={showTable}
            aria-controls={tableId}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            {showTable ? 'View as chart' : 'View as table'}
          </button>
        )}
      </header>

      {showTable && table ? (
        <div id={tableId} className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-gray-500">
              <tr>
                {table.columns.map((column, i) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn('py-2 font-medium', i > 0 && 'text-right')}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        'py-1.5',
                        i > 0 ? 'text-right text-gray-900 tabular-nums' : 'text-gray-600'
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}

      {note && <p className="mt-3 text-xs text-gray-500">{note}</p>}
    </section>
  );
};

export default ChartCard;
