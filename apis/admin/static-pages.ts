import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export interface StaticPage {
    // ... existing interface ...
    id: number;
    title: string;
    slug: string;
    content: string | null;
    meta_title: string | null;
    meta_description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateStaticPageDTO {
    title: string;
    slug: string;
    content?: string;
    meta_title?: string;
    meta_description?: string;
    is_active?: boolean;
}

export interface UpdateStaticPageDTO extends Partial<CreateStaticPageDTO> { }

export const adminStaticPagesApi = {
    getAll: async (token?: string): Promise<StaticPage[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/static-pages", {
            headers: authHeaders.headers,
        });
    },

    getOne: async (id: number, token?: string): Promise<StaticPage> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/static-pages/${id}`, {
            headers: authHeaders.headers,
        });
    },

    create: async (data: CreateStaticPageDTO, token?: string): Promise<StaticPage> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/static-pages", data, {
            headers: authHeaders.headers,
        });
    },

    update: async (id: number, data: UpdateStaticPageDTO, token?: string): Promise<StaticPage> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/static-pages/${id}`, data, {
            headers: authHeaders.headers,
        });
    },

    remove: async (id: number, token?: string): Promise<void> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/static-pages/${id}`, {
            headers: authHeaders.headers,
        });
    },
};
