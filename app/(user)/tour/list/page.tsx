import { Suspense } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { TourListClient } from '@/components/ui/user/tourListClient';

export default function TourListPage() {
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
