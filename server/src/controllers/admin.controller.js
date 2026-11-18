import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as admin from '../services/admin.service.js';

const ok = (res, data, message) => res.status(200).json(new ApiResponse(200, data, message));

export const overview = asyncHandler(async (_req, res) => {
  ok(res, await admin.getOverview(), 'Overview fetched');
});

export const analytics = asyncHandler(async (req, res) => {
  ok(res, await admin.getAnalytics(req.validatedQuery.range), 'Analytics fetched');
});

export const users = asyncHandler(async (req, res) => {
  ok(res, await admin.listUsers(req.validatedQuery), 'Users fetched');
});

export const changeRole = asyncHandler(async (req, res) => {
  const user = await admin.updateUserRole(req.params.id, req.body.role, req.user);
  ok(res, { user }, 'User role updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  ok(res, await admin.deleteUser(req.params.id, req.user), 'User deleted');
});

export const blogs = asyncHandler(async (req, res) => {
  ok(res, await admin.listBlogs(req.validatedQuery), 'Blogs fetched');
});

export const changeBlogStatus = asyncHandler(async (req, res) => {
  const blog = await admin.setBlogStatus(req.params.id, req.body.status, req.user);
  ok(res, { blog }, 'Blog status updated');
});

export const deleteBlog = asyncHandler(async (req, res) => {
  await admin.removeBlog(req.params.id, req.user);
  ok(res, null, 'Blog deleted');
});

export const comments = asyncHandler(async (req, res) => {
  ok(res, await admin.listComments(req.validatedQuery), 'Comments fetched');
});

export const deleteComment = asyncHandler(async (req, res) => {
  ok(res, await admin.removeComment(req.params.id), 'Comment deleted');
});
