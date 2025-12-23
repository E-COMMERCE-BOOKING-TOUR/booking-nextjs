import fetchC from "@/libs/fetchC";
import { INotification, IPaginatedNotifications } from "@/types/notification";

const adminNotificationApi = {
    getAll: async (token: string, page: number = 1, limit: number = 10, search?: string, type?: string, targetGroup?: string): Promise<{ ok: boolean; data?: IPaginatedNotifications; error?: string }> => {
        let url = `/admin/notification?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        if (targetGroup) url += `&targetGroup=${encodeURIComponent(targetGroup)}`;
        try {
            const res = await fetchC.get(url, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            return { ok: true, data: res as IPaginatedNotifications };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to fetch notifications"
            };
        }
    },

    getById: async (token: string, id: number): Promise<{ ok: boolean; data?: INotification; error?: string }> => {
        const url = `/admin/notification/${id}`;
        try {
            const res = await fetchC.get(url, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            return { ok: true, data: res as INotification };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to fetch notification detail"
            };
        }
    },

    create: async (token: string, data: Partial<INotification>): Promise<{ ok: boolean; data?: INotification; error?: string }> => {
        const url = `/admin/notification`;
        try {
            const res = await fetchC.post(url, data, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            return { ok: true, data: res as INotification };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to create notification"
            };
        }
    },

    update: async (token: string, id: number, data: Partial<INotification>): Promise<{ ok: boolean; data?: INotification; error?: string }> => {
        const url = `/admin/notification/${id}`;
        try {
            const res = await fetchC.put(url, data, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            return { ok: true, data: res as INotification };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to update notification"
            };
        }
    },

    delete: async (token: string, id: number): Promise<{ ok: boolean; error?: string }> => {
        const url = `/admin/notification/${id}`;
        try {
            await fetchC.delete(url, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to delete notification"
            };
        }
    }
}

export default adminNotificationApi;
