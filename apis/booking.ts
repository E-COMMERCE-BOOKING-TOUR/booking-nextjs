import fetchC from "@/libs/fetchC";
import { IBaseResponseData } from "@/types/base.type";
import { IBookingDetail, IConfirmBooking } from "@/types/booking";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export type CreateBookingDTO = {
    startDate: string;
    pax: { paxTypeId: number; quantity: number }[];
    variantId?: number;
};

export const bookingApi = {
    create: async (dto: CreateBookingDTO, token?: string) => {
        const url = "/user/booking/create";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.post(url, dto, { headers: authHeaders.headers });
        return res;
    },
    getDetail: async (id: number, token?: string) => {
        const url = `/user/booking/${id}`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers }) as IBookingDetail;
        return res;
    },
    confirm: async (dto: IConfirmBooking, token?: string) => {
        const url = "/user/booking/confirm";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.post(url, dto, { headers: authHeaders.headers });
        return res;
    },
};

export default bookingApi;
