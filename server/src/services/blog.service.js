import crypto from 'node:crypto';
import { Blog } from '../models/blog.model.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { deleteImage, uploadImage } from './cloudinary.service.js';
import { logActivity } from './activity.service.js';
import { recordView } from './view.service.js';
import { getViewerState } from './engagement.service.js';
import { BlogLike } from '../models/blogLike.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { BlogView } from '../models/blogView.model.js';
import { ReadingHistory } from '../models/readingHistory.model.js';
import { Comment } from '../models/comment.model.js';
import { ACTIVITY_TYPES, BLOG_STATUS, USER_ROLES } from '../constants/index.js';
import { IMAGE_PRESETS } from '../config/cloudinary.js';

const AUTHOR_FIELDS = 'name avatar bio';
const TAXONOMY_LIMIT = 20;

const isAdmin = (user) => user?.role === USER_ROLES.ADMIN;

const isOwner = (blog, user) => {
  const authorId = blog.author?._id ?? blog.author;
  return Boolean(user && authorId?.equals(user._id));
};

const assertCanModify = (blog, user) => {
  if (!isOwner(blog, user) && !isAdmin(user)) {
    throw new ApiError(403, 'You can only modify your own blogs');
  }
};

const findBlogOrThrow = async (id) => {
  const blog = await Blog.findById(id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  return blog;
};

// Appends a short random suffix only when the plain slug is already taken
const generateUniqueSlug = async (title, excludeId) => {
  const base = slugify(title) || 'post';
  const filter = excludeId ? { _id: { $ne: excludeId } } : {};

  let slug = base;
  while (await Blog.exists({ ...filter, slug })) {
    slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return slug;
};

// "-views,createdAt" -> { views: -1, createdAt: 1, _id: -1 }
// _id is always appended as a tie-breaker so pages never overlap or skip documents. It runs in
// the same direction as the first sort field so the compound sort indexes can serve it.
const buildSort = (sort, hasSearch) => {
  if (!sort) {
    return hasSearch
      ? { score: { $meta: 'textScore' }, createdAt: -1, _id: -1 }
      : { createdAt: -1, _id: -1 };
  }

  const order = {};
  for (const field of sort.split(',')) {
    const key = field.trim();
    if (key.startsWith('-')) order[key.slice(1)] = -1;
    else order[key] = 1;
  }
  return { ...order, _id: Object.values(order)[0] };
};

const buildFilter = (query) => {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.tags?.length) filter.tags = { $all: query.tags };
  if (query.author) filter.author = query.author;
  if (query.search) filter.$text = { $search: query.search };

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = query.from;
    if (query.to) filter.createdAt.$lte = query.to;
  }

  return filter;
};

const paginate = async (filter, query) => {
  const { page, limit, skip } = getPagination(query);
  const projection = query.search ? { content: 0, score: { $meta: 'textScore' } } : { content: 0 };

  const [blogs, totalDocs] = await Promise.all([
    Blog.find(filter, projection)
      .sort(buildSort(query.sort, Boolean(query.search)))
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return { blogs, pagination: buildPaginationMeta({ page, limit, totalDocs }) };
};

// Public feed. Only published posts, except admins may ask for a specific status.
export const listBlogs = (query, viewer) => {
  const filter = buildFilter(query);
  filter.status = isAdmin(viewer) && query.status ? query.status : BLOG_STATUS.PUBLISHED;
  return paginate(filter, query);
};

// The current user's own posts in every status (their dashboard)
export const listMyBlogs = (query, user) => {
  const filter = buildFilter(query);
  filter.author = user._id;
  if (query.status) filter.status = query.status;
  return paginate(filter, query);
};

// Totals for the author's dashboard, across all of their posts (not just one page)
export const getMyBlogStats = async (user) => {
  const [totals = {}] = await Blog.aggregate([
    { $match: { author: user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$status', BLOG_STATUS.PUBLISHED] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', BLOG_STATUS.DRAFT] }, 1, 0] } },
        archived: { $sum: { $cond: [{ $eq: ['$status', BLOG_STATUS.ARCHIVED] }, 1, 0] } },
        views: { $sum: '$views' },
        likes: { $sum: '$likesCount' },
        comments: { $sum: '$commentsCount' },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    views: 0,
    likes: 0,
    comments: 0,
    ...totals,
  };
};

// Categories and most-used tags across published posts, for browse filters
export const getTaxonomy = async () => {
  const published = { $match: { status: BLOG_STATUS.PUBLISHED } };
  const countBy = (field) => [
    { $group: { _id: field, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: TAXONOMY_LIMIT },
    { $project: { _id: 0, name: '$_id', count: 1 } },
  ];

  const [result] = await Blog.aggregate([
    published,
    {
      $facet: {
        categories: countBy('$category'),
        tags: [{ $unwind: '$tags' }, ...countBy('$tags')],
      },
    },
  ]);
  return result;
};

export const getBlogBySlug = async (slug, viewer, viewerKey) => {
  const blog = await Blog.findOne({ slug }).populate('author', AUTHOR_FIELDS);

  // Unpublished posts look like they don't exist to anyone but their author or an admin
  const canSee =
    blog && (blog.status === BLOG_STATUS.PUBLISHED || isOwner(blog, viewer) || isAdmin(viewer));
  if (!canSee) throw new ApiError(404, 'Blog not found');

  // Authors reading their own post don't count as views or go into their history
  const countView = blog.status === BLOG_STATUS.PUBLISHED && !isOwner(blog, viewer);

  const [counted, viewerState] = await Promise.all([
    countView ? recordView(blog, { viewerKey, user: viewer }) : false,
    getViewerState(blog._id, viewer),
  ]);
  if (counted) blog.views += 1;

  return { ...blog.toJSON(), ...viewerState };
};

// Everything that references a blog, removed when the blog is
export const deleteBlogEngagement = (blogIds) => {
  const filter = { blog: { $in: blogIds } };
  return Promise.all([
    BlogLike.deleteMany(filter),
    Bookmark.deleteMany(filter),
    ReadingHistory.deleteMany(filter),
    BlogView.deleteMany(filter),
    Comment.deleteMany(filter),
  ]);
};

export const createBlog = async (data, file, user) => {
  const slug = await generateUniqueSlug(data.title);
  const coverImage = file ? await uploadImage(file.buffer, IMAGE_PRESETS.BLOG_COVER) : {};

  let blog;
  try {
    blog = await Blog.create({ ...data, slug, coverImage, author: user._id });
  } catch (error) {
    // Don't leave an orphaned image in Cloudinary if the DB write failed
    await deleteImage(coverImage.publicId);
    throw error;
  }

  const type =
    blog.status === BLOG_STATUS.PUBLISHED
      ? ACTIVITY_TYPES.BLOG_PUBLISHED
      : ACTIVITY_TYPES.BLOG_CREATED;
  await logActivity(user._id, type, blog);
  return blog.populate('author', AUTHOR_FIELDS);
};

const EMPTY_COVER = { url: '', publicId: '' };

/**
 * Cover handling on update:
 *   new file            → upload, save, then delete the old cover (replace)
 *   removeCover: true   → clear the cover, save, then delete it from Cloudinary
 * The old image is only deleted after the DB write succeeds, and a new upload is rolled back
 * if it fails, so a blog never points at a missing image and no orphan is left behind.
 */
export const updateBlog = async (id, { removeCover, ...data }, file, user) => {
  if (!Object.keys(data).length && !file && !removeCover) {
    throw new ApiError(400, 'Nothing to update');
  }

  const blog = await findBlogOrThrow(id);
  assertCanModify(blog, user);

  // Drafts get a fresh slug when retitled; published URLs stay stable so links don't break
  if (data.title && data.title !== blog.title && blog.status === BLOG_STATUS.DRAFT) {
    blog.slug = await generateUniqueSlug(data.title, blog._id);
  }

  const wasPublished = blog.status === BLOG_STATUS.PUBLISHED;
  Object.assign(blog, data);

  const oldPublicId = blog.coverImage?.publicId;
  const coverChanged = Boolean(file || (removeCover && oldPublicId));
  if (file) blog.coverImage = await uploadImage(file.buffer, IMAGE_PRESETS.BLOG_COVER);
  else if (removeCover) blog.coverImage = EMPTY_COVER;

  try {
    await blog.save();
  } catch (error) {
    if (file) await deleteImage(blog.coverImage.publicId);
    throw error;
  }

  if (coverChanged) await deleteImage(oldPublicId);

  const justPublished = !wasPublished && blog.status === BLOG_STATUS.PUBLISHED;
  await logActivity(
    user._id,
    justPublished ? ACTIVITY_TYPES.BLOG_PUBLISHED : ACTIVITY_TYPES.BLOG_UPDATED,
    blog
  );
  return blog.populate('author', AUTHOR_FIELDS);
};

// DELETE /blogs/:id/cover. Idempotent: removing a cover that isn't there just returns the blog.
export const removeBlogCover = async (id, user) => {
  const blog = await findBlogOrThrow(id);
  assertCanModify(blog, user);

  const oldPublicId = blog.coverImage?.publicId;
  if (oldPublicId || blog.coverImage?.url) {
    blog.coverImage = EMPTY_COVER;
    await blog.save();
    await deleteImage(oldPublicId);
    await logActivity(user._id, ACTIVITY_TYPES.BLOG_UPDATED, blog);
  }
  return blog.populate('author', AUTHOR_FIELDS);
};

export const deleteBlog = async (id, user) => {
  const blog = await findBlogOrThrow(id);
  assertCanModify(blog, user);

  await blog.deleteOne();
  await deleteBlogEngagement([blog._id]);
  await deleteImage(blog.coverImage?.publicId);
  await logActivity(user._id, ACTIVITY_TYPES.BLOG_DELETED, blog);
};
