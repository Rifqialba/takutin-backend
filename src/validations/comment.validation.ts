import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment too long')
  }),
  params: z.object({
    id: z.string().uuid('Invalid story ID format')
  })
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment too long')
  }),
  params: z.object({
    id: z.string().uuid('Invalid comment ID format')
  })
});

export const commentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid comment ID format')
  })
});