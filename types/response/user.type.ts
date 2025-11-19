import { IArticle, IArticleComment } from "./article.type";
import { ICountry } from "./base.type";
import { IBooking } from "./booking.type";
import { IReview } from "./review.type";
import { ITour } from "./tour.type";

export type UserStatus = 0 | 1;
export type LoginType = 0 | 1 | 2;
export type SupplierStatus = 'active' | 'inactive';
export type BookingPaymentStatus = 'active' | 'inactive';
export type NotificationType =
  | 'welcome'
  | 'feature'
  | 'promotion'
  | 'payment'
  | 'booking'
  | 'reminder'
  | 'review'
  | 'recommendation'
  | 'profile'
  | 'alert'
  | 'update'
  | 'reward'
  | 'maintenance'
  | 'policy';

export interface IPermission {
  id: number;
  permission_name: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IRole {
  id: number;
  name: string;
  desciption: string;
  users: IUser[];
  permissions: IPermission[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ISupplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  users: IUser[];
  tours: ITour[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IUserAuthSession {
  id: number;
  user_uid: string;
  access_token: string;
  refresh_token: string;
  created_at: Date;
  updated_at: Date;
  user: IUser;
}

export interface IPaymentInformation {
  id: number;
  is_default: boolean;
  expiry_date: string;
  account_number: string;      
  account_number_hint: string; 
  account_holder: string;
  ccv: string;                
  user: IUser;
  bookings: IBooking[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface INotification {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  is_error: boolean;
  is_user: boolean;
  users: IUser[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IUser {
  id: number;
  uuid: string;
  username: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status: UserStatus;
  login_type: LoginType;

  auth_sessions: IUserAuthSession[];
  role: IRole;

  payment_informations: IPaymentInformation[];
  articles: IArticle[];
  comments: IArticleComment[];
  reviews: IReview[];

  country: ICountry;
  tours_favorites: ITour[];
  articles_like: IArticle[];

  supplier: ISupplier | null;
  bookings: IBooking[];

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}