import fetchC from "@/libs/fetchC";

const adminApi = {
    getNotifications: async () => {
        const url = "/notification/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getAllArticle: async () => {
        const url = "/article/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getAllReview: async () => {
        const url = "/admin/review/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },
}

export { adminApi }