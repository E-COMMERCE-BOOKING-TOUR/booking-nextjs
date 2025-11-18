import fetchC from "@/libs/fetchC";
import { IBaseResponseData } from "@/types/base.type";
import { ITourLatest, ITourPopular, ITourDetail, ITourReview, ITourReviewCategory, IRelatedTour } from "@/types/response/tour";

const tour = {
    latest: async (): Promise<IBaseResponseData<ITourLatest>> => {
        const url = "/tour/latest";
        const res: IBaseResponseData<ITourLatest> = await fetchC.get(url);
        return res;
    },
    popular: async (limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/popular?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    detail: async (slug: string): Promise<ITourDetail> => {
        const url = `/user/tour/${slug}`;
        const res = await fetchC.get(url);
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
    }
}

export default tour;