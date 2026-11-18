import { useSearchParams } from 'react-router';

/**
 * Reads `keys` from the URL as strings ('' when absent) and returns an updater that sets one
 * key (empty clears it) and resets `page` unless `page` itself is being changed.
 */
export const useQueryParams = (keys) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? '']));

  const update = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  return [params, update, searchParams.toString()];
};
