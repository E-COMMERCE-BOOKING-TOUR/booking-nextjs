import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminTourApi = {
    // Metadata
    getCountries: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/metadata/countries", { headers: authHeaders.headers });
    },
    getCurrencies: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/metadata/currencies", { headers: authHeaders.headers });
    },
    getDivisions: async (countryId: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/tour/metadata/divisions/${countryId}`, { headers: authHeaders.headers });
    },

    // Tour Management
    uploadImage: async (formData: FormData, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.postFormData("/admin/tour/upload", formData, { headers: authHeaders.headers });
    },
    create: async (data: any, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/create", data, { headers: authHeaders.headers });
    },
    getAll: async (params?: { keyword?: string, status?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string }, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/getAll", {
            headers: authHeaders.headers,
            params: params as any
        });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/tour/getById/${id}`, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: any, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/tour/update/${id}`, data, { headers: authHeaders.headers });
    },
    updateStatus: async (id: number | string, status: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.patch(`/admin/tour/status/${id}`, { status }, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/tour/remove/${id}`, { headers: authHeaders.headers });
    },
};