import fetchC from "@/libs/fetchC";
import { IArticlePopular } from "@/types/response/article";

const article = {
    popular: async (limit: number = 10): Promise<IArticlePopular[]> => {
        const url = `/user/article/popular?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    }
}

export default article;

