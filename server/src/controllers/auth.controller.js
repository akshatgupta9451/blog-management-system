import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { clearAuthCookies, setAuthCookies } from '../utils/authCookies.js';
import { TOKEN_COOKIES } from '../constants/index.js';
import {
  changePassword as changeUserPassword,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../services/auth.service.js';

// Browsers use the cookie; mobile / API clients may send it in the body instead
const getIncomingRefreshToken = (req) =>
  req.cookies?.[TOKEN_COOKIES.REFRESH] || req.body?.refreshToken;

const sendSession = (res, statusCode, { user, accessToken, refreshToken }, message) => {
  setAuthCookies(res, { accessToken, refreshToken });
  res
    .status(statusCode)
    .json(new ApiResponse(statusCode, { user, accessToken, refreshToken }, message));
};

export const register = asyncHandler(async (req, res) => {
  const session = await registerUser(req.body);
  sendSession(res, 201, session, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const session = await loginUser(req.body);
  sendSession(res, 200, session, 'Logged in successfully');
});

export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const session = await refreshSession(getIncomingRefreshToken(req));
    sendSession(res, 200, session, 'Token refreshed');
  } catch (error) {
    clearAuthCookies(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(getIncomingRefreshToken(req));
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user fetched'));
});

// The current device gets fresh tokens; every other session is signed out
export const changePassword = asyncHandler(async (req, res) => {
  const session = await changeUserPassword(req.user._id, req.body);
  sendSession(res, 200, session, 'Password changed successfully');
});
