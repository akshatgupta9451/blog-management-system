import { getMyBookmarks, removeBookmark } from '@/services/engagement.service';
import LibraryPage from '@/components/library/LibraryPage';
import { timeAgo } from '@/utils/format';

const Bookmarks = () => (
  <LibraryPage
    title="Bookmarks"
    description="Blogs you saved to read later."
    fetcher={getMyBookmarks}
    meta={(blog) => `Saved ${timeAgo(blog.bookmarkedAt)}`}
    removeLabel="Remove bookmark"
    onRemove={(blog) => removeBookmark(blog._id)}
    emptyTitle="No bookmarks yet"
    emptyMessage="Tap Save on any blog to keep it here."
  />
);

export default Bookmarks;
