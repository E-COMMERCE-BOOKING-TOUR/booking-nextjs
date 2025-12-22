import {
    adminRoutes,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
    userRoutes
} from "./libs/auth/routes";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const pathname = nextUrl.pathname;

    // Get the session token
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const hasAccessToken = !!token?.accessToken;
    const isAdmin = token?.role?.name?.toLowerCase() === "admin";

    // Check route types
    const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = isMatchingRoute(pathname, authRoutes);
    const isPublicRoute = isMatchingRoute(pathname, publicRoutes);
    const isUserRoute = isMatchingRoute(pathname, userRoutes);
    const isAdminRoute = isMatchingRoute(pathname, adminRoutes);

    // 1. Always allow API auth routes (login, register, etc.)
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // 2. Allow public routes without any checks
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // 3. Admin routes require admin role
    if (isAdminRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            return NextResponse.redirect(new URL(`/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // 4. User protected routes require authentication
    if (isUserRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            return NextResponse.redirect(new URL(`/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        }
        return NextResponse.next();
    }

    // 5. Auth routes (login, register) - redirect to home if already logged in
    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // 6. Default: allow the request
    return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

/**
 * Check if pathname matches any route in the routes array
 */
function isMatchingRoute(pathname: string, routes: string[]): boolean {
    return routes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );
}