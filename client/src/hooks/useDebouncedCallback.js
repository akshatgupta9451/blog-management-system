import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns [debounced, flush, cancel] for `callback`. `debounced(...args)` runs it after `delay`
 * ms of quiet; `flush(...args)` runs it now and drops any pending call. Pending calls are
 * cancelled on unmount.
 */
export const useDebouncedCallback = (callback, delay) => {
  const timer = useRef(null);
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  const debounced = useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay]
  );

  const flush = useCallback((...args) => {
    clearTimeout(timer.current);
    latest.current(...args);
  }, []);

  return [debounced, flush, cancel];
};
