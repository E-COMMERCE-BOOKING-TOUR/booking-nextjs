import fetchC from "@/libs/fetchC";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

import { IDashboardStats } from "@/types/admin/dashboard";

export interface ExportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
}

export const adminDashboardApi = {
    getStats: async (token?: string): Promise<IDashboardStats> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get("/admin/dashboard/stats", {
            headers: authHeaders.headers,
            cache: "no-store"
        });
    },

    exportBookings: async (token?: string, filters?: ExportFilters): Promise<any[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.status) params.append('status', filters.status);
        const queryString = params.toString();
        return fetchC.get(`/admin/dashboard/export/bookings${queryString ? `?${queryString}` : ''}`, {
            headers: authHeaders.headers,
            cache: "no-store"
        });
    },

    exportTours: async (token?: string, filters?: ExportFilters): Promise<any[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        const queryString = params.toString();
        return fetchC.get(`/admin/dashboard/export/tours${queryString ? `?${queryString}` : ''}`, {
            headers: authHeaders.headers,
            cache: "no-store"
        });
    },

    exportRevenue: async (token?: string, filters?: ExportFilters): Promise<any[]> => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        const queryString = params.toString();
        return fetchC.get(`/admin/dashboard/export/revenue${queryString ? `?${queryString}` : ''}`, {
            headers: authHeaders.headers,
            cache: "no-store"
        });
    },
};
