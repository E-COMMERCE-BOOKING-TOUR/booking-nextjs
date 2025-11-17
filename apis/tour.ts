import fetchC from "@/libs/fetchC";
import { IBaseResponseData } from "@/types/base.type";
import { ITourLatest, ITourPopular } from "@/types/response/tour";

const tour = {
    latest: async (): Promise<IBaseResponseData<ITourLatest>> => {
        const url = "/tour/latest";
        const res: IBaseResponseData<ITourLatest> = await fetchC.get(url);
        return res;
    },
    popular: async (limit: number = 8): Promise<ITourPopular[]> => {
        const url = `/user/tour/popular?limit=${limit}`;
        const res = await fetchC.get(url);
        return Array.isArray(res) ? res : (res?.data || []);
    }
}

export default tour;