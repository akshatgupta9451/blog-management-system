import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { bookmarkBlog, likeBlog, removeBookmark, unlikeBlog } from '@/services/engagement.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Icon from '@/components/ui/Icon';
import { cn, formatCount } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const buttonClass = (active, activeClasses) =>
  cn(
    'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition-colors ring-inset',
    active ? activeClasses : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
  );

/**
 * Like + bookmark buttons for a blog. Both update instantly (optimistic) and roll back if
 * the request fails; the server's response then sets the authoritative like count.
 */
const BlogEngagement = ({ blog }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [like, setLike] = useState({ liked: blog.isLiked, count: blog.likesCount ?? 0 });
  const [bookmarked, setBookmarked] = useState(blog.isBookmarked);
  // Ignore clicks while a request is in flight so the UI can't drift from the server
  const pending = useRef({ like: false, bookmark: false });

  const requireLogin = () => {
    toast.info('Log in to like and save blogs');
    navigate(ROUTES.LOGIN, { state: { from: location } });
  };

  const toggleLike = async () => {
    if (!user) return requireLogin();
    if (pending.current.like) return;
    pending.current.like = true;

    const previous = like;
    const next = !like.liked;
    setLike({ liked: next, count: Math.max(0, like.count + (next ? 1 : -1)) });
    try {
      const result = next ? await likeBlog(blog._id) : await unlikeBlog(blog._id);
      setLike({ liked: result.liked, count: result.likesCount });
    } catch (error) {
      setLike(previous);
      toast.error(getErrorMessage(error));
    } finally {
      pending.current.like = false;
    }
  };

  const toggleBookmark = async () => {
    if (!user) return requireLogin();
    if (pending.current.bookmark) return;
    pending.current.bookmark = true;

    const next = !bookmarked;
    setBookmarked(next);
    try {
      await (next ? bookmarkBlog(blog._id) : removeBookmark(blog._id));
      toast.success(next ? 'Saved to bookmarks' : 'Removed from bookmarks', { autoClose: 1500 });
    } catch (error) {
      setBookmarked(!next);
      toast.error(getErrorMessage(error));
    } finally {
      pending.current.bookmark = false;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={like.liked}
        aria-label={like.liked ? 'Unlike' : 'Like'}
        className={buttonClass(
          like.liked,
          'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100'
        )}
      >
        <Icon name="heart" filled={like.liked} className="size-5" />
        <span className="tabular-nums">{formatCount(like.count)}</span>
      </button>
      <button
        type="button"
        onClick={toggleBookmark}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        className={buttonClass(
          bookmarked,
          'bg-primary-50 text-primary-700 ring-primary-200 hover:bg-primary-100'
        )}
      >
        <Icon name="bookmark" filled={bookmarked} className="size-5" />
        {bookmarked ? 'Saved' : 'Save'}
      </button>
    </div>
  );
};

export default BlogEngagement;
