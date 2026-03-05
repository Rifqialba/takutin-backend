export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type UserPublic = Omit<User, 'password_hash'>;

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  bio?: string; // TAMBAHKAN BIO
}

export interface CreateUserRepoInput {
  email: string;
  username: string;
  bio?: string | null; // TAMBAHKAN BIO
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  bio?: string | null; // TAMBAHKAN BIO
  avatar_url?: string | null;
}
