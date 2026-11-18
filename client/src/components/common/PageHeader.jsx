/** Title row for dashboard pages, with optional description and action buttons. */
const PageHeader = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
