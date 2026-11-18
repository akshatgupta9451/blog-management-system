import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import { TOKEN_COOKIES } from '../constants/index.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[TOKEN_COOKIES.ACCESS];
};

const resolveUser = async (token) => {
  // JWT errors (expired / invalid signature) are mapped to 401 by the error handler
  const payload = verifyAccessToken(token);

  // Load from the DB so role changes and deleted accounts take effect immediately
  const user = await User.findById(payload.sub).select('+passwordChangedAt');
  if (!user) throw new ApiError(401, 'User no longer exists');

  // A password change signs out every other device, including their unexpired access tokens
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new ApiError(401, 'Password was changed, please log in again');
  }
  return user;
};

// Requires a valid access token; attaches the current user to req.user
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'Authentication required');

  req.user = await resolveUser(token);
  next();
});

// For public routes that behave differently for logged-in users (e.g. authors seeing their
// own drafts). No token means anonymous; a bad token still returns 401 so the client refreshes.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) req.user = await resolveUser(token);
  next();
});

// Must run after `protect`. Usage: authorize(USER_ROLES.ADMIN, USER_ROLES.AUTHOR)
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
