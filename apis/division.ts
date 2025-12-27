import fetchC from "@/libs/fetchC";
import { IDivisionTrending } from "@/types/response/division";

const division = {
    trending: async (limit: number = 6): Promise<IDivisionTrending[]> => {
        const url = `/user/division/trending?limit=${limit}`;
        const res = await fetchC.get(url, { next: { revalidate: 3600 } });
        return Array.isArray(res) ? res : (res?.data || []);
    }
}

export default division;

