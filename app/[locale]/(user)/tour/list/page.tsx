import { Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';
import { TourListClient } from '@/components/ui/user/tourListClient';

export default async function TourListPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <Suspense
            fallback={
                <Center h="50vh">
                    <Spinner size="xl" color="main" />
                </Center>
            }
        >
            <TourListClient />
        </Suspense>
    );
}
