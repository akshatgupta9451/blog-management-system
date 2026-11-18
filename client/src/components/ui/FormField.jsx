import { controlClasses } from './formStyles';

/** Label + control + hint/error. Pass the control as children, or use Input / Textarea / Select. */
export const FormField = ({ id, label, error, hint, required, className, children }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
    )}
  </div>
);

const fieldProps = (id, error) => ({
  id,
  'aria-invalid': Boolean(error),
  'aria-describedby': error ? `${id}-error` : undefined,
  className: controlClasses(Boolean(error)),
});

// react-hook-form's register() returns a ref, which React 19 passes through as a normal prop
export const Input = ({ id, label, error, hint, required, className, ...props }) => (
  <FormField {...{ id, label, error, hint, required, className }}>
    <input {...fieldProps(id, error)} {...props} />
  </FormField>
);

export const Textarea = ({ id, label, error, hint, required, className, ...props }) => (
  <FormField {...{ id, label, error, hint, required, className }}>
    <textarea {...fieldProps(id, error)} {...props} />
  </FormField>
);

export const Select = ({ id, label, error, hint, required, className, options, ...props }) => (
  <FormField {...{ id, label, error, hint, required, className }}>
    <select {...fieldProps(id, error)} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
);
