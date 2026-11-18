import { param, query } from 'express-validator';
import { ENGAGEMENT, PAGINATION } from '../constants/index.js';

export const blogIdParamValidator = [param('id').isMongoId().withMessage('Invalid blog id')];

export const historyBlogIdValidator = [param('blogId').isMongoId().withMessage('Invalid blog id')];

export const discoveryLimitValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: ENGAGEMENT.DISCOVERY_MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${ENGAGEMENT.DISCOVERY_MAX_LIMIT}`)
    .toInt(),
];

export const libraryQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`)
    .toInt(),
];
