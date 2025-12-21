import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export const adminBookingApi = {
    getAll: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/booking/getAll", { headers: authHeaders.headers });
    },
    getById: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/booking/getById/${id}`, {}, { headers: authHeaders.headers });
    },
    confirm: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/booking/confirm/${id}`, {}, { headers: authHeaders.headers });
    },
    cancel: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/booking/cancel/${id}`, {}, { headers: authHeaders.headers });
    },
    updatePaymentStatus: async (id: number | string, status: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/booking/updatePaymentStatus/${id}`, { payment_status: status }, { headers: authHeaders.headers });
    },
    remove: async (id: number | string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.delete(`/admin/booking/remove/${id}`, { headers: authHeaders.headers });
    },
};
