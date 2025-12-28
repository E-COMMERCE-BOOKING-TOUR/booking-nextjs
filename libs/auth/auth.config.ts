import { Session, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authApi from "@/apis/auth";
import { LoginSchema } from "@/schemas";
import { JWT } from "next-auth/jwt";
import { userApi } from "@/apis/user";

/**
 * Decode JWT expiry or fall back to a short-lived default window.
 */
const getAccessTokenExpiry = (accessToken?: string) => {
    if (!accessToken) return undefined;
    try {
        const [, payload] = accessToken.split(".");
        const { exp } = JSON.parse(Buffer.from(payload, "base64").toString());
        if (exp) {
            return exp * 1000; // convert to ms
        }
    } catch (error) {
        console.warn("[AUTH] Unable to decode access token exp", error);
    }
    return Date.now() + 10 * 60 * 1000;
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
    if (!token.refreshToken) {
        return {
            ...token,
            accessToken: undefined,
            accessTokenExpires: undefined,
            error: "MissingRefreshToken",
        };
    }

    try {
        const refreshed = await authApi.refresh(token.refreshToken);
        const newAccessToken = refreshed.token.access_token;
        const newRefreshToken = refreshed.token.refresh_token || token.refreshToken;
        const accessTokenExpires = getAccessTokenExpiry(newAccessToken);

        return {
            ...token,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            accessTokenExpires,
            error: undefined,
        };
    } catch (error) {
        console.error("[AUTH] Refresh token failed", error);
        return {
            ...token,
            accessToken: undefined,
            refreshToken: undefined,
            accessTokenExpires: undefined,
            error: "RefreshAccessTokenError",
        };
    }
};

export default {
    providers: [
        Credentials({
            authorize: async (credentials) => {
                const validatedFields = LoginSchema.safeParse(credentials)
                if (validatedFields.success) {
                    const { username, password } = validatedFields.data;
                    const guestId = credentials.guest_id as string | undefined;
                    try {
                        const loginResponse = await authApi.login(username, password, guestId);
                        const accessToken = loginResponse.token.access_token;
                        const refreshToken = loginResponse.token.refresh_token;
                        const userInfoResponse = await userApi.info(accessToken);
                        const userData = {
                            ...userInfoResponse,
                            id: userInfoResponse.id.toString(),
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            accessTokenExpires: getAccessTokenExpiry(accessToken),
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
            if (trigger === "update" && token.accessToken) {
                const newInfo = await userApi.info(token.accessToken);
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
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    accessTokenExpires: user.accessTokenExpires,
                    role: user.role,
                    error: undefined,
                }
            }

            // If we have a valid, unexpired token, return it
            if (token.accessToken && token.accessTokenExpires && Date.now() < (token.accessTokenExpires - 30_000)) {
                return token;
            }

            // Otherwise, try to refresh using the refresh token
            return await refreshAccessToken(token);
        },
        session: async ({ session, token }: { session: Session, token: JWT }) => {
            // If refresh failed or we lost tokens, invalidate session
            if (token.error === "RefreshAccessTokenError" || token.error === "MissingRefreshToken") {
                return null as unknown as Session;
            }

            if (token && session.user) {
                session.user = {
                    ...session.user,
                    uuid: token.uuid,
                    username: token.username,
                    email: token.email || session.user.email || "",
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    accessTokenExpires: token.accessTokenExpires,
                    role: token.role,
                    error: token.error,
                }
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    trustHost: true
} satisfies NextAuthConfig