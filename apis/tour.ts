import fetchC from "@/libs/fetchC";
import { ITour } from "@/types/response/tour.type";
import { IBaseResponseData } from "@/types/base.type";
import { ITourLatest, ITourPopular, ITourDetail, ITourReview, ITourReviewCategory, IRelatedTour, ITourSearchResponse, ITourPrice } from "@/types/response/tour";

export type ITourSearchParams = {
    keyword?: string;
    destinations?: string[];
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    limit?: number;
    offset?: number;
    sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
};

const toQueryRecord = (params?: ITourSearchParams): Record<string, string> | undefined => {
    if (!params) {
        return undefined;
    }

    const query: Record<string, string> = {};

    if (params.keyword) {
        query.keyword = params.keyword;
    }

    if (params.destinations?.length) {
        query.destinations = params.destinations.join(',');
    }

    if (params.tags?.length) {
        query.tags = params.tags.join(',');
    }

    if (typeof params.minPrice === 'number') {
        query.minPrice = params.minPrice.toString();
    }

    if (typeof params.maxPrice === 'number') {
        query.maxPrice = params.maxPrice.toString();
    }

    if (typeof params.minRating === 'number') {
        query.minRating = params.minRating.toString();
    }

    if (typeof params.limit === 'number') {
        query.limit = params.limit.toString();
    }

    if (typeof params.offset === 'number') {
        query.offset = params.offset.toString();
    }

    if (params.sort) {
        query.sort = params.sort;
    }

    return Object.keys(query).length ? query : undefined;
};

type CreateTourDTO = {
    title: string;
    description: string;
    summary: string;
    map_url?: string | null;
    slug: string;
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

export const tourApi = {
    create: async (dto: CreateTourDTO) => {
        const url = "/tour/create";
        const res: ITour = await fetchC.post(url, dto, { cache: "no-store" });
        return res;
    },
};

const tour = {
    latest: async (): Promise<IBaseResponseData<ITourLatest>> => {
        const url = "/tour/latest";
        const res: IBaseResponseData<ITourLatest> = await fetchC.get(url);
        return res;
    },
    popular: async (limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/popular?limit=${limit}`;
        const res = await fetchC.get(url, { cache: 'no-store' });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    detail: async (slug: string): Promise<ITourDetail> => {
        const url = `/user/tour/${slug}`;
        const res = await fetchC.get(url);
        return res;
    },
    search: async (params?: ITourSearchParams): Promise<ITourSearchResponse> => {
        const url = `/user/tour/search/list`;
        const res = await fetchC.get(url, {
            params: toQueryRecord(params),
            BaseURL: process.env.NEXT_PUBLIC_API_BACKEND,
        });
        return res;
    },
    reviews: async (slug: string): Promise<ITourReview[]> => {
        const url = `/user/tour/${slug}/reviews`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    reviewCategories: async (slug: string): Promise<ITourReviewCategory[]> => {
        const url = `/user/tour/${slug}/review-categories`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    related: async (slug: string, limit: number = 8): Promise<IRelatedTour[]> => {
        const url = `/user/tour/${slug}/related?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getPrices: async (slug: string): Promise<ITourPrice[]> => {
        const url = `/user/tour/${slug}/get-prices`;
        const res = await fetchC.get(url, { cache: 'no-store' });
        return res;
    }
}

export default tour;
export type { CreateTourDTO };
