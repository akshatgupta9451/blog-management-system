import { useEffect, useEffectEvent, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/format';

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Accessible dialog rendered into document.body.
 * Closes on Escape and backdrop click (unless `dismissible` is false, e.g. while saving),
 * locks page scroll, moves focus into the dialog and restores it on close.
 */
const Modal = ({ open, onClose, title, size = 'md', dismissible = true, footer, children }) => {
  const titleId = useId();
  const panelRef = useRef(null);

  // Reads the latest props without re-running the effect, so an inline onClose from the
  // parent doesn't steal focus back to the panel on every render
  const handleKeyDown = useEffectEvent((event) => {
    if (event.key === 'Escape' && dismissible) onClose();
  });

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-xl bg-white shadow-xl focus:outline-none',
          SIZES[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          {title && (
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mt-1 -mr-2 ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>
        <div className="px-6 py-4 text-sm text-gray-600">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 rounded-b-xl bg-gray-50 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
