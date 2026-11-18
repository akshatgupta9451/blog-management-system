import mongoose from 'mongoose';
import { ACTIVITY_RETENTION_DAYS, ACTIVITY_TYPES } from '../constants/index.js';

// One row per notable thing a user did, shown as "Recent activity" on their dashboard
const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    // Blog events keep a snapshot of the title/slug, so the entry still reads well after
    // the blog is renamed or deleted
    blog: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      title: String,
      slug: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 }
);

activitySchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Activity = mongoose.model('Activity', activitySchema);
