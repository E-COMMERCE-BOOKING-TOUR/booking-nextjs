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

