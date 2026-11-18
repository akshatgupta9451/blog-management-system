import { query } from 'express-validator';
import { PAGINATION, SEARCH } from '../constants/index.js';

// "a, B ,a" -> ["a", "b"]; also accepts repeated params (?tags=a&tags=b)
const toList = (value) => {
  const items = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(items.map((item) => String(item).trim().toLowerCase()).filter(Boolean))];
};

const listWithin = (label) => (list) => {
  if (list.length > SEARCH.MAX_FILTER_VALUES) {
    throw new Error(`Choose at most ${SEARCH.MAX_FILTER_VALUES} ${label}`);
  }
  if (list.some((item) => item.length > 50)) throw new Error(`Each ${label} value is too long`);
  return true;
};

// Empty strings (e.g. ?q=) are treated as "not provided"
const text = (name) =>
  query(name)
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: SEARCH.MAX_TERM_LENGTH })
    .withMessage(`${name} must be at most ${SEARCH.MAX_TERM_LENGTH} characters`);

export const searchValidator = [
  text('q'),
  text('title'),
  text('author'),

  query('category')
    .optional({ values: 'falsy' })
    .customSanitizer(toList)
    .custom(listWithin('categories')),
  query('tags').optional({ values: 'falsy' }).customSanitizer(toList).custom(listWithin('tags')),
  query('tagsMode')
    .optional({ values: 'falsy' })
    .isIn(['any', 'all'])
    .withMessage('tagsMode must be "any" or "all"'),

  query('date')
    .optional({ values: 'falsy' })
    .isIn(Object.keys(SEARCH.DATE_PRESETS))
    .withMessage(`date must be one of: ${Object.keys(SEARCH.DATE_PRESETS).join(', ')}`),
  query('from')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('from must be a date')
    .toDate(),
  query('to')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('to must be a date')
    .toDate()
    .custom((to, { req }) => !req.query.from || new Date(req.query.from) <= to)
    .withMessage('to must be on or after from'),

  query('sort')
    .optional({ values: 'falsy' })
    .isIn(SEARCH.SORTS)
    .withMessage(`sort must be one of: ${SEARCH.SORTS.join(', ')}`),

  // One chain per field: Express 5 recomputes req.query on every access, so a second chain
  // for the same field would re-read the raw string and undo toInt()
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .bail()
    .toInt()
    .custom((page, { req }) => {
      const limit = Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      return page * limit <= SEARCH.MAX_RESULT_WINDOW;
    })
    .withMessage(
      `Only the first ${SEARCH.MAX_RESULT_WINDOW} results can be paged through; refine the search`
    ),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`limit must be between 1 and ${PAGINATION.MAX_LIMIT}`)
    .toInt(),

  query('facets').optional().isBoolean().withMessage('facets must be true or false').toBoolean(),
];
