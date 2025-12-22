import fetchC from "@/libs/fetchC";
import { ITour } from "@/types/response/tour.type";
import { ITourPopular, ITourSearchResponse } from "@/types/response/tour";
import { IReview } from "@/types/response/review.type";
import { ITourCategory } from "@/types/response/tour.type";

export interface ITourSession {
    id: number;
    date: string;
    start_time?: string;
    end_time?: string;
    status: 'open' | 'full' | 'closed';
    capacity_available: number;
    price: number;
}

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



export const tourApi = {
    popular: async (limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/popular?limit=${limit}`;
        const res = await fetchC.get(url, { cache: 'no-store' });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    detail: async (slug: string): Promise<ITour> => {
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
    reviews: async (slug: string): Promise<IReview[]> => {
        const url = `/user/tour/${slug}/reviews`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    reviewCategories: async (slug: string): Promise<ITourCategory[]> => {
        const url = `/user/tour/${slug}/review-categories`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    related: async (slug: string, limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/${slug}/related?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getPrices: async (slug: string): Promise<unknown[]> => {
        const url = `/user/tour/${slug}/get-prices`;
        const res = await fetchC.get(url, { cache: 'no-store' });
        return res;
    },
    getSessions: async (slug: string, variantId: number, startDate?: string, endDate?: string): Promise<ITourSession[]> => {
        const query = new URLSearchParams({
            variant_id: variantId.toString(),
        });
        if (startDate) query.append('start_date', startDate);
        if (endDate) query.append('end_date', endDate);

        const url = `/user/tour/${slug}/sessions?${query.toString()}`;
        const res = await fetchC.get(url, { cache: 'no-store' });
        return Array.isArray(res) ? res : (res?.data || []);
    }
};

export default tourApi;
