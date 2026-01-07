import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";
import { ICountry, IDivision } from "@/types/response/base.type";

export interface CreateDivisionDTO {
    name: string;
    name_local: string;
    level?: number;
    code?: string;
    image_url?: string;
    country_id: number;
    parent_id?: number | null;
}

export interface UpdateDivisionDTO {
    name?: string;
    name_local?: string;
    level?: number;
    code?: string;
    image_url?: string;
    country_id?: number;
    parent_id?: number | null;
}

export interface DivisionQueryParams {
    page?: number;
    limit?: number;
    keyword?: string;
    country_id?: number;
    parent_id?: number | null;
}

export interface PaginatedDivisionsResponse {
    data: IDivision[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const adminDivisionApi = {
    getAll: async (params: DivisionQueryParams = {}, token?: string): Promise<PaginatedDivisionsResponse> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.keyword) searchParams.set('keyword', params.keyword);
        if (params.country_id) searchParams.set('country_id', params.country_id.toString());
        if (params.parent_id !== undefined) searchParams.set('parent_id', params.parent_id === null ? '0' : params.parent_id.toString());

        const url = `/admin/division/getAll${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const data = await fetchC.get(url, { headers: authHeaders.headers });

        // Handle both old array format and new paginated format
        if (Array.isArray(data)) {
            return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
        }
        return data as PaginatedDivisionsResponse;
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

    uploadImage: async (id: number, file: File, token?: string): Promise<{ image_url: string }> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/division/${id}/upload-image`, {
            method: 'POST',
            headers: {
                ...authHeaders.headers,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return response.json();
    },

    upload: async (file: File, token?: string): Promise<{ image_url: string }> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/division/upload`, {
            method: 'POST',
            headers: {
                ...authHeaders.headers,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return response.json();
    },
};
