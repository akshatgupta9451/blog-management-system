import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  getMyBlogStats,
  getTaxonomy,
  removeBlogCover,
  listBlogs,
  listMyBlogs,
  updateBlog,
} from '../services/blog.service.js';
import { getViewerKey } from '../services/view.service.js';

export const getBlogs = asyncHandler(async (req, res) => {
  const result = await listBlogs(req.validatedQuery, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Blogs fetched'));
});

export const getMyBlogs = asyncHandler(async (req, res) => {
  const result = await listMyBlogs(req.validatedQuery, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Your blogs fetched'));
});

export const getMyStats = asyncHandler(async (req, res) => {
  const stats = await getMyBlogStats(req.user);
  res.status(200).json(new ApiResponse(200, { stats }, 'Blog stats fetched'));
});

export const getBlogTaxonomy = asyncHandler(async (_req, res) => {
  const taxonomy = await getTaxonomy();
  res.status(200).json(new ApiResponse(200, taxonomy, 'Taxonomy fetched'));
});

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await getBlogBySlug(req.params.slug, req.user, getViewerKey(req));
  res.status(200).json(new ApiResponse(200, { blog }, 'Blog fetched'));
});

export const create = asyncHandler(async (req, res) => {
  const blog = await createBlog(req.body, req.file, req.user);
  res.status(201).json(new ApiResponse(201, { blog }, 'Blog created successfully'));
});

export const update = asyncHandler(async (req, res) => {
  const blog = await updateBlog(req.params.id, req.body, req.file, req.user);
  res.status(200).json(new ApiResponse(200, { blog }, 'Blog updated successfully'));
});

export const remove = asyncHandler(async (req, res) => {
  await deleteBlog(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, null, 'Blog deleted successfully'));
});

export const removeCover = asyncHandler(async (req, res) => {
  const blog = await removeBlogCover(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, { blog }, 'Cover image removed'));
});
