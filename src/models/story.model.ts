export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  author_id: string;
  status: 'draft' | 'published';
  view_count: number;
  published_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Untuk create story
export interface CreateStoryInput {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
}

// Untuk update story
export interface UpdateStoryInput {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
}

// Story dengan data author (untuk response)
export interface StoryWithAuthor extends Story {
  author: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  likes_count?: number;
  comments_count?: number;
}