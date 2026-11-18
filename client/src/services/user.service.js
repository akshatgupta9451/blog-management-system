import api from '@/api/axiosInstance';

export const updateProfile = async ({ avatar, ...fields }) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  if (avatar instanceof File) formData.append('avatar', avatar);

  const { data } = await api.patch('/users/me', formData);
  return data.user;
};

export const deleteAccount = (password) => api.delete('/users/me', { data: { password } });

export const getMyActivity = async (params, { signal } = {}) => {
  const { data } = await api.get('/users/me/activity', { params, signal });
  return data;
};
