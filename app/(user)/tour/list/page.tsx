import { Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';
import { TourListClient } from '@/components/ui/user/tourListClient';
import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';

export default async function TourListPage() {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return (
        <Suspense
            fallback={
                <Center h="50vh">
                    <Spinner size="xl" color="main" />
                </Center>
            }
        >
            <TourListClient lng={lng} />
        </Suspense>
    );
}
