export interface Comment {
  id: string;
  content: string;
  story_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCommentInput {
  content: string;
  story_id: string;
  user_id: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
}