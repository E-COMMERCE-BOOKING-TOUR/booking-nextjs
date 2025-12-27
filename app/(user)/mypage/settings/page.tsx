import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import SettingsPageClient from './SettingsPageClient';

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return <SettingsPageClient lng={lng} />;
}
