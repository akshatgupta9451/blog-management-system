import api from '@/api/axiosInstance';

// Drops empty values and joins arrays, matching what the API's query validators expect
const toParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
  );

// Blog create/update always go as multipart so an optional cover image can ride along
export const toBlogFormData = ({ coverImage, removeCover, ...fields }) => {
  const formData = new FormData();
  if (removeCover && !(coverImage instanceof File)) formData.append('removeCover', 'true');
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, Array.isArray(value) ? value.join(',') : value);
  });
  if (coverImage instanceof File) formData.append('coverImage', coverImage);
  return formData;
};

export const getBlogs = async (params, { signal } = {}) => {
  const { data } = await api.get('/blogs', { params: toParams(params), signal });
  return data;
};

export const getMyBlogs = async (params, { signal } = {}) => {
  const { data } = await api.get('/blogs/me', { params: toParams(params), signal });
  return data;
};

export const getMyStats = async ({ signal } = {}) => {
  const { data } = await api.get('/blogs/me/stats', { signal });
  return data.stats;
};

export const getTaxonomy = async ({ signal } = {}) => {
  const { data } = await api.get('/blogs/taxonomy', { signal });
  return data;
};

export const getBlogBySlug = async (slug, { signal } = {}) => {
  const { data } = await api.get(`/blogs/${encodeURIComponent(slug)}`, { signal });
  return data.blog;
};

export const createBlog = async (values) => {
  const { data } = await api.post('/blogs', toBlogFormData(values));
  return data.blog;
};

export const updateBlog = async (id, values) => {
  const { data } = await api.patch(`/blogs/${id}`, toBlogFormData(values));
  return data.blog;
};

export const deleteBlog = (id) => api.delete(`/blogs/${id}`);
