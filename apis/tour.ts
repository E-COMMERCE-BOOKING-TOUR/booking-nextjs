import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";
import { ITour } from "@/types/response/tour.type";
import { ITourPopular, ITourSearchResponse } from "@/types/response/tour";
export type { ITourPopular, ITourSearchResponse };
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

    if (params.country_ids?.length) {
        query.country_ids = params.country_ids.join(',');
    }

    if (params.division_ids?.length) {
        query.division_ids = params.division_ids.join(',');
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

    if (params.startDate) {
        query.startDate = params.startDate;
    }

    if (params.endDate) {
        query.endDate = params.endDate;
    }

    if (typeof params.travelers === 'number') {
        query.travelers = params.travelers.toString();
    }

    if (typeof params.adults === 'number') {
        query.adults = params.adults.toString();
    }

    if (typeof params.seniors === 'number') {
        query.seniors = params.seniors.toString();
    }

    if (typeof params.youth === 'number') {
        query.youth = params.youth.toString();
    }

    if (typeof params.children === 'number') {
        query.children = params.children.toString();
    }

    if (typeof params.infants === 'number') {
        query.infants = params.infants.toString();
    }

    if (typeof params.rooms === 'number') {
        query.rooms = params.rooms.toString();
    }

    return Object.keys(query).length ? query : undefined;
};



export const tourApi = {
    popular: async (limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/popular?limit=${limit}`;
        const res = await fetchC.get(url, { next: { revalidate: 3600 } });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    detail: async (slug: string, guestId?: string, token?: string): Promise<ITour> => {
        let headers = {};
        if (token) {
            const authHeaders = await getAuthHeaders(token);
            if (authHeaders.ok) headers = authHeaders.headers;
        }
        const url = `/user/tour/${slug}${guestId ? `?guest_id=${guestId}` : ''}`;
        const res = await fetchC.get(url, { headers });
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
    reviews: async (): Promise<IReview[]> => {
        // Legacy support or fallback
        return [];
    },
    getReviewsByTourId: async (tourId: number, token?: string) => {
        let headers = {};
        if (token) {
            const authHeaders = await getAuthHeaders(token);
            if (authHeaders.ok) headers = authHeaders.headers;
        }
        const url = `/user/review/tour/${tourId}`;
        const res = await fetchC.get(url, { headers });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    createReview: async (data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post('/user/review/create', data, { headers: authHeaders.headers });
    },
    createReviewFormData: async (formData: FormData, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.postFormData('/user/review/create', formData, { headers: authHeaders.headers });
    },
    markReviewHelpful: async (id: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/user/review/helpful/${id}`, {}, { headers: authHeaders.headers });
    },
    reportReview: async (id: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/user/review/report/${id}`, {}, { headers: authHeaders.headers });
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
    },
    recommended: async (guestId?: string, token?: string): Promise<ITourPopular[]> => {
        let headers = {};
        if (token) {
            const authHeaders = await getAuthHeaders(token);
            if (authHeaders.ok) headers = authHeaders.headers;
        }
        const url = `/user/tour/recommend/list${guestId ? `?guest_id=${guestId}` : ''}`;
        const res = await fetchC.get(url, { headers, cache: 'no-store' });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    toggleFavorite: async (tourId: number, guestId?: string, token?: string) => {
        let headers = {};
        if (token) {
            const authHeaders = await getAuthHeaders(token);
            if (authHeaders.ok) headers = authHeaders.headers;
        }
        const url = `/user/tour/favorite/toggle`;
        return fetchC.post(url, { tour_id: tourId, guest_id: guestId }, { headers });
    }
};

export default tourApi;
