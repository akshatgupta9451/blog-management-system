import mongoose from 'mongoose';
import { BLOG_STATUS } from '../constants/index.js';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 300,
    },
    // Sanitized HTML from the rich-text editor
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.DRAFT,
    },
    // Counters are maintained by the server (view tracking, likes and comments modules),
    // never set directly from request bodies
    views: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Sort indexes end with _id because every sort uses _id as a tie-breaker (stable pages).
// Without it MongoDB can filter with the index but still has to sort in memory.
// Public listing and search: newest first (and oldest first, by scanning backwards)
blogSchema.index({ status: 1, createdAt: -1, _id: -1 });
// "My blogs" dashboard and author filter
blogSchema.index({ author: 1, status: 1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
// Admin: every status, newest first; also the "new blogs over time" analytics range
blogSchema.index({ createdAt: -1, _id: -1 });
// Popular blogs, and search sorted by most liked / most viewed / title
blogSchema.index({ status: 1, likesCount: -1, views: -1, _id: -1 });
blogSchema.index({ status: 1, views: -1, _id: -1 });
blogSchema.index({ status: 1, title: 1, _id: 1 });
blogSchema.index(
  { title: 'text', tags: 'text', description: 'text', content: 'text' },
  { name: 'blog_text_search', weights: { title: 10, tags: 5, description: 3, content: 1 } }
);

blogSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Blog = mongoose.model('Blog', blogSchema);
