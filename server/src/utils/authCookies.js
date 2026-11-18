import { getTokenExpiryDate } from './token.js';
import { COOKIE_OPTIONS, REFRESH_COOKIE_PATH, TOKEN_COOKIES } from '../constants/index.js';

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(TOKEN_COOKIES.ACCESS, accessToken, {
    ...COOKIE_OPTIONS,
    expires: getTokenExpiryDate(accessToken),
  });
  res.cookie(TOKEN_COOKIES.REFRESH, refreshToken, {
    ...COOKIE_OPTIONS,
    path: REFRESH_COOKIE_PATH,
    expires: getTokenExpiryDate(refreshToken),
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie(TOKEN_COOKIES.ACCESS, COOKIE_OPTIONS);
  res.clearCookie(TOKEN_COOKIES.REFRESH, { ...COOKIE_OPTIONS, path: REFRESH_COOKIE_PATH });
};
