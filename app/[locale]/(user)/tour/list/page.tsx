import { Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';
import { TourListClient } from '@/components/ui/user/tourListClient';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'common' });

    return {
        title: t('tours', { defaultValue: 'Explore Tours' }) + ' | Travel',
        description: t('finding_adventures', { defaultValue: 'Find your next adventure with our curated travel tours.' }),
    };
}

export default async function TourListPage() {
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
