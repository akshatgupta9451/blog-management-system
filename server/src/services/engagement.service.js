import mongoose from 'mongoose';
import { Blog } from '../models/blog.model.js';
import { BlogLike } from '../models/blogLike.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ReadingHistory } from '../models/readingHistory.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { BLOG_STATUS } from '../constants/index.js';

const isDuplicateKey = (error) => error?.code === 11000;

const findPublishedBlogOrThrow = async (blogId) => {
  const blog = await Blog.findOne(
    { _id: blogId, status: BLOG_STATUS.PUBLISHED },
    { _id: 1 }
  ).lean();
  if (!blog) throw new ApiError(404, 'Blog not found');
  return blog;
};

const currentLikesCount = async (blogId) =>
  (await Blog.findById(blogId, { likesCount: 1 }).lean())?.likesCount ?? 0;

// Likes and bookmarks are idempotent: liking twice, or unliking something not liked,
// succeeds and returns the current state instead of erroring or double counting.

export const likeBlog = async (blogId, user) => {
  await findPublishedBlogOrThrow(blogId);
  try {
    await BlogLike.create({ blog: blogId, user: user._id });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    return { liked: true, likesCount: await currentLikesCount(blogId) };
  }

  const blog = await Blog.findByIdAndUpdate(
    blogId,
    { $inc: { likesCount: 1 } },
    { returnDocument: 'after', projection: { likesCount: 1 }, timestamps: false }
  ).lean();
  return { liked: true, likesCount: blog.likesCount };
};

export const unlikeBlog = async (blogId, user) => {
  const { deletedCount } = await BlogLike.deleteOne({ blog: blogId, user: user._id });
  if (!deletedCount) return { liked: false, likesCount: await currentLikesCount(blogId) };

  const blog = await Blog.findByIdAndUpdate(
    blogId,
    { $inc: { likesCount: -1 } },
    { returnDocument: 'after', projection: { likesCount: 1 }, timestamps: false }
  ).lean();
  return { liked: false, likesCount: blog?.likesCount ?? 0 };
};

export const bookmarkBlog = async (blogId, user) => {
  await findPublishedBlogOrThrow(blogId);
  try {
    await Bookmark.create({ user: user._id, blog: blogId });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
  return { bookmarked: true };
};

export const removeBookmark = async (blogId, user) => {
  await Bookmark.deleteOne({ user: user._id, blog: blogId });
  return { bookmarked: false };
};

// Two indexed point lookups, run in parallel
export const getViewerState = async (blogId, user) => {
  if (!user) return { isLiked: false, isBookmarked: false };
  const [liked, bookmarked] = await Promise.all([
    BlogLike.exists({ blog: blogId, user: user._id }),
    Bookmark.exists({ user: user._id, blog: blogId }),
  ]);
  return { isLiked: Boolean(liked), isBookmarked: Boolean(bookmarked) };
};

/**
 * Shared pipeline for "my likes / bookmarks / history". Walks the user's entries in index
 * order ({user, <sortField>: -1}), joins only published blogs (so posts that were since
 * unpublished or deleted drop out of both the page and the total), then pages with $facet.
 * Each item is the blog card fields plus `extraFields` from the entry (e.g. lastViewedAt).
 */
const listUserBlogs = async (Model, userId, sortField, extraFields, query) => {
  const { page, limit, skip } = getPagination(query);
  const extras = Object.fromEntries(extraFields.map(([as, field]) => [as, `$${field}`]));

  const [result] = await Model.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
    { $sort: { [sortField]: -1, _id: -1 } },
    {
      $lookup: {
        from: Blog.collection.name,
        localField: 'blog',
        foreignField: '_id',
        as: 'blogDoc',
        pipeline: [
          { $match: { status: BLOG_STATUS.PUBLISHED } },
          { $project: { content: 0, __v: 0 } },
        ],
      },
    },
    { $unwind: '$blogDoc' },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          // Authors are joined after paging, so only `limit` lookups run
          {
            $lookup: {
              from: User.collection.name,
              localField: 'blogDoc.author',
              foreignField: '_id',
              as: 'authorDoc',
              pipeline: [{ $project: { name: 1, avatar: 1 } }],
            },
          },
          {
            $replaceWith: {
              $mergeObjects: [
                '$blogDoc',
                { author: { $ifNull: [{ $first: '$authorDoc' }, null] } },
                extras,
              ],
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return {
    blogs: result.items,
    pagination: buildPaginationMeta({ page, limit, totalDocs: result.total[0]?.count ?? 0 }),
  };
};

export const listLikedBlogs = (userId, query) =>
  listUserBlogs(BlogLike, userId, 'createdAt', [['likedAt', 'createdAt']], query);

export const listBookmarks = (userId, query) =>
  listUserBlogs(Bookmark, userId, 'createdAt', [['bookmarkedAt', 'createdAt']], query);

export const listHistory = (userId, query) =>
  listUserBlogs(
    ReadingHistory,
    userId,
    'lastViewedAt',
    [
      ['lastViewedAt', 'lastViewedAt'],
      ['viewCount', 'viewCount'],
    ],
    query
  );

export const removeFromHistory = async (userId, blogId) => {
  await ReadingHistory.deleteOne({ user: userId, blog: blogId });
};

export const clearHistory = async (userId) => {
  const { deletedCount } = await ReadingHistory.deleteMany({ user: userId });
  return { removed: deletedCount };
};
