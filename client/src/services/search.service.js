import api from '@/api/axiosInstance';

// GET /search → { blogs, pagination, facets, applied }. Params are passed through as-is;
// empty values are dropped so the API treats them as "not set".
export const searchBlogs = async (params, { signal } = {}) => {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value));
  const { data } = await api.get('/search', { params: cleaned, signal });
  return data;
};
