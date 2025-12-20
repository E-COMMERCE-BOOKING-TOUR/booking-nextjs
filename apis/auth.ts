import fetchC from "@/libs/fetchC";
import { ICreateRegister } from "@/types/auth.type";
import { IResponseAuth } from "@/types/response/auth.type";

const authApi = {
    login: async (username: string, password: string) => {
        const url = "/auth/login";
        const res: IResponseAuth = await fetchC.post(url, {
            username, password
        }, {
            cache: "no-store"
        });
        return res;
    },
    register: async ({ email, username, password }: ICreateRegister) => {
        const url = "/auth/register";
        const res: IResponseAuth = await fetchC.post(url, {
            email: email,
            username: username,
            password: password,
            password_confirmation: password
        }, {
            cache: "no-store"
        });
        return res;
    },
    refresh: async (refreshToken: string) => {
        const url = "/auth/refresh";
        const res: IResponseAuth = await fetchC.post(url, {}, {
            cache: "no-store",
            headers: {
                "Authorization": "Bearer " + refreshToken
            }
        });
        return res;
    }
}

export default authApi;