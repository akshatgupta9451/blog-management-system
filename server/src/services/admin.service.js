import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Blog } from '../models/blog.model.js';
import { Comment } from '../models/comment.model.js';
import { BlogLike } from '../models/blogLike.model.js';
import { BlogView } from '../models/blogView.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { escapeRegex, prefixRange, tokenizeName } from '../utils/search.js';
import { resolveAuthors } from './search.service.js';
import { assertNotLastAdmin, purgeUser } from './user.service.js';
import { deleteBlog, updateBlog } from './blog.service.js';
import { deleteCommentThread } from './commentModeration.service.js';
import { BLOG_STATUS, ENGAGEMENT, USER_ROLES } from '../constants/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

// ---------------------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------------------

/**
 * Headline numbers. Each count is its own indexed query (COUNT_SCAN on {role, createdAt},
 * {status, …}, {createdAt}) rather than one big $group that would read every document.
 */
export const getOverview = async () => {
  const now = Date.now();
  const last30 = new Date(now - 30 * DAY_MS);
  const prev30 = new Date(now - 60 * DAY_MS);

  const [
    roles,
    usersLast30,
    usersPrev30,
    statuses,
    blogsLast30,
    blogsPrev30,
    [engagement = {}],
    comments,
    bookmarks,
    recentUsers,
    recentBlogs,
  ] = await Promise.all([
    Promise.all(Object.values(USER_ROLES).map((role) => User.countDocuments({ role }))),
    User.countDocuments({ createdAt: { $gte: last30 } }),
    User.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
    Promise.all(Object.values(BLOG_STATUS).map((status) => Blog.countDocuments({ status }))),
    Blog.countDocuments({ createdAt: { $gte: last30 } }),
    Blog.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
    // Views and likes only accrue on published posts. Matching on status lets MongoDB answer
    // this from the {status, likesCount, views, _id} index alone (a covered query).
    Blog.aggregate([
      { $match: { status: BLOG_STATUS.PUBLISHED } },
      { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likesCount' } } },
    ]),
    Comment.countDocuments({ deletedAt: null }),
    Bookmark.estimatedDocumentCount(),
    User.find({}, { name: 1, email: 1, role: 1, avatar: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Blog.find({}, { title: 1, slug: 1, status: 1, author: 1, createdAt: 1, views: 1 })
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .populate('author', 'name avatar')
      .lean(),
  ]);

  const byRole = Object.fromEntries(Object.values(USER_ROLES).map((role, i) => [role, roles[i]]));
  const byStatus = Object.fromEntries(
    Object.values(BLOG_STATUS).map((status, i) => [status, statuses[i]])
  );
  const sum = (values) => values.reduce((total, value) => total + value, 0);

  return {
    users: { total: sum(roles), byRole, last30: usersLast30, prev30: usersPrev30 },
    blogs: { total: sum(statuses), byStatus, last30: blogsLast30, prev30: blogsPrev30 },
    engagement: {
      views: engagement.views ?? 0,
      likes: engagement.likes ?? 0,
      comments,
      bookmarks,
    },
    recentUsers,
    recentBlogs,
  };
};

// ---------------------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------------------

export const ANALYTICS_RANGES = Object.freeze({
  '7d': { count: 7, unit: 'day' },
  '30d': { count: 30, unit: 'day' },
  '90d': { count: 13, unit: 'week' },
  '12m': { count: 12, unit: 'month' },
});

// Start of the UTC bucket containing `date`, matching $dateTrunc (weeks start on Monday)
const truncate = (date, unit) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (unit === 'week') d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  if (unit === 'month') d.setUTCDate(1);
  return d;
};

const step = (date, unit, by) => {
  const d = new Date(date);
  if (unit === 'day') d.setUTCDate(d.getUTCDate() + by);
  if (unit === 'week') d.setUTCDate(d.getUTCDate() + 7 * by);
  if (unit === 'month') d.setUTCMonth(d.getUTCMonth() + by);
  return d;
};

/**
 * Counts per time bucket. $match on createdAt first, so the range is read from a
 * {createdAt} index; the $group needs only createdAt, so the query can stay covered.
 */
const countByBucket = (Model, since, unit, match = {}) =>
  Model.aggregate([
    { $match: { ...match, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$createdAt', unit, timezone: 'UTC', startOfWeek: 'monday' } },
        count: { $sum: 1 },
      },
    },
  ]);

export const getAnalytics = async (range = '30d') => {
  const { count, unit } = ANALYTICS_RANGES[range];
  const since = step(truncate(new Date(), unit), unit, -(count - 1));
  const viewsSince = new Date(
    Math.max(since.getTime(), Date.now() - ENGAGEMENT.VIEW_RETENTION_DAYS * DAY_MS)
  );

  const [users, blogs, comments, likes, views, topBlogs, topAuthors, topCategories] =
    await Promise.all([
      countByBucket(User, since, unit),
      countByBucket(Blog, since, unit),
      countByBucket(Comment, since, unit),
      countByBucket(BlogLike, since, unit),
      countByBucket(BlogView, viewsSince, unit),

      // Most viewed posts in the window, from raw view events (range scan on {createdAt})
      BlogView.aggregate([
        { $match: { createdAt: { $gte: viewsSince } } },
        { $group: { _id: '$blog', views: { $sum: 1 } } },
        { $sort: { views: -1, _id: 1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: Blog.collection.name,
            localField: '_id',
            foreignField: '_id',
            as: 'blog',
            pipeline: [{ $project: { title: 1, slug: 1, status: 1 } }],
          },
        },
        { $unwind: '$blog' },
        { $project: { _id: '$blog._id', title: '$blog.title', slug: '$blog.slug', views: 1 } },
      ]),

      // All-time: authors ranked by the views their published posts have earned
      Blog.aggregate([
        { $match: { status: BLOG_STATUS.PUBLISHED } },
        {
          $group: {
            _id: '$author',
            posts: { $sum: 1 },
            views: { $sum: '$views' },
            likes: { $sum: '$likesCount' },
          },
        },
        { $sort: { views: -1, likes: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: User.collection.name,
            localField: '_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [{ $project: { name: 1, avatar: 1 } }],
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            name: '$user.name',
            avatar: '$user.avatar',
            posts: 1,
            views: 1,
            likes: 1,
          },
        },
      ]),

      Blog.aggregate([
        { $match: { status: BLOG_STATUS.PUBLISHED } },
        { $group: { _id: '$category', posts: { $sum: 1 }, views: { $sum: '$views' } } },
        { $sort: { posts: -1, views: -1, _id: 1 } },
        { $limit: 8 },
        { $project: { _id: 0, name: '$_id', posts: 1, views: 1 } },
      ]),
    ]);

  // Every bucket in the range, zeros included, so charts never skip a day
  const index = (rows) => new Map(rows.map((row) => [row._id.getTime(), row.count]));
  const series = {
    users: index(users),
    blogs: index(blogs),
    comments: index(comments),
    likes: index(likes),
    views: index(views),
  };
  const buckets = Array.from({ length: count }, (_, i) => {
    const date = step(since, unit, i);
    const key = date.getTime();
    return {
      date,
      users: series.users.get(key) ?? 0,
      blogs: series.blogs.get(key) ?? 0,
      comments: series.comments.get(key) ?? 0,
      likes: series.likes.get(key) ?? 0,
      // null when the bucket starts before the view-event retention window: unknown (or only
      // partly known), not zero, so a chart doesn't show a misleading dip
      views: date < viewsSince ? null : (series.views.get(key) ?? 0),
    };
  });

  const total = (field) => buckets.reduce((sum, bucket) => sum + (bucket[field] ?? 0), 0);

  return {
    range,
    unit,
    from: since,
    viewRetentionDays: ENGAGEMENT.VIEW_RETENTION_DAYS,
    totals: {
      users: total('users'),
      blogs: total('blogs'),
      comments: total('comments'),
      likes: total('likes'),
      views: total('views'),
    },
    buckets,
    topBlogs,
    topAuthors,
    topCategories,
  };
};

// ---------------------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------------------

const USER_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name: { name: 1, _id: 1 },
};

/**
 * Search by email prefix (when the term contains "@") or by word prefix of the name
 * ({nameTokens} index, same as public author search). Per-user blog stats are joined only
 * for the page being returned.
 */
export const listUsers = async (query) => {
  const { search, role, sort = 'newest' } = query;
  const { page, limit, skip } = getPagination(query);

  const match = {};
  if (role) match.role = role;
  if (search) {
    if (search.includes('@')) {
      // Emails are stored lowercased; an anchored, case-sensitive regex can use the email index
      match.email = { $regex: `^${escapeRegex(search.toLowerCase())}` };
    } else {
      const terms = tokenizeName(search);
      // A search with no letters or digits (e.g. ".*") matches nobody, rather than everybody
      match.$and = terms.length
        ? terms.map((term) => ({ nameTokens: { $elemMatch: prefixRange(term) } }))
        : [{ _id: null }];
    }
  }

  const [users, total] = await Promise.all([
    User.aggregate([
      { $match: match },
      { $sort: USER_SORTS[sort] },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: Blog.collection.name,
          localField: '_id',
          foreignField: 'author',
          as: 'blogStats',
          pipeline: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: [{ $eq: ['$status', BLOG_STATUS.PUBLISHED] }, 1, 0] } },
                views: { $sum: '$views' },
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          avatar: 1,
          createdAt: 1,
          stats: {
            $ifNull: [{ $first: '$blogStats' }, { total: 0, published: 0, views: 0 }],
          },
        },
      },
    ]),
    User.countDocuments(match),
  ]);

  return { users, pagination: buildPaginationMeta({ page, limit, totalDocs: total }) };
};

export const updateUserRole = async (id, role, admin) => {
  if (String(id) === String(admin._id)) throw new ApiError(400, 'You cannot change your own role');

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: 'after', runValidators: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const deleteUser = async (id, admin) => {
  if (String(id) === String(admin._id)) {
    throw new ApiError(400, 'Use account settings to delete your own account');
  }
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  await assertNotLastAdmin(user, 'This is the only admin account and cannot be deleted');
  return purgeUser(user);
};

// ---------------------------------------------------------------------------------------
// Blogs (every status, not just published)
// ---------------------------------------------------------------------------------------

const BLOG_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  updated: { updatedAt: -1, _id: -1 },
  views: { views: -1, _id: -1 },
  likes: { likesCount: -1, _id: -1 },
  title: { title: 1, _id: 1 },
};

export const listBlogs = async (query) => {
  const { search, status, category, author, sort = 'newest' } = query;
  const { page, limit, skip } = getPagination(query);
  const authors = await resolveAuthors(author);

  // Admins search titles, so a contains-match (escaped) reads better than stemmed full-text
  const match = {
    ...(status && { status }),
    ...(category && { category }),
    ...(authors && { author: { $in: authors.ids } }),
    ...(search && { title: { $regex: escapeRegex(search), $options: 'i' } }),
  };

  const [blogs, total] = await Promise.all([
    Blog.aggregate([
      { $match: match },
      { $sort: BLOG_SORTS[sort] },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
        },
      },
      { $set: { author: { $first: '$author' } } },
      { $project: { content: 0, __v: 0 } },
    ]),
    Blog.countDocuments(match),
  ]);

  return {
    blogs,
    pagination: buildPaginationMeta({ page, limit, totalDocs: total }),
    applied: { ...(authors && { author: authors.label }) },
  };
};

// Moderation: unpublish/archive/restore via the normal update path (keeps activity + slugs)
export const setBlogStatus = (id, status, admin) => updateBlog(id, { status }, null, admin);

export const removeBlog = (id, admin) => deleteBlog(id, admin);

// ---------------------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------------------

export const listComments = async (query) => {
  const { search, blog } = query;
  const { page, limit, skip } = getPagination(query);

  const match = {
    deletedAt: null,
    ...(blog && { blog: toObjectId(blog) }),
    ...(search && { content: { $regex: escapeRegex(search), $options: 'i' } }),
  };

  const [comments, total] = await Promise.all([
    Comment.aggregate([
      { $match: match },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
        },
      },
      {
        $lookup: {
          from: Blog.collection.name,
          localField: 'blog',
          foreignField: '_id',
          as: 'blog',
          pipeline: [{ $project: { title: 1, slug: 1 } }],
        },
      },
      { $set: { author: { $first: '$author' }, blog: { $first: '$blog' } } },
      { $project: { likedBy: 0, __v: 0 } },
    ]),
    Comment.countDocuments(match),
  ]);

  return { comments, pagination: buildPaginationMeta({ page, limit, totalDocs: total }) };
};

export const removeComment = (id) => deleteCommentThread(id);
