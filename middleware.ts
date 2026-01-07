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
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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

    // 1. Determine locale and pathname without locale
    const localePattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);
    const match = pathname.match(localePattern);
    const locale = match ? match[1] : routing.defaultLocale;
    const pathnameWithoutLocale = pathname.replace(localePattern, '/') || '/';

    // Get the session token
    const cookieName = process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        cookieName,
    });

    const isLoggedIn = !!token;
    const hasAccessToken = !!token?.accessToken;
    const roleName = token?.role?.name?.toLowerCase();
    const isAdmin = roleName === "admin";

    const userPermissions = (token?.role?.permissions || []) as (string | { permission_name: string })[];
    const hasPermission = (p: string) => userPermissions.some(perm =>
        (typeof perm === 'string' ? perm : perm.permission_name) === p
    );
    const hasAnyAdminPermission = userPermissions.some(perm => {
        const name = typeof perm === 'string' ? perm : perm.permission_name;
        return name?.endsWith(":read") || name?.startsWith("system:");
    });

    // Check route types on pathnameWithoutLocale
    const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix);
    const isAuthRoute = isMatchingRoute(pathnameWithoutLocale, authRoutes);
    const isPublicRoute = isMatchingRoute(pathnameWithoutLocale, publicRoutes);
    const isUserRoute = isMatchingRoute(pathnameWithoutLocale, userRoutes);
    const isAdminRoute = isMatchingRoute(pathnameWithoutLocale, adminRoutes);

    // 2. Routing logic
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isPublicRoute) {
        return intlMiddleware(request);
    }

    if (isAdminRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            return NextResponse.redirect(new URL(`/${locale}/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        } else if (isAdmin) {
            // Absolute access for admin role
            return intlMiddleware(request);
        } else {
            // Check granular permissions for non-admin roles
            let allowed = false;

            // Find the longest matching sub-route key
            const matchingSubRoute = Object.keys(adminSubRoutePermissions)
                .filter(route => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`))
                .sort((a, b) => b.length - a.length)[0];

            if (matchingSubRoute) {
                const requiredPermission = adminSubRoutePermissions[matchingSubRoute];
                allowed = hasPermission(requiredPermission);
            } else if (pathnameWithoutLocale === "/admin" || pathnameWithoutLocale === "/admin/dashboard") {
                // Allow dashboard if they have any admin-level permission OR are a supplier
                allowed = hasAnyAdminPermission || roleName === "supplier";
            }

            if (allowed) {
                return intlMiddleware(request);
            } else {
                // If they have some admin access, redirect to dashboard, otherwise to home
                const redirectTo = hasAnyAdminPermission ? `/${locale}/admin` : `/${locale}`;
                return NextResponse.redirect(new URL(redirectTo, request.url));
            }
        }
    }

    if (isUserRoute) {
        if (!isLoggedIn || !hasAccessToken) {
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            return NextResponse.redirect(new URL(`/${locale}/user-login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
        } else {
            return intlMiddleware(request);
        }
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(`/${locale}/`, request.url));
        } else {
            return intlMiddleware(request);
        }
    }

    return intlMiddleware(request);
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