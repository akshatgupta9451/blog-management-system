import mongoose from 'mongoose';

// One document per (user, blog) like. A separate collection rather than an array on the blog,
// so a popular post doesn't grow without bound and likes carry a timestamp for trending.
const blogLikeSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Enforces one like per user per blog (concurrent double-clicks hit a duplicate key error),
// and answers "has this user liked this blog?" from the index alone
blogLikeSchema.index({ blog: 1, user: 1 }, { unique: true });
// "Blogs I liked", newest first
blogLikeSchema.index({ user: 1, createdAt: -1 });
// Trending: likes within the recent window
blogLikeSchema.index({ createdAt: -1 });

export const BlogLike = mongoose.model('BlogLike', blogLikeSchema);
