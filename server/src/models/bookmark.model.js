import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One bookmark per user per blog, and the "is it bookmarked?" lookup
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });
// The bookmarks page, newest first
bookmarkSchema.index({ user: 1, createdAt: -1 });
// Cascade delete when a blog is removed
bookmarkSchema.index({ blog: 1 });

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
