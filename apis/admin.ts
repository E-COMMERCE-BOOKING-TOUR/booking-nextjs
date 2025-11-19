import fetchC from "@/libs/fetchC";

const adminApi = {
    getNotifications: async () => {
        const url = "/notification/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getBooking: async () => {
        const url = "/booking/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getTour: async () => {
        const url = "/tour/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getAllUser: async () => {
        const url = "/user/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getAllArticle: async () => {
        const url = "/article/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },

    getAllReview: async () => {
        const url = "/review/getAll";
        const data = await fetchC.get(url, { cache: "no-store" });
        return Array.isArray(data) ? data : [];
    },
}

export { adminApi }