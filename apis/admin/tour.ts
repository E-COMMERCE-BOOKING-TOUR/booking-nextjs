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
        // Note: fetchC.postFormData might handle headers differently or need specific content-type handling override
        // usually FormData sets its own Content-Type with boundary, so we might need to be careful not to override it if getAuthHeaders sets 'Content-Type': 'application/json'
        // But getAuthHeaders likely just returns Authorization. Let's assume it's safe or fetchC handles merging.
        return fetchC.postFormData("/admin/tour/upload", formData, { headers: authHeaders.headers });
    },
    create: async (data: any, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/create", data, { headers: authHeaders.headers });
    },

    // Variants
    addVariant: async (tourId: number, data: any, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/tour/addVariant/${tourId}`, data, { headers: authHeaders.headers });
    },
    setVariantPaxTypePrice: async (data: { tour_variant_id: number, pax_type_id: number, price: number }, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/setVariantPaxTypePrice", data, { headers: authHeaders.headers });
    },

    // Sessions
    bulkAddSessions: async (sessions: any[], token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/bulkAddSessions", sessions, { headers: authHeaders.headers });
    }
};