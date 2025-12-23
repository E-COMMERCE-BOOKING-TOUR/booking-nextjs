import { ICountry, ICurrency, IDivision } from "./base.type";
import { IBooking, IBookingItem, IBookingPassenger } from "./booking.type";
import { IReview } from "./review.type";
import { IUser } from "./user.type";

export type TourStatus = 'draft' | 'active' | 'inactive';
export type TourVariantStatus = 'active' | 'inactive';
export type TourSessionStatus = 'open' | 'closed' | 'full' | 'cancelled';
export type PriceType = 'absolute' | 'delta';


export interface ISupplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  users: IUser[];
  tours: ITour[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourCategory {
  id: number;
  name: string;
  sort_no?: number | null;
  tours: ITour[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourImage {
  id: number;
  image_url: string;
  sort_no?: number | null;
  is_cover: boolean;
  tour: ITour;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourVariant {
  id: number;
  name: string;
  sort_no?: number | null;
  min_pax_per_booking: number;
  capacity_per_slot?: number | null;
  tax_included: boolean;
  cutoff_hours: number;
  status: TourVariantStatus;
  tour: ITour;
  currency: ICurrency;
  tour_sessions: ITourSession[];
  tour_policy: ITourPolicy[];
  tour_variant_pax_type_prices: ITourVariantPaxTypePrice[];
  tour_price_rules: ITourPriceRule[];
  booking_items: IBookingItem[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourSession {
  id: number;
  session_date: Date;
  start_time: Date;
  end_time?: Date | null;
  capacity?: number | null;
  status: TourSessionStatus;
  tour_variant: ITourVariant;
  tour_inventory_holds: ITourInventoryHold[];
  booking_items: IBookingItem[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourPolicy {
  id: number;
  name: string;
  tour_policy_rules: ITourPolicyRule[];
  tour_variant: ITourVariant;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourPolicyRule {
  id: number;
  before_hours: number;
  fee_pct: number;
  sort_no: number;
  tour_policy: ITourPolicy;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourPriceRule {
  id: number;
  start_date: Date;
  end_date: Date;
  weekday_mask: number;
  price_type: PriceType;
  priority: number;
  tour_variant: ITourVariant;
  tour_rule_pax_type_prices: ITourRulePaxTypePrice[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourRulePaxTypePrice {
  id: number;
  price: number;
  tour_price_rule: ITourPriceRule;
  pax_type: ITourPaxType;
}

export interface ITourVariantPaxTypePrice {
  id: number;
  price: number;
  tour_variant: ITourVariant;
  pax_type: ITourPaxType;
}

export interface ITourPaxType {
  id: number;
  name: string;
  min_age: number;
  max_age: number;
  tour_variant_pax_type_prices: ITourVariantPaxTypePrice[];
  booking_items: IBookingItem[];
  booking_passengers: IBookingPassenger[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourInventoryHold {
  id: number;
  quantity: number;
  expires_at?: Date | null;
  tour_session: ITourSession;
  booking?: IBooking | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITour {
  id: number;
  title: string;
  description: string;
  summary: string;
  map_url: string;
  slug: string;
  address: string;
  score_rating?: number | null;
  tax: number;
  is_visible: boolean;
  published_at?: Date | null;
  status: TourStatus;
  duration_hours?: number | null;
  duration_days?: number | null;
  min_pax: number;
  max_pax?: number | null;
  country: ICountry;
  division: IDivision;
  currency: ICurrency;
  users_favorites: IUser[];
  reviews: IReview[];
  tour_categories: ITourCategory[];
  supplier: ISupplier;
  images: ITourImage[];
  variants: ITourVariant[];
  meeting_point?: string;
  included?: string[];
  not_included?: string[];
  highlights?: { title: string; items: string[] };
  languages?: string[];
  staff_score?: number;
  testimonial?: { name: string; country: string; text: string };
  map_preview?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}