import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ENGAGEMENT } from '../constants/index.js';
import {
  bookmarkBlog,
  clearHistory,
  likeBlog,
  listBookmarks,
  listHistory,
  listLikedBlogs,
  removeBookmark,
  removeFromHistory,
  unlikeBlog,
} from '../services/engagement.service.js';
import { getPopularBlogs, getTrendingBlogs } from '../services/discovery.service.js';

const ok = (res, data, message) => res.status(200).json(new ApiResponse(200, data, message));

export const like = asyncHandler(async (req, res) => {
  ok(res, await likeBlog(req.params.id, req.user), 'Blog liked');
});

export const unlike = asyncHandler(async (req, res) => {
  ok(res, await unlikeBlog(req.params.id, req.user), 'Like removed');
});

export const bookmark = asyncHandler(async (req, res) => {
  ok(res, await bookmarkBlog(req.params.id, req.user), 'Blog bookmarked');
});

export const unbookmark = asyncHandler(async (req, res) => {
  ok(res, await removeBookmark(req.params.id, req.user), 'Bookmark removed');
});

export const getMyLikes = asyncHandler(async (req, res) => {
  ok(res, await listLikedBlogs(req.user._id, req.validatedQuery), 'Liked blogs fetched');
});

export const getMyBookmarks = asyncHandler(async (req, res) => {
  ok(res, await listBookmarks(req.user._id, req.validatedQuery), 'Bookmarks fetched');
});

export const getMyHistory = asyncHandler(async (req, res) => {
  ok(res, await listHistory(req.user._id, req.validatedQuery), 'Reading history fetched');
});

export const deleteHistoryEntry = asyncHandler(async (req, res) => {
  await removeFromHistory(req.user._id, req.params.blogId);
  ok(res, null, 'Removed from history');
});

export const deleteHistory = asyncHandler(async (req, res) => {
  ok(res, await clearHistory(req.user._id), 'Reading history cleared');
});

export const trending = asyncHandler(async (req, res) => {
  const limit = req.validatedQuery.limit ?? ENGAGEMENT.DISCOVERY_DEFAULT_LIMIT;
  ok(res, { blogs: await getTrendingBlogs(limit) }, 'Trending blogs fetched');
});

export const popular = asyncHandler(async (req, res) => {
  const limit = req.validatedQuery.limit ?? ENGAGEMENT.DISCOVERY_DEFAULT_LIMIT;
  ok(res, { blogs: await getPopularBlogs(limit) }, 'Popular blogs fetched');
});
