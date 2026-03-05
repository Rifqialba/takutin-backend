import { Router } from 'express';
import { storyController } from '../../controllers/story.controller';
import { validate } from '../../middleware/validator.middleware';
import { 
  createStorySchema, 
  updateStorySchema, 
  storyIdSchema,
  paginationSchema 
} from '../../validations/story.validation';
import { createCommentSchema, updateCommentSchema, commentIdSchema } from '../../validations/comment.validation';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { commentController } from '../../controllers/comment.controller';

const router = Router();

// Public routes
router.get('/', validate(paginationSchema), storyController.getPublishedStories);
router.get('/search', storyController.searchStories);
router.get('/trending', storyController.getTrendingStories);
router.get('/:id', optionalAuth, validate(storyIdSchema), storyController.getStoryById);
router.get('/:id/comments', validate(storyIdSchema), storyController.getStoryComments);
router.get('/author/:username', optionalAuth, storyController.getStoriesByAuthor);

// Protected routes
router.post('/', authenticate, validate(createStorySchema), storyController.createStory);
router.put('/:id', authenticate, validate(updateStorySchema), storyController.updateStory);
router.delete('/:id', authenticate, validate(storyIdSchema), storyController.deleteStory);
router.post('/:id/like', authenticate, validate(storyIdSchema), storyController.toggleLike);
router.post('/:id/comments', authenticate, validate(createCommentSchema), storyController.addComment);

// Comment routes (protected)
router.put('/comments/:id', authenticate, validate(updateCommentSchema), commentController.updateComment);
router.delete('/comments/:id', authenticate, validate(commentIdSchema), commentController.deleteComment);

export default router;