import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiry,
  });

// jwtid makes every refresh token unique, even two issued in the same second
export const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiry,
    jwtid: crypto.randomUUID(),
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.accessTokenSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshTokenSecret);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Cookie lifetime mirrors the token's own `exp` claim, so the two never drift apart
export const getTokenExpiryDate = (token) => new Date(jwt.decode(token).exp * 1000);
