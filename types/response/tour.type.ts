/**
 * Centralized Tour Types
 * 
 * This file contains all tour-related types, organized by purpose:
 * 1. Enums - Status enums matching backend
 * 2. API Response Types - Match backend DTOs exactly
 * 3. Entity Types - For internal use (admin pages, relations)
 * 4. Legacy Types - For backward compatibility
 */

import { ICountry, ICurrency, IDivision } from "./base.type";
import { IBooking, IBookingItem, IBookingPassenger } from "./booking.type";
import { IReview } from "./review.type";
import { IUser } from "./user.type";

// ============================================================================
// ENUMS (matching backend)
// ============================================================================

export type TourStatus = 'draft' | 'active' | 'inactive';
export type TourVariantStatus = 'active' | 'inactive';
export type TourSessionStatus = 'open' | 'closed' | 'full' | 'cancelled';

// ============================================================================
// API RESPONSE TYPES (matching backend DTOs)
// ============================================================================

/**
 * Testimonial for tour detail
 * Matches: TourTestimonialDTO
 */
export interface ITourTestimonial {
  name: string;
  country: string;
  text: string;
}

/**
 * Activity/Highlights for tour detail
 * Matches: TourActivityDTO
 */
export interface ITourActivity {
  title: string;
  items: string[];
}

/**
 * Tour details info (language, duration, capacity)
 * Matches: TourDetailsInfoDTO
 */
export interface ITourDetailsInfo {
  language: string[];
  duration: string;
  capacity: string;
}

/**
 * Pax type price for variant
 * Matches: UserTourVariantPaxPriceDTO
 */
export interface IUserTourVariantPaxPrice {
  id: number;
  pax_type_id: number;
  price: number;
  pax_type_name: string;
}

/**
 * Tour policy rule
 * Matches: TourPolicyRuleDTO
 */
export interface ITourPolicyRule {
  before_hours: number;
  fee_pct: number;
  sort_no: number;
}

/**
 * Tour policy
 * Matches: TourPolicyDTO
 */
export interface ITourPolicy {
  id?: number;
  name: string;
  supplier_id: number;
  rules: ITourPolicyRule[];
}

/**
 * Variant for user tour detail
 * Matches: UserTourVariantDTO
 */
export interface IUserTourVariant {
  id: number;
  name: string;
  status: TourVariantStatus;
  prices: IUserTourVariantPaxPrice[];
  policy?: ITourPolicy;
}

/**
 * Tour session for availability calendar
 * Matches: UserTourSessionDTO
 */
export interface IUserTourSession {
  id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  status: 'open' | 'full' | 'closed';
  capacity_available: number;
  price: number;
}

/**
 * Popular tour for list/cards
 * Matches: UserTourPopularDTO
 */
export interface IUserTourPopular {
  id: number;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  ratingText: string;
  capacity: string;
  originalPrice?: number;
  currentPrice: number;
  tags: string[];
  slug: string;
  currencySymbol?: string;
  currencyCode?: string;
}

/**
 * Tour detail for detail page
 * Matches: UserTourDetailDTO
 */
export interface IUserTourDetail {
  id: number;
  title: string;
  slug: string;
  location: string;
  price: number;
  oldPrice?: number;
  currencySymbol?: string;
  currencyCode?: string;
  rating: number;
  durationDays: number;
  reviewCount: number;
  score: number;
  scoreLabel: string;
  staffScore: number;
  images: string[];
  testimonial?: ITourTestimonial;
  mapUrl: string;
  mapPreview?: string;
  description: string;
  summary: string;
  activity?: ITourActivity;
  included: string[];
  notIncluded: string[];
  details: ITourDetailsInfo;
  meetingPoint?: string;
  tags: string[];
  variants: IUserTourVariant[];
}

/**
 * Review for tour detail
 * Matches: UserTourReviewDTO
 */
export interface IUserTourReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
}

/**
 * Review category with score
 * Matches: UserTourReviewCategoryDTO
 */
export interface IUserTourReviewCategory {
  label: string;
  score: number;
}

/**
 * Related tour for carousel
 * Matches: UserTourRelatedDTO
 */
export interface IUserTourRelated {
  id: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  ratingText: string;
  capacity: string;
  originalPrice: number;
  currentPrice: number;
  tags: string[];
  slug: string;
}

/**
 * Search response
 * Matches: searchTours response
 */
export interface IUserTourSearchResponse {
  data: IUserTourPopular[];
  total: number;
  offset?: number;
  limit?: number;
}

/**
 * Search params for tour search API
 * Matches: UserTourSearchQueryDTO
 */
export interface IUserTourSearchParams {
  keyword?: string;
  destinations?: string[];
  country_ids?: number[];
  division_ids?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  adults?: number;
  seniors?: number;
  youth?: number;
  children?: number;
  infants?: number;
  rooms?: number;
  limit?: number;
  offset?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

// ============================================================================
// ENTITY TYPES (for admin pages, internal use)
// ============================================================================

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
  tours?: ITour[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourImage {
  id: number;
  image_url: string;
  sort_no?: number | null;
  is_cover: boolean;
  tour?: ITour;
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
  tour?: ITour;
  currency?: ICurrency;
  tour_sessions?: ITourSession[];
  tour_policy?: ITourPolicyEntity[];
  tour_variant_pax_type_prices?: ITourVariantPaxTypePrice[];
  prices?: {
    id: number;
    pax_type_id: number;
    price: number;
    pax_type_name: string;
  }[];
  booking_items?: IBookingItem[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourSession {
  id: number;
  session_date: Date;
  start_time?: Date | null;
  end_time?: Date | null;
  capacity?: number | null;
  status: TourSessionStatus;
  tour_variant?: ITourVariant;
  tour_inventory_holds?: ITourInventoryHold[];
  booking_items?: IBookingItem[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourPolicyEntity {
  id: number;
  name: string;
  tour_policy_rules?: ITourPolicyRuleEntity[];
  tour_variant?: ITourVariant;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourPolicyRuleEntity {
  id: number;
  before_hours: number;
  fee_pct: number;
  sort_no: number;
  tour_policy?: ITourPolicyEntity;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourVariantPaxTypePrice {
  id: number;
  price: number;
  tour_variant?: ITourVariant;
  pax_type?: ITourPaxType;
}

export interface ITourPaxType {
  id: number;
  name: string;
  min_age: number;
  max_age: number;
  tour_variant_pax_type_prices?: ITourVariantPaxTypePrice[];
  booking_items?: IBookingItem[];
  booking_passengers?: IBookingPassenger[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ITourInventoryHold {
  id: number;
  quantity: number;
  expires_at?: Date | null;
  tour_session?: ITourSession;
  booking?: IBooking | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Tour entity type (for admin pages)
 * This is the full entity type with all relations
 */
export interface ITour {
  id: number;
  title: string;
  description: string;
  summary: string;
  map_url?: string;
  slug: string;
  price?: number;
  old_price?: number;
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
  country?: ICountry;
  division?: IDivision;
  currency?: ICurrency;
  currencySymbol?: string;
  users_favorites?: IUser[];
  reviews?: IReview[];
  tour_categories?: ITourCategory[];
  supplier?: ISupplier;
  images?: string[] | ITourImage[];
  variants?: ITourVariant[];
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

// ============================================================================
// LEGACY/BACKWARD COMPATIBILITY TYPES
// ============================================================================

/**
 * @deprecated Use IUserTourPopular instead
 * Kept for backward compatibility with existing components
 */
export type ITourPopular = {
  id: string | number;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  ratingText: string;
  capacity: string;
  originalPrice: number;
  currentPrice: number;
  tags: string[];
  slug: string;
  currencySymbol?: string;
  currencyCode?: string;
};

/**
 * @deprecated Use IUserTourSearchResponse instead
 */
export type ITourSearchResponse = {
  data: ITourPopular[];
  total: number;
  offset?: number;
  limit?: number;
};