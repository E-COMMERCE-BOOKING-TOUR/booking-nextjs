import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return <NotificationsPageClient lng={lng} />;
}
