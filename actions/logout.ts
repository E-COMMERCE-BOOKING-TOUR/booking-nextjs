"use server";

import { userApi } from "@/apis/user";
import { auth, signOut } from "@/libs/auth/auth";
import { DEFAULT_URL_LOGIN_REDIRECT } from "@/libs/auth/routes";
import { redirect } from "next/navigation";

const logout = async () => {
    const session = await auth();
    try {
        await signOut({
            redirect: false
        });
        await userApi.signOut(session?.user.accessToken ?? "");
    } catch (error) {
        return { message: "Thất bại khi đăng xuất" }
    } finally {
        DEFAULT_URL_LOGIN_REDIRECT && redirect(DEFAULT_URL_LOGIN_REDIRECT);
    }
}

export default logout;