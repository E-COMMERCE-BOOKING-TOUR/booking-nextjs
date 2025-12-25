import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";
import { ICurrency } from "@/types/response/base.type";

export interface CreateCurrencyDTO {
    name: string;
    symbol: string;
}

export interface UpdateCurrencyDTO {
    name?: string;
    symbol?: string;
}

export const adminCurrencyApi = {
    getAll: async (token?: string): Promise<ICurrency[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const data = await fetchC.get("/admin/currency/getAll", { headers: authHeaders.headers });
        return Array.isArray(data) ? data : [];
    },

    create: async (dto: CreateCurrencyDTO, token?: string): Promise<ICurrency> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/currency/create", dto, { headers: authHeaders.headers });
    },

    update: async (id: number, dto: UpdateCurrencyDTO, token?: string): Promise<ICurrency> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/currency/update/${id}`, dto, { headers: authHeaders.headers });
    },

    remove: async (id: number, token?: string): Promise<void> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/currency/remove/${id}`, { headers: authHeaders.headers });
    },
};
