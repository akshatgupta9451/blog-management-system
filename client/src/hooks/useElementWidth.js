import { useCallback, useRef, useState } from 'react';

/** [ref, width] - the element's content width, kept up to date with a ResizeObserver. */
export const useElementWidth = () => {
  const [width, setWidth] = useState(0);
  const observer = useRef(null);

  // Callback ref: (re)attaches the observer whenever the element mounts or changes
  const ref = useCallback((node) => {
    observer.current?.disconnect();
    if (!node) return;
    observer.current = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width))
    );
    observer.current.observe(node);
  }, []);

  return [ref, width];
};
