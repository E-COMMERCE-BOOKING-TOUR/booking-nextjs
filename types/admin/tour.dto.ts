export interface ITourPolicyRule {
    id?: number;
    before_hours: number;
    fee_pct: number;
    sort_no: number;
}

export interface ITourPolicy {
    id?: number;
    name: string;
    rules: ITourPolicyRule[];
    supplier_id?: number;
}

export type CreateTourDTO = {
    title: string;
    description: string;
    summary: string;
    map_url?: string | null;
    slug?: string;
    address: string;
    score_rating?: number | null;
    tax: number;
    is_visible: boolean;
    published_at?: string | null;
    status: "draft" | "active" | "inactive";
    duration_hours?: number | null;
    duration_days?: number | null;
    min_pax: number;
    max_pax?: number | null;
    country_id: number;
    division_id: number;
    currency_id: number;
    supplier_id: number;
    tour_category_ids?: number[];
    images?: { image_url: string; sort_no?: number; is_cover?: boolean }[];
    meeting_point?: string;
    included?: string[];
    not_included?: string[];
    highlights?: { title?: string; items?: string[] };
    languages?: string[];
    staff_score?: number;
    testimonial?: { name?: string; country?: string; text?: string };
    map_preview?: string;
    variants?: {
        id?: number;
        name: string;
        min_pax_per_booking: number;
        capacity_per_slot: number;
        tax_included: boolean;
        cutoff_hours: number;
        status: string;
        prices: {
            id?: number;
            pax_type_id: number;
            price: number;
        }[];
        tour_policy_id?: number;
        sessions?: {
            session_date: string;
            start_time: string;
            end_time?: string | null;
            status: string;
            capacity: number;
            capacity_available: number;
        }[];
    }[];
};

export type AdminTourSearchParams = {
    keyword?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
};

export interface IAdminTour {
    id: number;
    title: string;
    images: { image_url: string }[];
    address?: string;
    division?: { name_local: string };
    duration_days: number;
    duration_hours: number;
    status: string;
    slug: string;
    is_visible?: boolean;
    tour_categories?: { name: string }[];
}

export interface ICountry {
    id: number;
    name: string;
}

export interface IDivision {
    id: number;
    name_local: string;
}

export interface ICurrency {
    id: number;
    name: string;
    symbol: string;
}

export interface IAdminTourVariant {
    id: number;
    name: string;
    min_pax_per_booking: number;
    capacity_per_slot: number;
    tax_included: boolean;
    cutoff_hours: number;
    status: string;
    tour_variant_pax_type_prices?: {
        id: number;
        price: number;
        pax_type?: { id: number; name: string };
    }[];
    tour_sessions?: {
        session_date: string;
        start_time: string;
        end_time?: string;
    }[];
    tour_policy?: ITourPolicy;
}

export interface IAdminTourDetail extends Omit<CreateTourDTO, "tour_category_ids" | "variants" | "images"> {
    id: number;
    tour_categories?: { id: number; name: string }[];
    variants?: IAdminTourVariant[];
    images?: { image_url: string; sort_no: number; is_cover: boolean }[];
    country?: { id: number; name: string };
    division?: { id: number; name_local: string };
    currency?: { id: number; name: string; symbol: string };
    supplier?: { id: number; name: string };
}

export interface IVisibilityReport {
    isVisiblePublic: boolean;
    title: string;
    checks: Record<string, boolean>;
    issues: string[];
}
