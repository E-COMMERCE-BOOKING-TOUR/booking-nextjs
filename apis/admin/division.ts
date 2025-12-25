import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";
import { ICountry, IDivision } from "@/types/response/base.type";

export interface CreateDivisionDTO {
    name: string;
    name_local: string;
    level?: number;
    code?: string;
    country_id: number;
    parent_id?: number | null;
}

export interface UpdateDivisionDTO {
    name?: string;
    name_local?: string;
    level?: number;
    code?: string;
    country_id?: number;
    parent_id?: number | null;
}

export const adminDivisionApi = {
    getAll: async (token?: string): Promise<IDivision[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const data = await fetchC.get("/admin/division/getAll", { headers: authHeaders.headers });
        return Array.isArray(data) ? data : [];
    },

    getByCountry: async (countryId: number, token?: string): Promise<IDivision[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const data = await fetchC.get(`/admin/division/getByCountry/${countryId}`, { headers: authHeaders.headers });
        return Array.isArray(data) ? data : [];
    },

    getCountries: async (token?: string): Promise<ICountry[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const data = await fetchC.get("/admin/division/countries", { headers: authHeaders.headers });
        return Array.isArray(data) ? data : [];
    },

    create: async (dto: CreateDivisionDTO, token?: string): Promise<IDivision> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/division/create", dto, { headers: authHeaders.headers });
    },

    update: async (id: number, dto: UpdateDivisionDTO, token?: string): Promise<IDivision> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/division/update/${id}`, dto, { headers: authHeaders.headers });
    },

    remove: async (id: number, token?: string): Promise<void> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/division/remove/${id}`, { headers: authHeaders.headers });
    },
};
