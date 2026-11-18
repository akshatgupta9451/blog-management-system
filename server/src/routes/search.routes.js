import { Router } from 'express';
import { search } from '../controllers/search.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { searchValidator } from '../validators/search.validator.js';

const router = Router();

// Public. Only published blogs are ever searched.
router.get('/', searchValidator, validate, search);

export default router;
