export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: Category;
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  postCount?: number;
}

