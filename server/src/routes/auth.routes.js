import { Router } from 'express';
import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  changePasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh-token', refreshTokenValidator, validate, refreshToken);
// Logout works off the refresh token, so it succeeds even after the access token expired
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.post('/change-password', protect, changePasswordValidator, validate, changePassword);

export default router;
