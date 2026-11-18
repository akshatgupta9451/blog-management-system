import api from '@/api/axiosInstance';

// Likes and bookmarks are idempotent on the server, so retries and double clicks are safe

export const likeBlog = async (blogId) => (await api.post(`/blogs/${blogId}/like`)).data;

export const unlikeBlog = async (blogId) => (await api.delete(`/blogs/${blogId}/like`)).data;

export const bookmarkBlog = async (blogId) => (await api.post(`/blogs/${blogId}/bookmark`)).data;

export const removeBookmark = async (blogId) =>
  (await api.delete(`/blogs/${blogId}/bookmark`)).data;

export const getTrending = async (limit, { signal } = {}) =>
  (await api.get('/blogs/trending', { params: { limit }, signal })).data.blogs;

export const getPopular = async (limit, { signal } = {}) =>
  (await api.get('/blogs/popular', { params: { limit }, signal })).data.blogs;

export const getMyLikes = async (params, { signal } = {}) =>
  (await api.get('/users/me/likes', { params, signal })).data;

export const getMyBookmarks = async (params, { signal } = {}) =>
  (await api.get('/users/me/bookmarks', { params, signal })).data;

// "Recently viewed" is the first page of history with a small limit
export const getMyHistory = async (params, { signal } = {}) =>
  (await api.get('/users/me/history', { params, signal })).data;

export const removeHistoryEntry = (blogId) => api.delete(`/users/me/history/${blogId}`);

export const clearHistory = () => api.delete('/users/me/history');
