import { Blog } from '../models/blog.model.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/ApiError.js';

const NO_TIMESTAMPS = { timestamps: false };

/**
 * Removes a comment together with every reply beneath it (moderation removes the whole
 * conversation it started). One $graphLookup walks the reply tree via the {parent: 1} index;
 * counters stay correct: the blog's commentsCount drops by the number of live comments removed
 * and the parent's replyCount by one.
 */
export const deleteCommentThread = async (commentId) => {
  const comment = await Comment.findById(commentId, { blog: 1, parent: 1, deletedAt: 1 }).lean();
  if (!comment) throw new ApiError(404, 'Comment not found');

  const [tree] = await Comment.aggregate([
    { $match: { _id: comment._id } },
    {
      $graphLookup: {
        from: Comment.collection.name,
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'replies',
        restrictSearchWithMatch: { blog: comment.blog },
      },
    },
    {
      $project: {
        ids: '$replies._id',
        live: { $size: { $filter: { input: '$replies', cond: { $not: ['$$this.deletedAt'] } } } },
      },
    },
  ]);

  const ids = [comment._id, ...tree.ids];
  const liveRemoved = tree.live + (comment.deletedAt ? 0 : 1);

  await Comment.deleteMany({ _id: { $in: ids } });
  await Promise.all([
    liveRemoved &&
      Blog.updateOne(
        { _id: comment.blog },
        { $inc: { commentsCount: -liveRemoved } },
        NO_TIMESTAMPS
      ),
    comment.parent &&
      Comment.updateOne({ _id: comment.parent }, { $inc: { replyCount: -1 } }, NO_TIMESTAMPS),
  ]);

  return { deleted: ids.length };
};

/**
 * Account deletion: the user's comments on other people's blogs. Comments with replies become
 * anonymous "[deleted]" placeholders so other people's answers stay in context; the rest are
 * removed. Their likes on comments are withdrawn too. Counters are adjusted in bulk.
 */
export const removeUserComments = async (userId) => {
  const comments = await Comment.find(
    { author: userId, deletedAt: null },
    { blog: 1, parent: 1, replyCount: 1 }
  ).lean();

  if (comments.length) {
    const withReplies = comments.filter((c) => c.replyCount > 0).map((c) => c._id);
    const leaves = comments.filter((c) => c.replyCount === 0);

    await Comment.updateMany(
      { _id: { $in: withReplies } },
      { $set: { deletedAt: new Date(), content: '', author: null, likedBy: [], likesCount: 0 } },
      NO_TIMESTAMPS
    );
    await Comment.deleteMany({ _id: { $in: leaves.map((c) => c._id) } });

    const tally = (items, key) =>
      items.reduce((counts, item) => {
        if (item[key]) counts.set(String(item[key]), (counts.get(String(item[key])) ?? 0) + 1);
        return counts;
      }, new Map());
    const decrement = (counts, field) =>
      [...counts].map(([id, count]) => ({
        updateOne: {
          filter: { _id: id },
          update: { $inc: { [field]: -count } },
          timestamps: false,
        },
      }));

    await Promise.all([
      Blog.bulkWrite(decrement(tally(comments, 'blog'), 'commentsCount')),
      leaves.some((c) => c.parent) &&
        Comment.bulkWrite(decrement(tally(leaves, 'parent'), 'replyCount')),
    ]);
  }

  await Comment.updateMany(
    { likedBy: userId },
    { $pull: { likedBy: userId }, $inc: { likesCount: -1 } },
    NO_TIMESTAMPS
  );
};
