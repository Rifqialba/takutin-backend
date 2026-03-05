import { Router } from 'express';
import authRoutes from './auth.routes';
import storyRoutes from './story.routes';
import followRoutes from './follow.routes';
import userRoutes from './user.routes';
import bookmarkRoutes from './bookmark.routes'; // TAMBAHKAN

const router = Router();

router.use('/auth', authRoutes);
router.use('/stories', storyRoutes);
router.use('/users', userRoutes);
router.use('/follow', followRoutes);
router.use('/bookmarks', bookmarkRoutes);

export default router;
