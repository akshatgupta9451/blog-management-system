/** Centered card used by the Login and Register pages. */
const AuthCard = ({ title, footer, children }) => (
  <div className="mx-auto max-w-md py-6 sm:py-12">
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
    <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
  </div>
);

export default AuthCard;
