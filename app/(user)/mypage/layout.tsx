import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import MyPageLayoutClient from './MyPageLayoutClient';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return (
        <MyPageLayoutClient lng={lng}>
            {children}
        </MyPageLayoutClient>
    );
}
