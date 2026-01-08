import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminReviewApi = {
    getAll: async (params?: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        // Filter out undefined/null values before creating query string
        const filteredParams = params ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
        ) : {};
        const queryString = Object.keys(filteredParams).length > 0
            ? new URLSearchParams(filteredParams as Record<string, string>).toString()
            : "";
        const url = `/admin/review/getAll${queryString ? `?${queryString}` : ""}`;

        return fetchC.get(url, { headers: authHeaders.headers });
    },
    remove: async (id: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/review/remove/${id}`, {}, { headers: authHeaders.headers });
    },
    updateStatus: async (id: number, status: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/review/updateStatus/${id}`, { status }, { headers: authHeaders.headers });
    },
    toggleVisibility: async (id: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/review/toggleVisibility/${id}`, {}, { headers: authHeaders.headers });
    },
    getStats: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/review/stats", { headers: authHeaders.headers });
    }
};
