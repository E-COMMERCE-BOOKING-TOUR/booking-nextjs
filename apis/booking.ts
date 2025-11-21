import fetchC from "@/libs/fetchC";
import { IBaseResponseData } from "@/types/base.type";
import { IBookingDetail, IConfirmBooking } from "@/types/booking";

export type CreateBookingDTO = {
    startDate: string;
    pax: { paxTypeId: number; quantity: number }[];
    variantId?: number;
};

export const bookingApi = {
    create: async (dto: CreateBookingDTO, token?: string) => {
        const url = "/user/booking/create";
        const res = await fetchC.post(url, dto, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res;
    },
    getDetail: async (id: number, token?: string) => {
        const url = `/user/booking/${id}`;
        const res = await fetchC.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        }) as IBookingDetail;
        return res;
    },
    confirm: async (dto: IConfirmBooking, token?: string) => {
        const url = "/user/booking/confirm";
        const res = await fetchC.post(url, dto, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res;
    },
};

export default bookingApi;
