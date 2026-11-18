import { param, query, body } from 'express-validator';
import { BLOG_STATUS, PAGINATION, USER_ROLES } from '../constants/index.js';
import { ANALYTICS_RANGES } from '../services/admin.service.js';

const oneOf = (field, values) =>
  query(field)
    .optional({ values: 'falsy' })
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(', ')}`);

const pagination = [
  query('page').optional().isInt({ min: 1, max: 10_000 }).withMessage('Invalid page').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`limit must be between 1 and ${PAGINATION.MAX_LIMIT}`)
    .toInt(),
];

const searchTerm = query('search')
  .optional({ values: 'falsy' })
  .isString()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Search must be at most 100 characters');

const idParam = (label) => param('id').isMongoId().withMessage(`Invalid ${label} id`);

export const analyticsValidator = [oneOf('range', Object.keys(ANALYTICS_RANGES))];

export const listUsersValidator = [
  searchTerm,
  oneOf('role', Object.values(USER_ROLES)),
  oneOf('sort', ['newest', 'oldest', 'name']),
  ...pagination,
];

export const listBlogsValidator = [
  searchTerm,
  oneOf('status', Object.values(BLOG_STATUS)),
  query('category')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ max: 50 }),
  query('author').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }),
  oneOf('sort', ['newest', 'oldest', 'updated', 'views', 'likes', 'title']),
  ...pagination,
];

export const listCommentsValidator = [
  searchTerm,
  query('blog').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid blog id'),
  ...pagination,
];

export const userIdValidator = [idParam('user')];
export const blogIdValidator = [idParam('blog')];
export const commentIdValidator = [idParam('comment')];

export const roleValidator = [
  idParam('user'),
  body('role')
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
];

export const blogStatusValidator = [
  idParam('blog'),
  body('status')
    .isIn(Object.values(BLOG_STATUS))
    .withMessage(`Status must be one of: ${Object.values(BLOG_STATUS).join(', ')}`),
];
