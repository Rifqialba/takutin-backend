import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// User profile (protected)
router.get('/profile', authenticate, authController.getMe);

export default router;