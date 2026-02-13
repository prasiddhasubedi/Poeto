export interface User {
  id: string
  email: string
  username: string
  display_name: string
  bio: string | null
  profile_picture_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Poem {
  id: string
  author_id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
  edited_at: string | null
  author?: User
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

export interface Comment {
  id: string
  poem_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Like {
  id: string
  user_id: string
  poem_id: string
  created_at: string
}

export interface Follower {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: User
  following?: User
}

export interface PoemWithDetails extends Poem {
  author: User
  likes_count: number
  comments_count: number
  is_liked: boolean
}
