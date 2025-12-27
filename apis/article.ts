import fetchC from "@/libs/fetchC";
import { IArticlePopular } from "@/types/response/article";

const article = {
    popular: async (limit: number = 5): Promise<IArticlePopular[]> => {
        const url = `/user/article/popular?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    create: async (data: { title: string; content: string; images?: { image_url: string }[]; tags?: string[]; tour_id?: number }) => {
        const url = `/user/article/create`;
        return await fetchC.post(url, data);
    },
    getList: async (): Promise<IArticlePopular[]> => {
        const url = `/user/article/list`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getByTag: async (tag: string, limit: number = 10): Promise<IArticlePopular[]> => {
        const url = `/user/article/tag/${tag}?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getMyArticles: async (token: string): Promise<IArticlePopular[]> => {
        const url = `/user/article/mine`;
        const res = await fetchC.get(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getLikedArticles: async (token: string): Promise<IArticlePopular[]> => {
        const url = `/user/article/liked`;
        const res = await fetchC.get(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getTrendingTags: async (limit: number = 4): Promise<{ _id: string; count: number }[]> => {
        const url = `/user/article/trending-tags?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    addComment: async (articleId: string, content: string, token: string, parentId?: string | number) => {
        const url = `/user/article/comment`;
        return await fetchC.post(url, { articleId, content, parentId }, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    },
}

export default article;

