"use server";

import { getServerAuth } from "./getServerAuth";

type AuthHeaderResult =
    | { ok: true; headers: Record<string, string> }
    | { ok: false; message: string; code: "UNAUTHENTICATED" };

/**
 * Build Authorization header using provided token or the current server session.
 * Throws in client contexts because getServerAuth() is server-only.
 */
export const getAuthHeaders = async (token?: string): Promise<AuthHeaderResult> => {
    const accessToken = token ?? (await getServerAuth())?.accessToken;

    if (!accessToken) {
        return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này.", code: "UNAUTHENTICATED" };
    }

    return {
        ok: true,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
};


