import { body, param, query } from 'express-validator';
import { BLOG_SORT_FIELDS, BLOG_STATUS, PAGINATION } from '../constants/index.js';
import { plainTextLength, sanitizeContent } from '../utils/sanitizeContent.js';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MAX_CONTENT_LENGTH = 100_000;

// Accepts ["a","b"], "a,b", or a JSON string '["a","b"]' (multipart forms send strings).
// Returns lowercase, trimmed, de-duplicated tags.
const normalizeTags = (value) => {
  let tags = value;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      tags = Array.isArray(parsed) ? parsed : tags.split(',');
    } catch {
      tags = tags.split(',');
    }
  }
  if (!Array.isArray(tags)) return tags;
  return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))];
};

const tagsAreValid = (tags) => {
  if (!Array.isArray(tags)) throw new Error('Tags must be a list');
  if (tags.length > MAX_TAGS) throw new Error(`A blog can have at most ${MAX_TAGS} tags`);
  if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    throw new Error(`Each tag must be at most ${MAX_TAG_LENGTH} characters`);
  }
  return true;
};

const sortIsValid = (value) => {
  const fields = value.split(',').map((field) => field.trim().replace(/^-/, ''));
  const invalid = fields.filter((field) => !BLOG_SORT_FIELDS.includes(field));
  if (invalid.length) {
    throw new Error(
      `Cannot sort by: ${invalid.join(', ')}. Allowed: ${BLOG_SORT_FIELDS.join(', ')}`
    );
  }
  return true;
};

// Field rules shared by create (required) and update (optional)
const blogFields = ({ optional }) => {
  const field = (name) => (optional ? body(name).optional() : body(name));

  return [
    field('title')
      .isString()
      .withMessage('Title is required')
      .bail()
      .trim()
      .isLength({ min: 5, max: 150 })
      .withMessage('Title must be between 5 and 150 characters'),

    field('description')
      .isString()
      .withMessage('Description is required')
      .bail()
      .trim()
      .isLength({ min: 10, max: 300 })
      .withMessage('Description must be between 10 and 300 characters'),

    field('content')
      .isString()
      .withMessage('Content is required')
      .bail()
      .isLength({ max: MAX_CONTENT_LENGTH })
      .withMessage('Content is too long')
      .bail()
      .customSanitizer(sanitizeContent)
      .custom((html) => plainTextLength(html) >= 20)
      .withMessage('Content must contain at least 20 characters of text'),

    field('category')
      .isString()
      .withMessage('Category is required')
      .bail()
      .trim()
      .toLowerCase()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),

    body('tags').optional().customSanitizer(normalizeTags).custom(tagsAreValid),

    body('status')
      .optional()
      .isIn(Object.values(BLOG_STATUS))
      .withMessage(`Status must be one of: ${Object.values(BLOG_STATUS).join(', ')}`),
  ];
};

const blogIdParam = param('id').isMongoId().withMessage('Invalid blog id');

export const createBlogValidator = blogFields({ optional: false });

export const updateBlogValidator = [
  blogIdParam,
  ...blogFields({ optional: true }),
  // Multipart forms send booleans as strings ("true")
  body('removeCover')
    .optional()
    .isBoolean()
    .withMessage('removeCover must be true or false')
    .toBoolean(),
];

export const blogIdValidator = [blogIdParam];

export const blogSlugValidator = [
  param('slug')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid blog slug'),
];

export const listBlogsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10_000 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`)
    .toInt(),
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search must be between 1 and 100 characters'),
  query('category').optional().isString().trim().toLowerCase(),
  query('tags').optional().customSanitizer(normalizeTags).custom(tagsAreValid),
  query('author').optional().isMongoId().withMessage('Invalid author id'),
  query('status')
    .optional()
    .isIn(Object.values(BLOG_STATUS))
    .withMessage(`Status must be one of: ${Object.values(BLOG_STATUS).join(', ')}`),
  query('from').optional().isISO8601().withMessage('from must be an ISO 8601 date').toDate(),
  query('to').optional().isISO8601().withMessage('to must be an ISO 8601 date').toDate(),
  query('sort').optional().isString().bail().custom(sortIsValid),
];
