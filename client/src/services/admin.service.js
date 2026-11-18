import api from '@/api/axiosInstance';

// Every call here hits /admin/*, which the server guards with protect + authorize(admin)

const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v));

export const getOverview = async ({ signal } = {}) =>
  (await api.get('/admin/overview', { signal })).data;

export const getAnalytics = async (range, { signal } = {}) =>
  (await api.get('/admin/analytics', { params: { range }, signal })).data;

export const getUsers = async (params, { signal } = {}) =>
  (await api.get('/admin/users', { params: clean(params), signal })).data;

export const setUserRole = async (id, role) =>
  (await api.patch(`/admin/users/${id}/role`, { role })).data.user;

export const deleteUser = async (id) => (await api.delete(`/admin/users/${id}`)).data;

export const getBlogs = async (params, { signal } = {}) =>
  (await api.get('/admin/blogs', { params: clean(params), signal })).data;

export const setBlogStatus = async (id, status) =>
  (await api.patch(`/admin/blogs/${id}/status`, { status })).data.blog;

export const deleteBlog = (id) => api.delete(`/admin/blogs/${id}`);

export const getComments = async (params, { signal } = {}) =>
  (await api.get('/admin/comments', { params: clean(params), signal })).data;

export const deleteComment = async (id) => (await api.delete(`/admin/comments/${id}`)).data;
