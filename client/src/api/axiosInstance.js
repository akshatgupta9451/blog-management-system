import axios from 'axios';
import { SESSION_EXPIRED_EVENT } from '@/constants';

// No default Content-Type: axios sets JSON for objects and the multipart boundary for FormData
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true, // send/receive httpOnly auth cookies
  timeout: 15000,
});

// Requests that must never trigger a token refresh (they are the auth flow itself)
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout'];

// Shared between concurrent 401s so only one refresh request is ever in flight;
// two parallel refreshes would trip the server's refresh-token reuse detection
let refreshPromise = null;

const refreshSession = () => {
  refreshPromise ??= axiosInstance.post('/auth/refresh-token').finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_URLS.some((url) => original.url?.startsWith(url));

    if (!shouldRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      await refreshSession();
      return axiosInstance(original);
    } catch {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
