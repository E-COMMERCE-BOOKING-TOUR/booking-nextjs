import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import ChangePasswordPageClient from './ChangePasswordPageClient';

export default async function ChangePasswordPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return <ChangePasswordPageClient lng={lng} />;
}
