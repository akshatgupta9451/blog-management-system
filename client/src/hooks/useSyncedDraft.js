import { useState } from 'react';

/**
 * Local draft for a text input whose committed value lives elsewhere (e.g. the URL).
 * When `value` changes from outside (Clear all, back button), the draft follows it. When it
 * changes because the user's own debounced input was committed, the draft is left alone, so
 * the input never resets or loses the caret mid-typing.
 */
export const useSyncedDraft = (value) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  // Adjusting state during render (React's recommended alternative to a syncing effect)
  if (value !== synced) {
    setSynced(value);
    if (value !== draft.trim()) setDraft(value);
  }

  return [draft, setDraft];
};
