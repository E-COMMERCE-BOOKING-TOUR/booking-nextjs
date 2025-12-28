import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminArticleApi = {
    getArticles: async (params: { limit?: number; page?: number; search?: string; is_visible?: boolean }, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.is_visible !== undefined) queryParams.append('is_visible', params.is_visible.toString());

        return await fetchC.get(`/admin/social/articles?${queryParams.toString()}`, { headers: authHeaders.headers });
    },

    deleteArticle: async (id: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.delete(`/admin/social/articles/${id}`, { headers: authHeaders.headers });
    },

    toggleVisibility: async (id: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.patch(`/admin/social/articles/${id}/visibility`, {}, { headers: authHeaders.headers });
    },

    getStats: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.get('/admin/social/stats', { headers: authHeaders.headers });
    }
};
