import { auth } from "./auth";

/**
 * Helper to fetch the current authenticated user with tokens on the server.
 * Returns null when no valid access token is present.
 */
export const getServerAuth = async () => {
    const session = await auth();

    if (!session?.user || !session.user.accessToken) {
        return null;
    }

    return {
        session,
        user: session.user,
        accessToken: session.user.accessToken,
        refreshToken: session.user.refreshToken,
        accessTokenExpires: session.user.accessTokenExpires,
    };
};
