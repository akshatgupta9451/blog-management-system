import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as rules from '../validators/admin.validator.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

// Every route below requires a logged-in admin: 401 without a session, 403 for other roles.
// Applied once here so no admin endpoint can be added without it.
router.use(protect, authorize(USER_ROLES.ADMIN));

router.get('/overview', admin.overview);
router.get('/analytics', rules.analyticsValidator, validate, admin.analytics);

router.get('/users', rules.listUsersValidator, validate, admin.users);
router.patch('/users/:id/role', rules.roleValidator, validate, admin.changeRole);
router.delete('/users/:id', rules.userIdValidator, validate, admin.deleteUser);

router.get('/blogs', rules.listBlogsValidator, validate, admin.blogs);
router.patch('/blogs/:id/status', rules.blogStatusValidator, validate, admin.changeBlogStatus);
router.delete('/blogs/:id', rules.blogIdValidator, validate, admin.deleteBlog);

router.get('/comments', rules.listCommentsValidator, validate, admin.comments);
router.delete('/comments/:id', rules.commentIdValidator, validate, admin.deleteComment);

export default router;
