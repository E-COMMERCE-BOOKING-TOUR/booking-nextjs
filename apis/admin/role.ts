import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminRoleApi = {
    getAll: async (token?: string, page: number = 1, limit: number = 10) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/role/getAll?page=${page}&limit=${limit}`, { headers: authHeaders.headers });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/role/getById/${id}`, { headers: authHeaders.headers });
    },
    create: async (data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/role/create", data, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/role/update/${id}`, data, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/role/remove/${id}`, { headers: authHeaders.headers });
    },
};
