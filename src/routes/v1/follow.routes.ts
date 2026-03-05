import { Router } from 'express';
import { followController } from '../../controllers/follow.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/:username/followers', followController.getFollowers);
router.get('/:username/following', followController.getFollowing);

// Protected routes
router.post('/:username/follow', authenticate, followController.followUser);
router.delete('/:username/follow', authenticate, followController.unfollowUser);
router.get('/:username/is-following', optionalAuth, followController.checkFollowing);

export default router;