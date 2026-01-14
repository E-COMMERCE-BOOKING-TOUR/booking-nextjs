'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { toaster } from '@/components/chakra/toaster';
import { useTranslations } from 'next-intl';

/**
 * SessionMonitor - Monitors session state and handles auto-logout when session expires.
 * Uses localStorage to persist auth state across page refreshes.
 */
export function SessionMonitor({ user }: { user: any }) {
    const t = useTranslations('common');
    const hasShownExpiry = useRef(false);
    console.log(user)
    // useEffect(() => {
    //     // If user is authenticated and session is valid (no error), mark it in localStorage
    //     if (user) {
    //         return;
    //     }

    //     // If session is null/unauthenticated, check if user WAS previously authenticated
    //     if (!hasShownExpiry.current) {
    //         hasShownExpiry.current = true;

    //         // Use setTimeout to avoid flushSync warning
    //         setTimeout(() => {
    //             toaster.create({
    //                 title: t('session_expired_title', { defaultValue: 'Session Expired' }),
    //                 description: t('session_expired_desc', { defaultValue: 'Please log in again to continue.' }),
    //                 type: 'warning',
    //                 duration: 5000,
    //             });

    //             signOut({ redirect: true, callbackUrl: '/user-login' });
    //         }, 0);
    //     }

    // }, [user, t]);

    return null;
}
