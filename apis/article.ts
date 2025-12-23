import fetchC from "@/libs/fetchC";
import { IArticlePopular } from "@/types/response/article";

const article = {
    popular: async (limit: number = 5): Promise<IArticlePopular[]> => {
        const url = `/user/article/popular?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    },
    create: async (data: { title: string; content: string; images?: { image_url: string }[]; tags?: string[]; tour_id?: number }, user_uuid: string) => {
        if (!user_uuid) throw new Error("User UUID is required");
        const url = `/user/article/create/${user_uuid}`;
        return await fetchC.post(url, data);
    },
}

export default article;

