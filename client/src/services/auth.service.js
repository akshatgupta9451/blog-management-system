import api from '@/api/axiosInstance';

// Tokens live in httpOnly cookies set by the server, so the client never stores them

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.user;
};

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.user;
};

export const logout = () => api.post('/auth/logout');

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

// The server re-issues this device's cookies and signs out every other session
export const changePassword = async (payload) => {
  const { data } = await api.post('/auth/change-password', payload);
  return data.user;
};
