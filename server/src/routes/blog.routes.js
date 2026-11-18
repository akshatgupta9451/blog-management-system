import { Router } from 'express';
import {
  create,
  getBlog,
  getBlogTaxonomy,
  getBlogs,
  getMyBlogs,
  getMyStats,
  remove,
  removeCover,
  update,
} from '../controllers/blog.controller.js';
import { authorize, optionalAuth, protect } from '../middlewares/auth.middleware.js';
import { acceptImage } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  blogIdValidator,
  blogSlugValidator,
  createBlogValidator,
  listBlogsValidator,
  updateBlogValidator,
} from '../validators/blog.validator.js';
import { USER_ROLES } from '../constants/index.js';
import {
  bookmark,
  like,
  popular,
  trending,
  unbookmark,
  unlike,
} from '../controllers/engagement.controller.js';
import {
  blogIdParamValidator,
  discoveryLimitValidator,
} from '../validators/engagement.validator.js';

const router = Router();

const canWrite = [protect, authorize(USER_ROLES.AUTHOR, USER_ROLES.ADMIN)];

// Public (optionally personalised)
router.get('/', optionalAuth, listBlogsValidator, validate, getBlogs);

// Must be registered before "/:slug" or "me" / "taxonomy" would be treated as slugs
router.get('/taxonomy', getBlogTaxonomy);
router.get('/trending', discoveryLimitValidator, validate, trending);
router.get('/popular', discoveryLimitValidator, validate, popular);
router.get('/me', protect, listBlogsValidator, validate, getMyBlogs);
router.get('/me/stats', protect, getMyStats);

router.get('/:slug', optionalAuth, blogSlugValidator, validate, getBlog);

// Any logged-in user. Idempotent: repeating a like/bookmark (or its removal) is harmless.
router.post('/:id/like', protect, blogIdParamValidator, validate, like);
router.delete('/:id/like', protect, blogIdParamValidator, validate, unlike);
router.post('/:id/bookmark', protect, blogIdParamValidator, validate, bookmark);
router.delete('/:id/bookmark', protect, blogIdParamValidator, validate, unbookmark);

// Authors and admins. Accepts JSON, or multipart/form-data with an optional `coverImage` file.
router.post('/', ...canWrite, ...acceptImage('coverImage'), createBlogValidator, validate, create);
router.patch(
  '/:id',
  ...canWrite,
  ...acceptImage('coverImage'),
  updateBlogValidator,
  validate,
  update
);
router.delete('/:id', ...canWrite, blogIdValidator, validate, remove);
router.delete('/:id/cover', ...canWrite, blogIdValidator, validate, removeCover);

export default router;
