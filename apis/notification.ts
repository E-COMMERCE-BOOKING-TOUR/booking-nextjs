import fetchC from "@/libs/fetchC";
import { IPaginatedNotifications } from "@/types/notification";

const notificationApi = {
    getMe: async (token: string, page: number = 1, limit: number = 10): Promise<{ ok: boolean; data?: IPaginatedNotifications; error?: string }> => {
        const url = `/notification/me?page=${page}&limit=${limit}`;
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
    }
}

export default notificationApi;
