import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import blogRoutes from './blog.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

export default router;
