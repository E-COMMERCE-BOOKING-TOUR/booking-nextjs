"use server";

import { userApi } from "@/apis/user";
import { auth, signOut } from "@/libs/auth/auth";
import { DEFAULT_URL_LOGIN_REDIRECT } from "@/libs/auth/routes";

const logout = async (targetUrl?: string) => {
    const session = await auth();
    const accessToken = session?.user?.accessToken;

    if (accessToken) {
        try {
            await userApi.signOut(accessToken);
        } catch (error) {
            console.error("[AUTH] Backend logout failed", error);
        }
    }

    return await signOut({
        redirectTo: targetUrl || DEFAULT_URL_LOGIN_REDIRECT || "/",
    });
}

export default logout;