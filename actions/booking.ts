"use server";

import { bookingApi, CreateBookingDTO } from "@/apis/booking";
import { getServerAuth } from "@/libs/auth/getServerAuth";

type CreateBookingResult =
    | { ok: true; data: any }
    | { ok: false; message: string; code?: "UNAUTHENTICATED" | "ERROR" | "CONFIG_ERROR" };

export const createBooking = async (
    payload: CreateBookingDTO
): Promise<CreateBookingResult> => {
    const auth = await getServerAuth();
    if (!auth?.accessToken) {
        return {
            ok: false,
            message: "Bạn cần đăng nhập để đặt tour.",
            code: "UNAUTHENTICATED",
        };
    }

    try {
        const res = await bookingApi.create(payload, auth.accessToken);
        return { ok: true, data: res };
    } catch (error: any) {
        if (error?.message?.includes("BACKEND API base URL is not configured")) {
            return {
                ok: false,
                message: "Thiếu cấu hình BACKEND API (API_BACKEND_CONTAINER hoặc NEXT_PUBLIC_API_BACKEND).",
                code: "CONFIG_ERROR",
            };
        }
        return {
            ok: false,
            message: error?.message || "Đặt tour thất bại. Vui lòng thử lại.",
            code: "ERROR",
        };
    }
};


