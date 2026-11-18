import mongoose from 'mongoose';
import { COMMENT_LIMITS } from '../constants/index.js';

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    // Null once the comment is deleted (the placeholder stays anonymous)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Null for top-level comments
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: COMMENT_LIMITS.MAX_DEPTH,
    },
    // Plain text. Rendered as text by the client, never as HTML.
    content: {
      type: String,
      trim: true,
      maxlength: COMMENT_LIMITS.MAX_LENGTH,
      default: '',
    },
    // Who liked it. Never sent to clients; they get likesCount and their own likedByMe.
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    likesCount: { type: Number, default: 0, min: 0 },
    // Direct replies only, including deleted placeholders that still have replies
    replyCount: { type: Number, default: 0, min: 0 },
    editedAt: { type: Date, default: null },
    // Set when a comment with replies is deleted: it becomes a "[deleted]" placeholder so
    // the conversation under it stays readable. Comments without replies are removed outright.
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Top-level list and reply list for a thread, in any sort order
commentSchema.index({ blog: 1, parent: 1, createdAt: -1 });
commentSchema.index({ blog: 1, parent: 1, likesCount: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ likedBy: 1 });
// Thread deletion walks replies by parent ($graphLookup); admin moderation lists newest first
commentSchema.index({ parent: 1 });
commentSchema.index({ createdAt: -1 });

export const Comment = mongoose.model('Comment', commentSchema);
