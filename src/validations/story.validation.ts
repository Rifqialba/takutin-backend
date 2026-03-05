import { z } from 'zod';

export const createStorySchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title too long'),
    content: z.string()
      .min(10, 'Content too short'),
    excerpt: z.string()
      .max(500, 'Excerpt too long')
      .optional()
      .nullable(),
    cover_image: z.string()
      .url('Invalid cover image URL')
      .optional()
      .nullable(),
    status: z.enum(['draft', 'published']).default('draft')
  })
});

export const updateStorySchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title too long')
      .optional(),
    content: z.string()
      .min(10, 'Content too short')
      .optional(),
    excerpt: z.string()
      .max(500, 'Excerpt too long')
      .optional()
      .nullable(),
    cover_image: z.string()
      .url('Invalid cover image URL')
      .optional()
      .nullable(),
    status: z.enum(['draft', 'published']).optional()
  })
});

export const storyIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid story ID format')
  })
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default(1),

    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default(10)
  })
});