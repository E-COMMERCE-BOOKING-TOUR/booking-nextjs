"use client";

import { useQuery } from '@tanstack/react-query';
import { adminTourApi } from '@/apis/admin/tour';
import TourWizard from '@/components/admin/tour-wizard/TourWizard';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditTourPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const { data: tour, isLoading } = useQuery({
        queryKey: ['admin-tour', id],
        queryFn: () => adminTourApi.getById(id as string, token),
        enabled: !!id && !!token,
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <TourWizard tourId={id as string} initialData={tour} />;
}
