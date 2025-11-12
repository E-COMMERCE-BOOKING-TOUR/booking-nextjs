import { CredentialsSignin, Session, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authApi from "@/apis/auth";
import { LoginSchema } from "@/schemas";
import { JWT } from "next-auth/jwt";
import { userApi } from "@/apis/user";

export default {
    providers: [
        Credentials({
            authorize: async (credentials, request) => {
                const validatedFields = LoginSchema.safeParse(credentials)
                if (validatedFields.success) {
                    const { username, password } = validatedFields.data;
                    try {
                        const loginResponse = await authApi.login(username, password);
                        const accessToken = loginResponse.token.access_token;
                        const userInfoResponse = await userApi.info(accessToken);
                        const userData = { 
                            ...userInfoResponse, 
                            token: accessToken 
                        };
                        return userData;
                    } catch (e) {
                        // Get error message from API response
                        const errorMessage = e instanceof Error ? e.message : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
                        console.error("[AUTH] Login failed:", errorMessage);
                        // Return null to trigger CredentialsSignin error
                        return null;
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        jwt: async ({ token, user, trigger }) => {
            if (trigger === "update" && token.token) {
                const newInfo = await userApi.info(token.token);
                if (typeof newInfo.full_name !== "undefined") {
                    token.name = newInfo.full_name;
                    token.email = newInfo.email;
                    token.role = newInfo.role;
                }
            }

            if (user) {
                return {
                    ...token,
                    uuid: user.uuid,
                    username: user.username,
                    name: user.full_name,
                    email: user.email,
                    token: user.token,
                    role: user.role
                }
            }
            return token;
        },
        session: async ({ session, token }: { session: Session, token: JWT }) => {
            if (token && session.user) {
                session.user = {
                    ...session.user,
                    uuid: token.uuid,
                    username: token.username,
                    email: token.email || session.user.email || "",
                    token: token.token,
                    role: token.role
                }
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    trustHost: true
} satisfies NextAuthConfig