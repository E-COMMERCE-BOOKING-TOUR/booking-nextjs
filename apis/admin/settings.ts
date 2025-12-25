import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export interface SiteSettings {
    id: number;
    site_title: string;
    meta_description: string | null;
    meta_keywords: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    banners_square: string[] | null;
    banners_rectangle: string[] | null;
    company_name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    youtube_url: string | null;
    footer_description: string | null;
    copyright_text: string | null;
}

export interface UpdateSiteSettingsDTO {
    site_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    logo_url?: string;
    favicon_url?: string;
    banners_square?: string[];
    banners_rectangle?: string[];
    company_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    footer_description?: string;
    copyright_text?: string;
}

export const adminSettingsApi = {
    get: async (token?: string): Promise<SiteSettings> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/settings", { headers: authHeaders.headers });
    },

    update: async (dto: UpdateSiteSettingsDTO, token?: string): Promise<SiteSettings> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put("/admin/settings", dto, { headers: authHeaders.headers });
    },

    uploadMedia: async (file: File, token?: string): Promise<{ url: string; filename: string }> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const formData = new FormData();
        formData.append('file', file);

        return fetchC.postFormData("/admin/settings/upload", formData, { headers: authHeaders.headers });
    },
};
