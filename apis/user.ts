import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";
import { IResponseAuthLogout, IUserAuth } from "@/types/response/auth.type";

export interface IAddCardResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

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
        const res = await fetchC.post(url, { data }, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return res;
    },
    changePassword: async (token: string, data: Record<string, unknown>) => {
        const url = "/user/change-password";
        const res = await fetchC.post(url, { data }, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return res;
    },
};
export { userApi }