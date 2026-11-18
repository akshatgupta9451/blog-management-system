import crypto from 'node:crypto';
import { Blog } from '../models/blog.model.js';
import { BlogView } from '../models/blogView.model.js';
import { ReadingHistory } from '../models/readingHistory.model.js';
import { env } from '../config/env.js';
import { ENGAGEMENT } from '../constants/index.js';

// Logged-in readers are identified by id. Anonymous readers by a keyed hash of IP + user
// agent, which is stable for de-duplication but can't be reversed into an IP address.
export const getViewerKey = (req) => {
  if (req.user) return `u:${req.user._id}`;
  const fingerprint = `${req.ip}|${req.get('user-agent') ?? ''}`;
  return `a:${crypto.createHmac('sha256', env.viewHashSecret).update(fingerprint).digest('hex')}`;
};

/**
 * Counts a view if this viewer hasn't viewed the blog yet today, and records it in the
 * user's reading history. Returns true when the view counter was incremented.
 */
export const recordView = async (blog, { viewerKey, user }) => {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  // Pipeline update: viewCount only goes up when the previous read is older than one
  // reading session, so refreshes and quick back-and-forth don't count as re-reads.
  // Every expression sees the document as it was before this update.
  const sessionStart = new Date(now.getTime() - ENGAGEMENT.READ_SESSION_MS);
  const history = user
    ? ReadingHistory.updateOne(
        { user: user._id, blog: blog._id },
        [
          {
            $set: {
              firstViewedAt: { $ifNull: ['$firstViewedAt', now] },
              viewCount: {
                $cond: [
                  { $gt: [{ $ifNull: ['$lastViewedAt', new Date(0)] }, sessionStart] },
                  '$viewCount',
                  { $add: [{ $ifNull: ['$viewCount', 0] }, 1] },
                ],
              },
              lastViewedAt: now,
            },
          },
        ],
        // Mongoose 9 requires opting in to pipeline-style updates
        { upsert: true, updatePipeline: true }
      )
    : null;

  let counted = true;
  try {
    // The unique {blog, viewer, day} index rejects repeat views atomically
    await BlogView.create({ blog: blog._id, viewer: viewerKey, day });
    // timestamps: false so a view doesn't make the post look "recently updated"
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }, { timestamps: false });
  } catch (error) {
    if (error.code !== 11000) throw error;
    counted = false;
  }

  await history;
  return counted;
};
