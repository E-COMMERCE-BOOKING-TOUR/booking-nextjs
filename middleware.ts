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
import { fallbackLng, languages, cookieName } from './libs/i18n/settings'

function getLocale(request: NextRequest) {
    // 1. Check cookie
    const cookieLocale = request.cookies.get(cookieName)?.value
    if (cookieLocale && languages.includes(cookieLocale)) return cookieLocale

    // 2. Check header
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
        const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0]
        if (languages.includes(preferredLanguage)) return preferredLanguage
    }

    // 3. Fallback
    return fallbackLng
}

// Map admin sub-routes to their required base "read" permission
const adminSubRoutePermissions: Record<string, string> = {
    "/admin/tour": "tour:read",
    "/admin/booking": "booking:read",
    "/admin/users": "user:read",
    "/admin/suppliers": "supplier:read",
    "/admin/roles": "role:read",
    "/admin/division": "division:read",
    "/admin/currency": "currency:read",
    "/admin/notification": "notification:read",
    "/admin/review": "review:read",
    "/admin/social": "article:read",
    "/admin/static-pages": "article:read",
    "/admin/message": "system:admin",
    "/admin/settings": "system:config",
};

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const pathname = nextUrl.pathname;

    // 1. Language detection (Must happen before potential early returns)
    const lng = getLocale(request);

    // Get the session token
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const hasAccessToken = !!token?.accessToken;
    const roleName = token?.role?.name?.toLowerCase();
    const isAdmin = roleName === "admin";

    const userPermissions = (token?.role?.permissions || []) as any[];
    const hasPermission = (p: string) => userPermissions.some(perm =>
        (typeof perm === 'string' ? perm : perm.permission_name) === p
    );
    const hasAnyAdminPermission = userPermissions.some(perm => {
        const name = typeof perm === 'string' ? perm : perm.permission_name;
        return name?.endsWith(":read") || name?.startsWith("system:");
    });

    // Check route types
    const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = isMatchingRoute(pathname, authRoutes);
    const isPublicRoute = isMatchingRoute(pathname, publicRoutes);
    const isUserRoute = isMatchingRoute(pathname, userRoutes);
    const isAdminRoute = isMatchingRoute(pathname, adminRoutes);

    let response: NextResponse | null = null;

    // 2. Routing logic
    if (isApiAuthRoute) {
        response = NextResponse.next();
    } else if (isPublicRoute) {
        response = NextResponse.next();
    } else if (isAdminRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            response = NextResponse.redirect(new URL(`/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        } else if (isAdmin) {
            // Absolute access for admin role
            response = NextResponse.next();
        } else {
            // Check granular permissions for non-admin roles
            let allowed = false;

            // Find the longest matching sub-route key
            const matchingSubRoute = Object.keys(adminSubRoutePermissions)
                .filter(route => pathname === route || pathname.startsWith(`${route}/`))
                .sort((a, b) => b.length - a.length)[0];

            if (matchingSubRoute) {
                const requiredPermission = adminSubRoutePermissions[matchingSubRoute];
                allowed = hasPermission(requiredPermission);
            } else if (pathname === "/admin" || pathname === "/admin/dashboard") {
                // Allow dashboard if they have any admin-level permission OR are a supplier
                allowed = hasAnyAdminPermission || roleName === "supplier";
            }

            if (allowed) {
                response = NextResponse.next();
            } else {
                // If they have some admin access, redirect to dashboard, otherwise to home
                const redirectTo = hasAnyAdminPermission ? "/admin" : "/";
                response = NextResponse.redirect(new URL(redirectTo, request.url));
            }
        }
    } else if (isUserRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            response = NextResponse.redirect(new URL(`/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        } else {
            response = NextResponse.next();
        }
    } else if (isAuthRoute) {
        if (isLoggedIn) {
            response = NextResponse.redirect(new URL("/", request.url));
        } else {
            response = NextResponse.next();
        }
    } else {
        response = NextResponse.next();
    }

    // 3. Set language cookie if not present or different
    if (!request.cookies.has(cookieName) || request.cookies.get(cookieName)?.value !== lng) {
        response.cookies.set(cookieName, lng, { path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
    }

    return response;
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