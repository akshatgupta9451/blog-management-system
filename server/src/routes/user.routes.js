import { Router } from 'express';
import { deleteMe, getMyActivity, updateMe } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { acceptImage } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  activityQueryValidator,
  deleteAccountValidator,
  updateProfileValidator,
} from '../validators/user.validator.js';
import {
  deleteHistory,
  deleteHistoryEntry,
  getMyBookmarks,
  getMyHistory,
  getMyLikes,
} from '../controllers/engagement.controller.js';
import {
  historyBlogIdValidator,
  libraryQueryValidator,
} from '../validators/engagement.validator.js';

const router = Router();

// Any logged-in user. Accepts JSON, or multipart/form-data with an optional `avatar` file.
router.patch('/me', protect, ...acceptImage('avatar'), updateProfileValidator, validate, updateMe);
router.delete('/me', protect, deleteAccountValidator, validate, deleteMe);
router.get('/me/activity', protect, activityQueryValidator, validate, getMyActivity);

// The user's library. "Recently viewed" is /me/history with a small limit.
router.get('/me/likes', protect, libraryQueryValidator, validate, getMyLikes);
router.get('/me/bookmarks', protect, libraryQueryValidator, validate, getMyBookmarks);
router.get('/me/history', protect, libraryQueryValidator, validate, getMyHistory);
router.delete('/me/history', protect, deleteHistory);
router.delete('/me/history/:blogId', protect, historyBlogIdValidator, validate, deleteHistoryEntry);

export default router;
