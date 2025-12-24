import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminPermissionApi = {
    getAll: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/permission/getAll", { headers: authHeaders.headers });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/permission/getById/${id}`, { headers: authHeaders.headers });
    },
    create: async (data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/permission/create", data, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: Record<string, any>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/permission/update/${id}`, data, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/permission/remove/${id}`, { headers: authHeaders.headers });
    },
};
