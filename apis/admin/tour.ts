import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";
import { CreateTourDTO, AdminTourSearchParams, IAdminTour, ICountry, IDivision, ICurrency, IAdminTourDetail, ITourPolicy } from "@/types/admin/tour.dto";

export const adminTourApi = {
    // Metadata
    getCountries: async (token?: string): Promise<ICountry[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/metadata/countries", { headers: authHeaders.headers });
    },
    getCurrencies: async (token?: string): Promise<ICurrency[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/metadata/currencies", { headers: authHeaders.headers });
    },
    getDivisions: async (countryId: number, token?: string): Promise<IDivision[]> => {
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
    create: async (data: CreateTourDTO, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/create", data, { headers: authHeaders.headers });
    },
    getAll: async (params?: AdminTourSearchParams, token?: string): Promise<{ data: IAdminTour[], total: number, page: number, limit: number, totalPages: number }> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/tour/getAll", {
            headers: authHeaders.headers,
            params: params,
        });
    },
    getById: async (id: number | string, token?: string): Promise<IAdminTourDetail> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/tour/getById/${id}`, { headers: authHeaders.headers });
    },
    update: async (id: number | string, data: Partial<CreateTourDTO>, token?: string) => {
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
    getVisibilityReport: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/tour/visibility-check/${id}`, { headers: authHeaders.headers });
    },

    // Policy Management
    getPoliciesBySupplier: async (supplierId: number, token?: string): Promise<ITourPolicy[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/tour/policies/${supplierId}`, { headers: authHeaders.headers });
    },
    createPolicy: async (data: ITourPolicy, token?: string): Promise<ITourPolicy> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post("/admin/tour/policy", data, { headers: authHeaders.headers });
    },
    updatePolicy: async (id: number, data: Partial<ITourPolicy>, token?: string): Promise<ITourPolicy> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.put(`/admin/tour/policy/${id}`, data, { headers: authHeaders.headers });
    },
    removePolicy: async (id: number, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/tour/policy/${id}`, { headers: authHeaders.headers });
    },
};