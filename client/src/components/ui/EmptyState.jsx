/** Placeholder for empty lists and error screens. `action` is any node, usually a Button. */
const EmptyState = ({ title, message, action, tone = 'neutral' }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
    <div
      className={
        tone === 'error'
          ? 'mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500'
          : 'bg-primary-50 text-primary-500 mx-auto flex size-12 items-center justify-center rounded-full'
      }
      aria-hidden="true"
    >
      {tone === 'error' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            d="M12 8v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.6a3.4 3.4 0 0 0-3.4-3.4h-1.5A1.1 1.1 0 0 1 13.5 7V5.6a3.4 3.4 0 0 0-3.4-3.4H8.3M10.5 2.3H5.6c-.6 0-1.1.5-1.1 1.1v17.3c0 .6.5 1.1 1.1 1.1h12.8c.6 0 1.1-.5 1.1-1.1V11.3a9 9 0 0 0-9-9Z"
          />
        </svg>
      )}
    </div>
    <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
    {message && <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{message}</p>}
    {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
  </div>
);

export default EmptyState;
