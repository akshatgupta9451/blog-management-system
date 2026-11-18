import { Blog } from '../models/blog.model.js';
import { BlogLike } from '../models/blogLike.model.js';
import { BlogView } from '../models/blogView.model.js';
import { User } from '../models/user.model.js';
import { BLOG_STATUS, ENGAGEMENT } from '../constants/index.js';

const CARD_PROJECTION = { content: 0, __v: 0 };

// Trending is the same for every visitor, so it's computed at most once per cache window
// per limit instead of on every page load
const trendingCache = new Map();

/**
 * Most engaging published posts of the last TRENDING_WINDOW_DAYS:
 *   score = views + TRENDING_LIKE_WEIGHT × likes   (both counted inside the window)
 * One aggregation: recent view events grouped by blog, unioned with recent likes grouped by
 * blog, summed, ranked, then joined to published blogs and their authors.
 */
export const getTrendingBlogs = async (limit) => {
  const cached = trendingCache.get(limit);
  if (cached && cached.expiresAt > Date.now()) return cached.blogs;

  const since = new Date(Date.now() - ENGAGEMENT.TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const blogs = await BlogView.aggregate([
    // Range scan on the {createdAt: 1} index
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$blog', views: { $sum: 1 }, likes: { $sum: 0 } } },
    {
      $unionWith: {
        coll: BlogLike.collection.name,
        pipeline: [
          // Range scan on the {createdAt: -1} index
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: '$blog', views: { $sum: 0 }, likes: { $sum: 1 } } },
        ],
      },
    },
    { $group: { _id: '$_id', views: { $sum: '$views' }, likes: { $sum: '$likes' } } },
    {
      $addFields: {
        score: { $add: ['$views', { $multiply: ['$likes', ENGAGEMENT.TRENDING_LIKE_WEIGHT] }] },
      },
    },
    { $sort: { score: -1, _id: -1 } },
    // Over-fetch a little: some candidates may have been unpublished since
    { $limit: limit * 2 },
    {
      $lookup: {
        from: Blog.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'blog',
        pipeline: [{ $match: { status: BLOG_STATUS.PUBLISHED } }, { $project: CARD_PROJECTION }],
      },
    },
    { $unwind: '$blog' },
    { $limit: limit },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'blog.author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1 } }],
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          '$blog',
          { author: { $first: '$author' } },
          { trending: { score: '$score', views: '$views', likes: '$likes' } },
        ],
      },
    },
  ]);

  trendingCache.set(limit, { blogs, expiresAt: Date.now() + ENGAGEMENT.TRENDING_CACHE_MS });
  return blogs;
};

// All-time most liked (views break ties). Served entirely by the
// {status: 1, likesCount: -1, views: -1} index: no in-memory sort, reads only `limit` docs.
export const getPopularBlogs = (limit) =>
  Blog.find({ status: BLOG_STATUS.PUBLISHED }, CARD_PROJECTION)
    .sort({ likesCount: -1, views: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .lean();
