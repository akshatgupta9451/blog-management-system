export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';

export const getErrorStatus = (error) => error?.response?.status;

/**
 * Maps the API's 422 `errors: [{ field, message }]` onto react-hook-form fields.
 * Returns true if at least one field error was applied.
 */
export const applyServerErrors = (error, setError, fields) => {
  const errors = error?.response?.data?.errors ?? [];
  let applied = false;

  errors.forEach(({ field, message }) => {
    if (fields.includes(field)) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  });
  return applied;
};
