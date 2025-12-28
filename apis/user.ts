import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";
import { IResponseAuthLogout, IUserAuth } from "@/types/response/auth.type";

export interface IAddCardResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

const userApi = {
    signOut: async (token?: string) => {
        const url = "/auth/logout";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res: IResponseAuthLogout = await fetchC.post(url, {}, {
            cache: "no-store",
            headers: authHeaders.headers
        });
        return res;
    },
    info: async (token?: string) => {
        const url = "/auth/me";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res: IUserAuth = await fetchC.get(url, {
            cache: "no-store",
            headers: {
                ...authHeaders.headers,
                "X-Requested-With": "XMLHttpRequest",
                "content-type": "application/json",
            }
        });
        return res;
    },
    addCard: async (token: string, authToken: string): Promise<IAddCardResponse> => {
        const url = "/user/payment/card";
        const authHeaders = await getAuthHeaders(authToken);
        if (!authHeaders.ok) {
            return { success: false, message: authHeaders.message };
        }
        try {
            const res = await fetchC.post(url, { token }, { headers: authHeaders.headers });
            return { success: true, message: res.message || "Card added successfully" };
        } catch (error) {
            return {
                success: false,
                message: (error as Error)?.message || "Failed to add card"
            };
        }
    },
    updateProfile: async (token: string, data: Record<string, unknown>) => {
        const url = "/user/update-me";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.post(url, { data }, {
            headers: authHeaders.headers
        });
        return res;
    },
    changePassword: async (token: string, data: Record<string, unknown>) => {
        const url = "/user/change-password";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.post(url, { data }, {
            headers: authHeaders.headers
        });
        return res;
    },
    getById: async (id: number) => {
        const url = "/user/getById";
        const res = await fetchC.post(url, { id });
        return res;
    },
    follow: async (token: string, id: number) => {
        const url = `/user/follow/${id}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, {
            headers: authHeaders.headers
        });
    },
    unfollow: async (token: string, id: number) => {
        const url = `/user/unfollow/${id}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.post(url, {}, {
            headers: authHeaders.headers
        });
    },
    getFollowing: async (token: string) => {
        const url = "/user/following";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return await fetchC.get(url, {
            headers: authHeaders.headers
        });
    },
    getFollowersById: async (id: number) => {
        const url = `/user/followers/${id}`;
        return await fetchC.get(url);
    },
    getFollowingById: async (id: number) => {
        const url = `/user/following/${id}`;
        return await fetchC.get(url);
    },
    getByUuid: async (uuid: string) => {
        const url = `/user/getByUuid/${uuid}`;
        return await fetchC.get(url);
    },
    getArticlesByUuid: async (uuid: string) => {
        const url = `/user/article/by-user/${uuid}`;
        return await fetchC.get(url);
    }
};
export { userApi }