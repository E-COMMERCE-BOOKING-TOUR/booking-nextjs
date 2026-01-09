import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";
import { IArticlePopular } from "@/types/response/article";

const article = {
    popular: async (limit: number = 5, page: number = 1): Promise<IArticlePopular[]> => {
        const url = `/user/article/popular?limit=${limit}&page=${page}`;
        const res = await fetchC.get(url, { next: { revalidate: 1800 } }); // 30min
        return Array.isArray(res) ? res : (res?.data || []);
    },
    create: async (data: { title: string; content: string; images?: { image_url: string }[]; tags?: string[]; tour_id?: number; weather?: string }, token?: string) => {
        const url = `/user/article/create`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, data, { headers: authHeaders.headers });
    },
    getList: async (): Promise<IArticlePopular[]> => {
        const url = `/user/article/list`;
        const res = await fetchC.get(url, { next: { revalidate: 1800 } }); // 30min
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getByTag: async (tag: string, limit: number = 10, page: number = 1): Promise<IArticlePopular[]> => {
        const url = `/user/article/tag/${tag}?limit=${limit}&page=${page}`;
        const res = await fetchC.get(url, { next: { revalidate: 1800 } }); // 30min
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getMyArticles: async (token?: string): Promise<IArticlePopular[]> => {
        const url = `/user/article/mine`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getLikedArticles: async (token?: string): Promise<IArticlePopular[]> => {
        const url = `/user/article/liked`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    getTrendingTags: async (limit: number = 4): Promise<{ _id: string; count: number }[]> => {
        const url = `/user/article/trending-tags?limit=${limit}`;
        const res = await fetchC.get(url, { next: { revalidate: 3600 } }); // 1h
        return Array.isArray(res) ? res : (res?.data || []);
    },
    addComment: async (articleId: string, content: string, token?: string, parentId?: string | number) => {
        const url = `/user/article/comment`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, { articleId, content, parentId }, { headers: authHeaders.headers });
    },
    following: async (token?: string, limit: number = 10, page: number = 1): Promise<IArticlePopular[]> => {
        const url = `/user/article/following?limit=${limit}&page=${page}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers });
        return Array.isArray(res) ? res : (res?.data || []);
    },
    like: async (articleId: string, token?: string) => {
        const url = `/user/article/like/${articleId}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, { headers: authHeaders.headers });
    },
    unlike: async (articleId: string, token?: string) => {
        const url = `/user/article/unlike/${articleId}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, { headers: authHeaders.headers });
    },
    report: async (articleId: string, reason: string, token?: string) => {
        const url = `/user/article/report`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, { articleId, reason }, { headers: authHeaders.headers });
    },
    bookmark: async (articleId: string, token?: string) => {
        const url = `/user/article/bookmark/${articleId}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, { headers: authHeaders.headers });
    },
    unbookmark: async (articleId: string, token?: string) => {
        const url = `/user/article/unbookmark/${articleId}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, { headers: authHeaders.headers });
    },
    getBookmarked: async (token?: string, limit: number = 10, page: number = 1): Promise<IArticlePopular[]> => {
        const url = `/user/article/bookmarked?limit=${limit}&page=${page}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers });
        return Array.isArray(res) ? res : (res?.data || []);
    },
}

export default article;

