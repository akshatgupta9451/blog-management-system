import mongoose from 'mongoose';
import { ENGAGEMENT } from '../constants/index.js';

// Raw view events: de-duplication for the view counter and the input to trending
const blogViewSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    // "u:<userId>" for logged-in readers, "a:<hmac of ip + user agent>" for anonymous ones
    viewer: { type: String, required: true },
    // UTC date, e.g. "2026-11-18"
    day: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

// The view counter's guard: a second view by the same viewer on the same day fails to insert,
// so the counter is only incremented for genuinely new views, even under concurrent requests
blogViewSchema.index({ blog: 1, viewer: 1, day: 1 }, { unique: true });
// Serves trending's time-window match and expires old events (also a TTL index)
blogViewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ENGAGEMENT.VIEW_RETENTION_DAYS * 24 * 60 * 60 }
);

export const BlogView = mongoose.model('BlogView', blogViewSchema);
