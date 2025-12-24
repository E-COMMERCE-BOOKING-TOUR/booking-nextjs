import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminSupplierApi = {
    getAll: async (token?: string, page: number = 1, limit: number = 10) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/supplier/getAll?page=${page}&limit=${limit}`, { headers: authHeaders.headers });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/supplier/getById/${id}`, { headers: authHeaders.headers });
    },
    create: async (data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/supplier/create", data, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/supplier/update/${id}`, data, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/supplier/remove/${id}`, { headers: authHeaders.headers });
    },
};
