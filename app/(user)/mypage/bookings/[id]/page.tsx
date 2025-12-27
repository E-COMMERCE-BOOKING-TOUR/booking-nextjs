import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import BookingDetailPageClient from './BookingDetailPageClient';

// Add this to handle params in Server Component properly
export default async function BookingDetailPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return <BookingDetailPageClient lng={lng} />;
}
