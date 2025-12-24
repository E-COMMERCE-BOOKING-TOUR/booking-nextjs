import fetchC from "@/libs/fetchC";
import { IBookingDetail, IConfirmBooking, IPaymentMethod } from "@/types/booking";
import { getAuthHeaders } from "@/libs/auth/authHeaders";

export type CreateBookingDTO = {
    startDate: string;
    pax: { paxTypeId: number; quantity: number }[];
    variantId?: number;
    tourSessionId?: number;
};

export type UpdateContactDTO = {
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    passengers?: {
        full_name: string;
        phone_number?: string;
    }[];
};

export type UpdatePaymentDTO = {
    payment_method: string;
    booking_payment_id: number;
    payment_information_id?: number;
};

type BookingResult =
    | { ok: true; data: IBookingDetail }
    | { ok: false; error: string; redirectTo?: string };

type PaymentMethodsResult =
    | { ok: true; data: IPaymentMethod[] }
    | { ok: false; error: string; redirectTo?: string };

export const bookingApi = {
    create: async (dto: CreateBookingDTO, token?: string): Promise<IBookingDetail> => {
        const url = "/user/booking/create";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.post(url, dto, { headers: authHeaders.headers });
        return res;
    },
    getHistory: async (token?: string) => {
        const url = "/user/booking/history";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        const res = await fetchC.get(url, { headers: authHeaders.headers });
        return res as { id: number; title: string; image?: string }[];
    },
    getCurrent: async (token?: string): Promise<BookingResult> => {
        const url = "/user/booking/current";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message, redirectTo: "/user-login" }
        }
        try {
            const bookingInfo: IBookingDetail = await fetchC.get(url, { headers: authHeaders.headers, cache: 'no-store' });
            return {
                ok: true, data: bookingInfo
            };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to fetch booking"
            };
        }
    },
    updateContact: async (dto: UpdateContactDTO, token?: string): Promise<BookingResult> => {
        const url = "/user/booking/current/contact-info";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message, redirectTo: "/user-login" }
        }
        try {
            const res = await fetchC.post(url, dto, { headers: authHeaders.headers });
            return {
                ok: true, data: res
            };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to update contact"
            };
        }
    },
    updatePayment: async (dto: UpdatePaymentDTO, token?: string): Promise<BookingResult> => {
        const url = "/user/booking/current/payment-method";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message, redirectTo: "/user-login" }
        }
        try {
            const res = await fetchC.post(url, dto, { headers: authHeaders.headers });
            return {
                ok: true, data: res
            };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to update payment"
            };
        }
    },
    confirmCurrent: async (token?: string): Promise<BookingResult> => {
        const url = "/user/booking/current/confirm";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message, redirectTo: "/user-login" }
        }
        try {
            const res = await fetchC.post(url, {}, { headers: authHeaders.headers });
            return {
                ok: true, data: res
            };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to confirm booking"
            };
        }
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
    getPaymentMethods: async (token?: string): Promise<PaymentMethodsResult> => {
        const url = "/user/booking/payment-methods";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message, redirectTo: "/user-login" };
        }
        try {
            const paymentMethods: IPaymentMethod[] = await fetchC.get(url, { headers: authHeaders.headers });
            return { ok: true, data: paymentMethods };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to fetch payment methods"
            };
        }
    },
    cancelCurrent: async (token?: string): Promise<{ ok: boolean; message?: string; error?: string }> => {
        const url = "/user/booking/current/cancel";
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) {
            return { ok: false, error: authHeaders.message };
        }
        try {
            const res = await fetchC.post(url, {}, { headers: authHeaders.headers });
            return { ok: true, message: res.message || "Booking cancelled" };
        } catch (error) {
            return {
                ok: false,
                error: (error as Error)?.message || "Failed to cancel booking"
            };
        }
    },
    downloadReceipt: async (id: number, token?: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_BACKEND}/user/booking/${id}/receipt`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const response = await fetch(url, {
            headers: authHeaders.headers as HeadersInit,
        });

        if (!response.ok) throw new Error("Failed to download receipt");
        return await response.blob();
    },
    downloadInvoice: async (id: number, token?: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_BACKEND}/user/booking/${id}/invoice`;
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const response = await fetch(url, {
            headers: authHeaders.headers as HeadersInit,
        });

        if (!response.ok) throw new Error("Failed to download invoice");
        return await response.blob();
    }
};
export default bookingApi;
