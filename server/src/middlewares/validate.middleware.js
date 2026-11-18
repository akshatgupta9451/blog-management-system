import { matchedData, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Runs after a validator chain: rejects with 422, otherwise replaces req.body with only
// the fields the chain declared (sanitized), so unexpected fields like `role` never get through.
// Express 5 recomputes req.query on every access, so sanitized query values (e.g. page as a
// number) are exposed on req.validatedQuery instead.
export const validate = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result
      .array({ onlyFirstError: true })
      .map((err) => ({ field: err.path, message: err.msg }));
    return next(new ApiError(422, 'Validation failed', errors));
  }

  req.body = matchedData(req, { locations: ['body'] });
  req.validatedQuery = matchedData(req, { locations: ['query'] });
  next();
};
