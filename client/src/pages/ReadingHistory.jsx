import { useState } from 'react';
import { toast } from 'react-toastify';
import { clearHistory, getMyHistory, removeHistoryEntry } from '@/services/engagement.service';
import LibraryPage from '@/components/library/LibraryPage';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { timeAgo } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const ReadingHistory = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearHistory();
      toast.success('Reading history cleared');
      setConfirmOpen(false);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <LibraryPage
        title="Reading history"
        description="Blogs you've read, most recent first. Kept for a year."
        fetcher={getMyHistory}
        reloadKey={reloadKey}
        meta={(blog) =>
          `Read ${timeAgo(blog.lastViewedAt)}${blog.viewCount > 1 ? ` · ${blog.viewCount} times` : ''}`
        }
        removeLabel="Remove from history"
        onRemove={(blog) => removeHistoryEntry(blog._id)}
        emptyTitle="No reading history"
        emptyMessage="Blogs you open will appear here."
        headerActions={(hasItems) =>
          hasItems && (
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              Clear history
            </Button>
          )
        }
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClear}
        loading={clearing}
        title="Clear reading history?"
        message="This removes every blog from your history. Your likes and bookmarks are not affected."
        confirmLabel="Clear history"
      />
    </>
  );
};

export default ReadingHistory;
