import fetchC from "@/libs/fetchC";
import { IResponseAuthLogout, IUserAuth } from "@/types/response/auth.type";

const userApi = {
    signOut: async (token: string) => {
        const url = "/auth/logout";
        const res: IResponseAuthLogout = await fetchC.post(url, {}, {
            cache: "no-store",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return res;
    },
    info: async (token: string) => {
        const url = "/auth/me";
        const res: IUserAuth = await fetchC.get(url, {
            cache: "no-store",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "content-type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return res;
    },
}

export { userApi }