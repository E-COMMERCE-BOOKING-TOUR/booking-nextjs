import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminUserApi = {
    getAll: async (token?: string, page: number = 1, limit: number = 10, search?: string, roleId?: string, supplierId?: string, status?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (roleId && roleId !== 'all') params.append('role_id', roleId);
        if (supplierId && supplierId !== 'all') params.append('supplier_id', supplierId);
        if (status && status !== 'all') params.append('status', status);

        return fetchC.get(`/admin/user/getAll?${params.toString()}`, { headers: authHeaders.headers });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/user/getById/${id}`, { headers: authHeaders.headers });
    },
    create: async (data: Record<string, unknown>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/user/create", data, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: Record<string, unknown>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/user/update/${id}`, data, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/user/remove/${id}`, { headers: authHeaders.headers });
    },
};
