import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminDashboardApi = {
    getStats: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/dashboard/stats", {
            headers: authHeaders.headers,
            cache: "no-store"
        });
    },
};
