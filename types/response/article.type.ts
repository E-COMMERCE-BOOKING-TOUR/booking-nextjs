import { IUser } from "./user.type";

export interface IArticleImage {
  id: number;
  image_url: string;
  article: IArticle;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IArticleComment {
  id: number;
  content: string;
  article: IArticle;
  user: IUser;
  parent_id?: number | null;
  parent?: IArticleComment | null;
  children: IArticleComment[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IArticle {
  id: number;
  title: string;
  content: string;
  count_views: number;
  count_likes: number;
  count_comments: number;
  is_visible: boolean;
  user: IUser;
  users_like: IUser[];
  images: IArticleImage[];
  comments: IArticleComment[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}