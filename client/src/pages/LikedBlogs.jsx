import { getMyLikes, unlikeBlog } from '@/services/engagement.service';
import LibraryPage from '@/components/library/LibraryPage';
import { timeAgo } from '@/utils/format';

const LikedBlogs = () => (
  <LibraryPage
    title="Liked blogs"
    description="Everything you've liked, most recent first."
    fetcher={getMyLikes}
    meta={(blog) => `Liked ${timeAgo(blog.likedAt)}`}
    removeLabel="Unlike"
    onRemove={(blog) => unlikeBlog(blog._id)}
    emptyTitle="No liked blogs yet"
    emptyMessage="Blogs you like will show up here."
  />
);

export default LikedBlogs;
