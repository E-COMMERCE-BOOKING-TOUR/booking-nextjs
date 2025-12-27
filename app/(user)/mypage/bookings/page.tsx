import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import BookingsPageClient from './BookingsPageClient';

export default async function BookingsPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return <BookingsPageClient lng={lng} />;
}
