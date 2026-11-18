import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { ACTIVITY_TYPES, BCRYPT_SALT_ROUNDS } from '../constants/index.js';
import { logActivity } from './activity.service.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';

// Compared against when the email is unknown, so login takes the same time either way
const DUMMY_HASH = bcrypt.hashSync('timing-attack-guard', BCRYPT_SALT_ROUNDS);

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateModifiedOnly: true });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password, bio }) => {
  const exists = await User.exists({ email });
  if (exists) throw new ApiError(409, 'An account with this email already exists');

  // Role is never taken from the request body; new accounts are always plain users
  const user = await User.create({ name, email, password, bio });
  const tokens = await issueTokens(user);
  await logActivity(user._id, ACTIVITY_TYPES.ACCOUNT_CREATED);

  return { user, ...tokens };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const tokens = await issueTokens(user);
  await logActivity(user._id, ACTIVITY_TYPES.LOGIN);
  return { user, ...tokens };
};

export const refreshSession = async (incomingToken) => {
  if (!incomingToken) throw new ApiError(401, 'Refresh token is missing');

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new ApiError(401, 'Refresh token is invalid or expired');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user) throw new ApiError(401, 'User no longer exists');

  // A validly signed token that is not the current one has already been rotated out.
  // Treat that as theft: revoke the session so neither party can keep refreshing.
  if (user.refreshTokenHash !== hashToken(incomingToken)) {
    user.refreshTokenHash = null;
    await user.save({ validateModifiedOnly: true });
    throw new ApiError(401, 'Refresh token has been revoked, please log in again');
  }

  const tokens = await issueTokens(user);
  return { user, ...tokens };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  await User.updateOne(
    { refreshTokenHash: hashToken(refreshToken) },
    { $set: { refreshTokenHash: null } }
  );
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }

  user.password = newPassword;
  await user.save();

  // Replacing the stored refresh token hash revokes every other device's session
  const tokens = await issueTokens(user);
  await logActivity(user._id, ACTIVITY_TYPES.PASSWORD_CHANGED);
  return { user, ...tokens };
};
