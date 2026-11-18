import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import axios from 'axios';

/**
 * Runs `fetcher(signal)` whenever `deps` change and aborts the previous request.
 * Keeps the last data while a new request is loading, so lists don't flash empty.
 *
 *   const { data, loading, error, reload } = useFetch((signal) => getBlogs(params, { signal }), [params]);
 */
export const useFetch = (fetcher, deps) => {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ key: null, data: null, error: null });

  const requestKey = `${JSON.stringify(deps)}#${version}`;
  const run = useEffectEvent((signal) => fetcher(signal));

  useEffect(() => {
    const controller = new AbortController();

    run(controller.signal).then(
      (data) => setState({ key: requestKey, data, error: null }),
      (error) => {
        if (!axios.isCancel(error)) setState((prev) => ({ ...prev, key: requestKey, error }));
      }
    );

    return () => controller.abort();
  }, [requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // For optimistic local updates, e.g. removing a deleted item from a list
  const setData = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        data: typeof updater === 'function' ? updater(prev.data) : updater,
      })),
    []
  );

  const loading = state.key !== requestKey;

  return { data: state.data, error: loading ? null : state.error, loading, reload, setData };
};
