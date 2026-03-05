import { Router } from 'express';
import { bookmarkController } from '../../controllers/bookmark.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All bookmark routes are protected
router.use(authenticate);

// GET /api/v1/bookmarks - Get user's bookmarks
router.get('/', bookmarkController.getUserBookmarks);

// POST /api/v1/bookmarks/stories/:storyId - Add bookmark
router.post('/stories/:storyId', bookmarkController.addBookmark);

// DELETE /api/v1/bookmarks/stories/:storyId - Remove bookmark
router.delete('/stories/:storyId', bookmarkController.removeBookmark);

// GET /api/v1/bookmarks/stories/:storyId/status - Check if bookmarked
router.get('/stories/:storyId/status', bookmarkController.isBookmarked);

export default router;
