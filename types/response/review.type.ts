import { ITour } from "./tour.type";
import { IUser } from "./user.type";

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReviewImage {
  id: number;
  image_url: string;
  sort_no?: number | null;
  is_visible: boolean;
  review: IReview;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IReview {
  id: number;
  title: string;
  rating: number;
  content: string;
  sort_no?: number | null;
  status: ReviewStatus;
  user: IUser;
  images: IReviewImage[];
  tour: ITour;
  is_reported?: boolean;
  helpful_count?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}