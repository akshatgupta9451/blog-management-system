import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Translates known library errors into ApiErrors with a sensible status and message
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof jwt.TokenExpiredError) {
    return new ApiError(401, 'Session expired, please refresh your token');
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return new ApiError(401, 'Invalid authentication token');
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new ApiError(422, 'Validation failed', errors);
  }
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for ${err.path}`);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new ApiError(409, `A record with this ${field} already exists`);
  }

  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Image is too large (max 5MB)',
      LIMIT_FILE_COUNT: 'Only one image can be uploaded at a time',
      LIMIT_UNEXPECTED_FILE: `Unexpected file field "${err.field}"`,
    };
    return new ApiError(400, messages[err.code] ?? err.message);
  }

  // Malformed JSON body or payload over JSON_LIMIT (thrown by express.json)
  if (err.type === 'entity.parse.failed') return new ApiError(400, 'Malformed JSON body');
  if (err.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');

  if (err.message?.startsWith('Origin ') && err.message.endsWith('not allowed by CORS')) {
    return new ApiError(403, err.message);
  }

  return err;
};

export const errorHandler = (rawErr, _req, res, _next) => {
  const err = normalizeError(rawErr);
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) console.error(rawErr);

  res.status(statusCode).json({
    success: false,
    // Never leak internal error messages to clients in production
    message:
      statusCode >= 500 && env.isProduction
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
    errors: err.errors || [],
    ...(env.isProduction ? {} : { stack: rawErr.stack }),
  });
};
