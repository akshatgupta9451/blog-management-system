import mongoose from 'mongoose';
import { ENGAGEMENT } from '../constants/index.js';

// One document per (user, blog), upserted on every read, so history never holds duplicates
const readingHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    firstViewedAt: { type: Date, required: true },
    lastViewedAt: { type: Date, required: true },
    viewCount: { type: Number, default: 1, min: 1 },
  },
  { versionKey: false }
);

readingHistorySchema.index({ user: 1, blog: 1 }, { unique: true });
// History page and "Recently viewed", most recent first
readingHistorySchema.index({ user: 1, lastViewedAt: -1 });
readingHistorySchema.index({ blog: 1 });
// Entries untouched for a year expire; re-reading a post pushes lastViewedAt forward
readingHistorySchema.index(
  { lastViewedAt: 1 },
  { expireAfterSeconds: ENGAGEMENT.HISTORY_RETENTION_DAYS * 24 * 60 * 60 }
);

export const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);
